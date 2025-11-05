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
import SafariServices

@available(macOSApplicationExtension 12.0, *)
let routes: [String: AbstractController.Type] = [
    "save-file": SaveFileController.self,
    "fetch": FetchController.self,
]

// Entry point of the Application part of the Safari extension.
// It is mainly used to handle request from the extension
@available(macOSApplicationExtension 12.0, *)
final class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    private let errorController = ErrorController()

    // Handles request coming form the extension using `chrome.runtime.sendNativeMessage`
    func beginRequest(with context: NSExtensionContext) {
        guard
            let item = context.inputItems.first as? NSExtensionItem,
            let payload = item.userInfo?[SFExtensionMessageKey] as? [String: Any]
        else {
            errorController.run(context, ["error": "Bad or missing message"]);
            return;
        }

        guard let action = payload["action"] as? String else {
            errorController.run(context, ["error": "No action is provided, cannot excute request"]);
            return;
        }

        if let controllerType = routes[action] {
            do {
                let controller = controllerType.init()
                try controller.run(context, payload)
            } catch {
                errorController.run(context, ["error": error.localizedDescription]);
            }
            return
        }

        errorController.run(context, ["error": "Unsupported action: \(action)"]);
        return;
    }
}
