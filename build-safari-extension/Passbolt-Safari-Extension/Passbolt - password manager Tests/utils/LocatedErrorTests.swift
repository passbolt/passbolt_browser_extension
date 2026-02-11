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

@Suite("LocatedError")
struct LocatedErrorTests {

    // MARK: - Test Helpers

    enum MockLocalizedError: LocalizedError {
        case sample

        var errorDescription: String? { "Mock error description" }
        var failureReason: String? { "Mock failure reason" }
        var recoverySuggestion: String? { "Mock recovery suggestion" }
    }

    enum MockPlainError: Error {
        case sample
    }

    // MARK: - Tests

    @Test("LocatedError delegates errorDescription, failureReason, and recoverySuggestion to underlying LocalizedError")
    func delegatesLocalizedErrorProperties() {
        let located = LocatedError(underlyingError: MockLocalizedError.sample, file: "F.swift", line: 1, function: "f()")
        #expect(located.errorDescription == "Mock error description")
        #expect(located.failureReason == "Mock failure reason")
        #expect(located.recoverySuggestion == "Mock recovery suggestion")
    }

    @Test("LocatedError returns nil for failureReason and recoverySuggestion when underlying error is not LocalizedError")
    func returnsNilForPlainError() {
        let located = LocatedError(underlyingError: MockPlainError.sample, file: "F.swift", line: 1, function: "f()")
        #expect(located.errorDescription != nil)
        #expect(located.failureReason == nil)
        #expect(located.recoverySuggestion == nil)
    }

    @Test("LocatedError preserves file, line, and function")
    func preservesLocationFields() {
        let located = LocatedError(underlyingError: MockPlainError.sample, file: "SomeFile.swift", line: 99, function: "someFunc()")
        #expect(located.file == "SomeFile.swift")
        #expect(located.line == 99)
        #expect(located.function == "someFunc()")
    }

    @Test("locatedError() extracts filename from fileID paths")
    func extractsFilenameFromFileID() {
        let withSlash = locatedError(MockPlainError.sample, file: "MyModule/SomeFile.swift", line: 10, function: "f()")
        #expect(withSlash.file == "SomeFile.swift")

        let withoutSlash = locatedError(MockPlainError.sample, file: "JustAFile.swift", line: 1, function: "g()")
        #expect(withoutSlash.file == "JustAFile.swift")

        let deepPath = locatedError(MockPlainError.sample, file: "A/B/C/Deep.swift", line: 5, function: "h()")
        #expect(deepPath.file == "Deep.swift")
    }

    @Test("locatedNSError() creates an NSError with domain, code, description, and location in userInfo")
    func locatedNSErrorCreation() {
        let nsError = locatedNSError(domain: "TestDomain", code: 42, description: "Test desc", file: "Module/MyFile.swift", line: 20, function: "doThing()")
        #expect(nsError.domain == "TestDomain")
        #expect(nsError.code == 42)
        #expect(nsError.localizedDescription == "Test desc")
        #expect(nsError.userInfo["file"] as? String == "MyFile.swift")
        #expect(nsError.userInfo["line"] as? Int == 20)
        #expect(nsError.userInfo["function"] as? String == "doThing()")
    }
}
