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

@available(macOSApplicationExtension 12.0, *)
final class FetchService {
    
    // Runs a fetch on the API.
    // It expects a payload set from the extention with the possible property
    //   url: The URL to send to request to
    //   options["method"]: the HTTP method to use
    //   options["body"]: the HTTP body of the request
    //   options["headers"]: the HTTP headers to send along with the request
    //   options["cookies"]: the specific Cookies (HTTP serialized) to set on the request
    static func fetch(url: URL, options: [String: Any]) async throws -> [String: Any] {
        let method = options["method"] as? String ?? "GET"
        let body = options["body"] as? String ?? ""
        let headers = options["headers"] as? [String: String] ?? [:]
        let cookies = options["cookies"] as? String ?? nil
        
        var httpRequest = URLRequest(url: url)
        httpRequest.httpMethod = method
        httpRequest.httpBody = body.data(using: .utf8)
        
        for header in headers {
            httpRequest.setValue(String(describing: header.value), forHTTPHeaderField: String(describing: header.key))
        }
        
        if (cookies != nil) {
            httpRequest.setValue(cookies, forHTTPHeaderField: "Cookie")
        }

        return try await doFetch(request: httpRequest)
    }
    
    // The actual fetch sent to the API
    private static func doFetch(request: URLRequest) async throws -> [String: Any] {
        let (data, response) = try await URLSession.shared.data(for: request)

        let responseJSON = try! JSONSerialization.jsonObject(with: data, options: [])
        let httpResponse = response as! HTTPURLResponse
        let headers = httpResponse.allHeaderFields
        let statusCode = httpResponse.statusCode

        return [
            "headers": headers,
            "body": responseJSON,
            "status": statusCode
        ]
    }
}
