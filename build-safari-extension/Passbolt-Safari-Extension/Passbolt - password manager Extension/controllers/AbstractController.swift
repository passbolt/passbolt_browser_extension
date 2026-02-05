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
import SafariServices

protocol AbstractController {
    init()
    func run(_ context: NSExtensionContext, _ payload: [String: Any]) throws -> Void
}

extension AbstractController {
    // Respond to the extension with a success message
    // This should be used after finishing treating the request from the extension
    func respondAsSuccess(_ context: NSExtensionContext, _ responseBody: [String: Any]?) {
        var body: [String: Any] = [
            "success": true,
        ]

        if (responseBody != nil) {
            body["returnedValue"] = responseBody
        }

        self.respond(context, body)
    }

    // Respond to the extension with an error
    // This should be used after aborting the request from the extension
    func respondAsError(_ context: NSExtensionContext, _ error: Error) {
        let body: [String: Any] = [
            "success": false,
            "error": ErrorSerializer.serialize(error)
        ]

        self.respond(context, body)
    }

    // Sends the response to the extension
    internal func respond(_ context: NSExtensionContext, _ responseBody: [String: Any] = [:]) {
        let reply = NSExtensionItem()
        reply.userInfo = [ SFExtensionMessageKey: responseBody ]
        context.completeRequest(returningItems: [reply], completionHandler: nil)
    }
}
