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
// @since         v5.10.0
//

import Foundation
import Testing

@Suite("ErrorSerializer")
struct ErrorSerializerTests {

    // MARK: - Test Helpers

    enum MockLocalizedError: LocalizedError {
        case withAllFields
        case withMessageOnly

        var errorDescription: String? {
            switch self {
            case .withAllFields: return "Full error description"
            case .withMessageOnly: return "Only description"
            }
        }
        var failureReason: String? {
            switch self {
            case .withAllFields: return "Something went wrong"
            case .withMessageOnly: return nil
            }
        }
        var recoverySuggestion: String? {
            switch self {
            case .withAllFields: return "Try again"
            case .withMessageOnly: return nil
            }
        }
    }

    enum MockPlainError: Error {
        case generic
    }

    // MARK: - Tests

    @Test("serialize includes message, type, domain, and code for a plain Error")
    func serializePlainError() {
        let dict = ErrorSerializer.serialize(MockPlainError.generic)
        #expect(dict["message"] is String)
        #expect(dict["type"] as? String == "MockPlainError")
        #expect(dict["domain"] is String)
        #expect(dict["code"] is Int)
    }

    @Test("serialize includes reason and suggestion when present, omits them when nil")
    func serializeLocalizedError() {
        let full = ErrorSerializer.serialize(MockLocalizedError.withAllFields)
        #expect(full["reason"] as? String == "Something went wrong")
        #expect(full["suggestion"] as? String == "Try again")

        let partial = ErrorSerializer.serialize(MockLocalizedError.withMessageOnly)
        #expect(partial["reason"] == nil)
        #expect(partial["suggestion"] == nil)
    }

    @Test("serialize extracts file, line, and function from a LocatedError")
    func serializeLocatedError() {
        let located = locatedError(MockLocalizedError.withAllFields, file: "Module/MyFile.swift", line: 42, function: "doStuff()")
        let dict = ErrorSerializer.serialize(located)
        #expect(dict["file"] as? String == "MyFile.swift")
        #expect(dict["line"] as? Int == 42)
        #expect(dict["function"] as? String == "doStuff()")
        #expect(dict["message"] as? String == "Full error description")
        #expect(dict["type"] as? String == "MockLocalizedError")
    }

    @Test("LocatedError location takes precedence over NSError userInfo location")
    func locatedErrorLocationTakesPrecedence() {
        let innerNSError = NSError(domain: "Inner", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "inner",
            "file": "FromUserInfo.swift",
            "line": 999,
            "function": "userInfoFunc()"
        ])
        let located = LocatedError(underlyingError: innerNSError, file: "FromLocated.swift", line: 1, function: "locatedFunc()")
        let dict = ErrorSerializer.serialize(located)
        #expect(dict["file"] as? String == "FromLocated.swift")
        #expect(dict["line"] as? Int == 1)
        #expect(dict["function"] as? String == "locatedFunc()")
    }

    @Test("serialize recursively serializes the cause chain")
    func serializeCauseChain() {
        let rootCause = NSError(domain: "RootCause", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "root cause message"
        ])
        let topError = NSError(domain: "Top", code: 3, userInfo: [
            NSLocalizedDescriptionKey: "top message",
            NSUnderlyingErrorKey: rootCause
        ])

        let dict = ErrorSerializer.serialize(topError)
        #expect(dict["message"] as? String == "top message")

        let cause = dict["cause"] as? [String: Any]
        #expect(cause?["message"] as? String == "root cause message")
        #expect(cause?["domain"] as? String == "RootCause")
    }

    @Test("serialize has no cause key when there is no underlying error")
    func serializeNoCause() {
        let dict = ErrorSerializer.serialize(MockPlainError.generic)
        #expect(dict["cause"] == nil)
    }

    #if DEBUG
    @Test("serialize includes filtered userInfo in DEBUG builds")
    func serializeUserInfoInDebug() {
        let nsError = NSError(domain: "Test", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "test",
            "stringKey": "stringValue",
            "numberKey": NSNumber(value: 42),
            "dateKey": Date(timeIntervalSince1970: 0),
            "nested": ["innerKey": "innerValue"],
            "nullKey": NSNull(),
            "arrayKey": [1, 2, 3]
        ])
        let dict = ErrorSerializer.serialize(nsError)
        let userInfo = dict["userInfo"] as? [String: Any]
        #expect(userInfo != nil)
        #expect(userInfo?["stringKey"] as? String == "stringValue")
        #expect(userInfo?["dateKey"] is String)
        let nested = userInfo?["nested"] as? [String: Any]
        #expect(nested?["innerKey"] as? String == "innerValue")
        #expect(userInfo?["nullKey"] is NSNull)
        #expect(userInfo?["arrayKey"] is [Any])
    }
    #endif
}
