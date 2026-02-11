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
// @since         v5.7.0
//

import Foundation

/// Wraps an error with source location information for debugging
struct LocatedError: LocalizedError {
    let underlyingError: Error
    let file: String
    let line: Int
    let function: String

    var errorDescription: String? {
        (underlyingError as? LocalizedError)?.errorDescription ?? underlyingError.localizedDescription
    }

    var failureReason: String? {
        (underlyingError as? LocalizedError)?.failureReason
    }

    var recoverySuggestion: String? {
        (underlyingError as? LocalizedError)?.recoverySuggestion
    }
}

/// Extracts just the filename from a #fileID path (e.g., "Module/File.swift" -> "File.swift")
private func extractFilename(from fileID: String) -> String {
    if let lastSlash = fileID.lastIndex(of: "/") {
        return String(fileID[fileID.index(after: lastSlash)...])
    }
    return fileID
}

/// Creates a located error that captures source location at the call site
/// - Parameters:
///   - error: The error to wrap with location information
///   - file: Source file (auto-captured via #fileID)
///   - line: Line number (auto-captured via #line)
///   - function: Function name (auto-captured via #function)
/// - Returns: A LocatedError wrapping the original error with location info
func locatedError(
    _ error: Error,
    file: String = #fileID,
    line: Int = #line,
    function: String = #function
) -> LocatedError {
    LocatedError(underlyingError: error, file: extractFilename(from: file), line: line, function: function)
}

/// Creates a located NSError with source location stored in userInfo
/// - Parameters:
///   - domain: The error domain
///   - code: The error code
///   - description: Localized description
///   - file: Source file (auto-captured via #fileID)
///   - line: Line number (auto-captured via #line)
///   - function: Function name (auto-captured via #function)
/// - Returns: An NSError with location info in userInfo
func locatedNSError(
    domain: String,
    code: Int,
    description: String,
    file: String = #fileID,
    line: Int = #line,
    function: String = #function
) -> NSError {
    NSError(
        domain: domain,
        code: code,
        userInfo: [
            NSLocalizedDescriptionKey: description,
            "file": extractFilename(from: file),
            "line": line,
            "function": function
        ]
    )
}
