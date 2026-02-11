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

@Suite("SaveFileService")
struct SaveFileServiceTests {

    // MARK: - Error enum

    @Test("all SaveFileServiceError cases have errorDescription, failureReason, and recoverySuggestion")
    func allErrorCasesAreFullyLocalized() {
        let cases: [SaveFileServiceError] = [.noBase64DataProvided, .invalidBase64Data, .destinationFolderIsNotAvailable]
        for errorCase in cases {
            #expect(errorCase.errorDescription != nil)
            #expect(errorCase.failureReason != nil)
            #expect(errorCase.recoverySuggestion != nil)
        }
    }

    // MARK: - Error paths

    @Test("saveFile throws when base64Data is missing from payload")
    func saveFileThrowsWhenBase64DataMissing() {
        #expect(throws: (any Error).self) {
            try SaveFileService.saveFile(["filename": "test.txt"])
        }
    }

    @Test("saveFile throws when base64Data is wrong type")
    func saveFileThrowsWhenBase64DataWrongType() {
        #expect(throws: (any Error).self) {
            try SaveFileService.saveFile(["base64Data": 12345])
        }
    }

    @Test("saveFile throws for invalid base64 string")
    func saveFileThrowsForInvalidBase64() {
        #expect(throws: (any Error).self) {
            try SaveFileService.saveFile(["base64Data": "!!!not-base64!!!"])
        }
    }

    @Test("saveFile throws when payload is empty")
    func saveFileThrowsWhenPayloadEmpty() {
        #expect(throws: (any Error).self) {
            try SaveFileService.saveFile([:])
        }
    }
}
