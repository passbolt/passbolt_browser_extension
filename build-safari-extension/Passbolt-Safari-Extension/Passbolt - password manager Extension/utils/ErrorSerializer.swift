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

/// Serializes Swift errors into dictionaries for JSON transmission to the JavaScript extension
struct ErrorSerializer {

    /// Converts an Error to a dictionary with comprehensive debugging information
    /// - Parameter error: The error to serialize
    /// - Returns: A dictionary containing error details including message, type, domain, code, location, and cause chain
    static func serialize(_ error: Error) -> [String: Any] {
        // Check if this is a LocatedError wrapper and extract location + underlying error
        let (actualError, locationInfo) = extractLocationInfo(from: error)

        var errorDict: [String: Any] = [
            "message": actualError.localizedDescription,
            "type": String(describing: type(of: actualError))
        ]

        // Add location info if available
        if let location = locationInfo {
            errorDict["file"] = location.file
            errorDict["line"] = location.line
            errorDict["function"] = location.function
        }

        // Extract NSError properties - Swift automatically bridges Error to NSError
        let nsError = actualError as NSError
        errorDict["domain"] = nsError.domain
        errorDict["code"] = nsError.code

        if let reason = nsError.localizedFailureReason {
            errorDict["reason"] = reason
        }
        if let suggestion = nsError.localizedRecoverySuggestion {
            errorDict["suggestion"] = suggestion
        }

        // Check for location info in NSError userInfo (for locatedNSError)
        if locationInfo == nil {
            if let file = nsError.userInfo["file"] as? String {
                errorDict["file"] = file
            }
            if let line = nsError.userInfo["line"] as? Int {
                errorDict["line"] = line
            }
            if let function = nsError.userInfo["function"] as? String {
                errorDict["function"] = function
            }
        }

        // Recursively serialize the cause chain
        if let underlying = nsError.userInfo[NSUnderlyingErrorKey] as? Error {
            errorDict["cause"] = serialize(underlying)
        }

        // Include userInfo in debug builds for additional context
        #if DEBUG
        if !nsError.userInfo.isEmpty {
            errorDict["userInfo"] = filterUserInfo(nsError.userInfo)
        }
        #endif

        return errorDict
    }

    /// Extracts location information from a LocatedError wrapper
    /// - Parameter error: The error to check
    /// - Returns: A tuple of the actual error and optional location info
    private static func extractLocationInfo(from error: Error) -> (Error, (file: String, line: Int, function: String)?) {
        if let located = error as? LocatedError {
            return (located.underlyingError, (located.file, located.line, located.function))
        }
        return (error, nil)
    }

    /// Filters userInfo dictionary to include only JSON-serializable types
    /// - Parameter userInfo: The userInfo dictionary from an NSError
    /// - Returns: A filtered dictionary containing only JSON-serializable values
    private static func filterUserInfo(_ userInfo: [String: Any]) -> [String: Any] {
        return userInfo.compactMapValues { value -> Any? in
            switch value {
            case is NSNull, is NSNumber, is String, is Bool:
                return value
            case let dict as [String: Any]:
                return filterUserInfo(dict)
            case let array as [Any]:
                return array
            default:
                // Convert non-serializable types to string representation
                return String(describing: value)
            }
        }
    }
}
