//
// Passbolt - Open source password manager for teams
// Copyright (c) Passbolt SA
//
// This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
// Public License (AGPL) as published by the Free Software Foundation version 3.
//
// The name "Passbolt" is a registered trademark of Passbolt SA, and Passbolt SA hereby declines to grant a trademark
// license to "Passbolt" pursuant to the GNU Affero General Public License version 3 Section 7(e), without a separate
// agreement with Passbolt SA.
//
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
// warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with this program. If not,
// see GNU Affero General Public License v3 (http://www.gnu.org/licenses/agpl-3.0.html).
//
// @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
// @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
// @link          https://www.passbolt.com Passbolt (tm)
// @since         v5.6.0
//

import Foundation

private extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}

final class FetchService {

    // Runs a fetch on the API with profile isolation.
    // It expects a payload set from the extention with the possible property
    //   url: The URL to send to request to
    //   options["method"]: the HTTP method to use
    //   options["body"]: the HTTP body of the request
    //   options["headers"]: the HTTP headers to send along with the request
    //   options["cookies"]: the specific Cookies (HTTP serialized) to set on the request
    //   profileUUID: The Safari profile UUID for session isolation
    static func fetch(url: URL, options: [String: Any], profileUUID: String) async throws -> [String: Any] {
        let method = options["method"] as? String ?? "GET"
        let headers = options["headers"] as? [String: String] ?? [:]
        let cookies = options["cookies"] as? String

        var httpRequest = URLRequest(url: url)
        httpRequest.httpMethod = method

        // Build the body: structured FormData array (may contain files) or plain string
        if let formDataArray = options["body"] as? [[String: Any]] {
            let boundary = UUID().uuidString
            httpRequest.httpBody = buildMultipartBody(formDataArray: formDataArray, boundary: boundary)
            httpRequest.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        } else {
            let body = options["body"] as? String ?? ""
            httpRequest.httpBody = body.data(using: .utf8)
        }

        // SECURITY: Add cache-control headers to prevent response caching
        httpRequest.setValue("no-cache, no-store, must-revalidate", forHTTPHeaderField: "Cache-Control")
        httpRequest.setValue("no-cache", forHTTPHeaderField: "Pragma")

        for header in headers {
            // Skip Content-Type when we already set it for multipart
            if header.key.lowercased() == "content-type" && httpRequest.value(forHTTPHeaderField: "Content-Type")?.contains("multipart") == true {
                continue
            }
            httpRequest.setValue(String(describing: header.value), forHTTPHeaderField: String(describing: header.key))
        }

        // Cookies from extension (already profile-isolated via browser.cookies)
        if (cookies != nil) {
            httpRequest.setValue(cookies, forHTTPHeaderField: "Cookie")
        }

        return try await doFetch(request: httpRequest, profileUUID: profileUUID)
    }

    /// Build a multipart/form-data body from the structured FormData array sent by JavaScript.
    /// Each entry has: key, value, type ("SCALAR" or "FILE"), and optionally name (for files).
    /// File values use the data URL format: "data:<mimeType>;base64,<base64Data>"
    private static func buildMultipartBody(formDataArray: [[String: Any]], boundary: String) -> Data {
        var body = Data()

        for entry in formDataArray {
            guard let key = entry["key"] as? String,
                  let value = entry["value"] as? String,
                  let type = entry["type"] as? String else {
                continue
            }

            let sanitizedKey = sanitizeHeaderValue(key)
            body.append("--\(boundary)\r\n")

            if type == "FILE" {
                let rawFilename = entry["name"] as? String ?? "file"
                let sanitizedFilename = sanitizeFilename(rawFilename)
                let (mimeType, fileData) = decodeDataURL(value)
                let sanitizedMimeType = sanitizeHeaderValue(mimeType)

                body.append("Content-Disposition: form-data; name=\"\(sanitizedKey)\"; filename=\"\(sanitizedFilename)\"\r\n")
                body.append("Content-Type: \(sanitizedMimeType)\r\n\r\n")
                body.append(fileData)
                body.append("\r\n")
            } else {
                body.append("Content-Disposition: form-data; name=\"\(sanitizedKey)\"\r\n\r\n")
                body.append("\(value)\r\n")
            }
        }

        body.append("--\(boundary)--\r\n")
        return body
    }

    /// Sanitize a filename for use in Content-Disposition headers.
    /// Strips path traversal components, quotes, and CRLF characters.
    private static func sanitizeFilename(_ raw: String) -> String {
        let nameOnly = raw.components(separatedBy: CharacterSet(charactersIn: "/\\")).last ?? "file"
        return sanitizeHeaderValue(nameOnly)
    }

    /// Sanitize a value interpolated into an HTTP header by removing quotes and CRLF.
    private static func sanitizeHeaderValue(_ raw: String) -> String {
        raw.replacingOccurrences(of: "\"", with: "")
           .replacingOccurrences(of: "\r", with: "")
           .replacingOccurrences(of: "\n", with: "")
    }

    /// Decode a data URL (e.g. "data:image/png;base64,iVBOR...") into its MIME type and binary data.
    private static func decodeDataURL(_ dataURL: String) -> (mimeType: String, data: Data) {
        let parts = dataURL.components(separatedBy: ",")
        guard parts.count == 2,
              let base64Data = Data(base64Encoded: parts[1]) else {
            return ("application/octet-stream", Data())
        }

        // Extract MIME type from "data:image/png;base64"
        let header = parts[0]
        let mimeType = header
            .replacingOccurrences(of: "data:", with: "")
            .components(separatedBy: ";")
            .first ?? "application/octet-stream"

        return (mimeType, base64Data)
    }

    // The actual fetch sent to the API using a profile-isolated session
    private static func doFetch(request: URLRequest, profileUUID: String) async throws -> [String: Any] {
        // SECURITY: Use profile-specific session, NEVER URLSession.shared
        // This ensures cookies from one profile cannot leak to another
        let session = SecureProfileSessionManager.session(forProfile: profileUUID)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NSError(domain: "FetchService", code: 500,
                          userInfo: [NSLocalizedDescriptionKey: "Response is not HTTP"])
        }
        
        // Try to parse as JSON, fallback to string representation
        let body: Any
        if let jsonBody = try? JSONSerialization.jsonObject(with: data, options: []) {
            body = jsonBody
        } else if let stringBody = String(data: data, encoding: .utf8) {
            body = stringBody
        } else {
            body = NSNull()
        }
        
        let headers = httpResponse.allHeaderFields
        let statusCode = httpResponse.statusCode

        return [
            "headers": headers,
            "body": body,
            "status": statusCode
        ]
    }
}
