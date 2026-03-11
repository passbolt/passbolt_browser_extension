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
// @since         v1.0
//

import Foundation
import AppKit

enum SaveFileServiceError: LocalizedError {
    case noBase64DataProvided
    case invalidBase64Data
    case destinationFolderIsNotAvailable

    var errorDescription: String? {
        switch self {
        case .noBase64DataProvided:
            return "No base64 data was provided"
        case .invalidBase64Data:
            return "The provided base64 data is invalid or corrupted"
        case .destinationFolderIsNotAvailable:
            return "The destination folder is not available or inaccessible"
        }
    }

    var failureReason: String? {
        switch self {
        case .noBase64DataProvided:
            return "The payload did not contain the required 'base64Data' field"
        case .invalidBase64Data:
            return "Base64 decoding failed"
        case .destinationFolderIsNotAvailable:
            return "Unable to access the Downloads directory"
        }
    }

    var recoverySuggestion: String? {
        switch self {
        case .noBase64DataProvided:
            return "Ensure the payload includes a 'base64Data' field"
        case .invalidBase64Data:
            return "Verify the base64 encoding is correct"
        case .destinationFolderIsNotAvailable:
            return "Check file system permissions and disk space"
        }
    }
}

final class SaveFileService {
    
    public static func saveFile(_ payload: [String: Any]) throws -> String {
        let filename = (payload["filename"] as? String) ?? "export.txt"

        guard let base64Data = payload["base64Data"] as? String else {
            throw locatedError(SaveFileServiceError.noBase64DataProvided)
        }

        guard let fileData = Data(base64Encoded: base64Data) else {
            throw locatedError(SaveFileServiceError.invalidBase64Data)
        }

        guard let root = destinationRootURL() else {
            throw locatedError(SaveFileServiceError.destinationFolderIsNotAvailable)
        }

        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        let dest = uniqueURL(in: root, suggestedName: filename)
        try fileData.write(to: dest, options: .atomic)

        // Open the finder to show the download file in it's location
        NSWorkspace.shared.activateFileViewerSelecting([dest])

        return dest.path
    }

    private static func destinationRootURL() -> URL? {
        guard let downloads = FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask).first else {
            return nil
        }
        return downloads
    }

    private static func uniqueURL(in dir: URL, suggestedName: String) -> URL {
        let baseURL = dir.appendingPathComponent(suggestedName)

        if !FileManager.default.fileExists(atPath: baseURL.path) {
            return baseURL
        }

        let ext = baseURL.pathExtension
        let stem = baseURL.deletingPathExtension().lastPathComponent

        for i in 1...99 {
            let candidate = dir.appendingPathComponent("\(stem) (\(i))" + (ext.isEmpty ? "" : ".\(ext)"))
            if !FileManager.default.fileExists(atPath: candidate.path) {
                return candidate
            }
        }

        // Fallback: UUID
        return dir.appendingPathComponent("\(stem)-\(UUID().uuidString)" + (ext.isEmpty ? "" : ".\(ext)"))
    }
}
