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

@Suite("SafariWebExtensionHandler")
struct SafariWebExtensionHandlerTests {

    @Test("SafariExtensionError raw values are stable")
    func errorRawValues() {
        #expect(SafariExtensionError.missingMessage.rawValue == 1)
        #expect(SafariExtensionError.missingAction.rawValue == 2)
        #expect(SafariExtensionError.unsupportedAction.rawValue == 3)
        #expect(SafariExtensionError.controllerExecutionFailed.rawValue == 4)
        #expect(SafariExtensionError.unknownError.rawValue == 999)
    }

    @Test("routes map each action to the correct controller")
    func routesMappings() {
        #expect(routes["save-file"] == SaveFileController.self)
        #expect(routes["fetch"] == FetchController.self)
        #expect(routes["open-safari-settings"] == OpenSafariSettingsController.self)
        #expect(routes.count == 3)
    }

    @Test("routes returns nil for unknown action")
    func routesUnknownAction() {
        #expect(routes["nonexistent-action"] == nil)
    }
}
