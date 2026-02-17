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

enum SafariExtensionError: Int {
    case missingMessage = 1
    case missingAction = 2
    case unsupportedAction = 3
    case controllerExecutionFailed = 4
    case unknownError = 999
}

let routes: [String: AbstractController.Type] = [
    "save-file": SaveFileController.self,
    "fetch": FetchController.self,
    "open-safari-settings": OpenSafariSettingsController.self,
]

// Entry point of the Application part of the Safari extension.
// It is mainly used to handle request from the extension
final class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    private let errorController = ErrorController()

    // Handles request coming form the extension using `chrome.runtime.sendNativeMessage`
    func beginRequest(with context: NSExtensionContext) {
        guard
            let item = context.inputItems.first as? NSExtensionItem,
            let payload = item.userInfo?[SFExtensionMessageKey] as? [String: Any]
        else {
            let error = locatedNSError(
                domain: "SafariExtension",
                code: SafariExtensionError.missingMessage.rawValue,
                description: "Bad or missing message"
            )
            errorController.run(context, ["error": ErrorSerializer.serialize(error)], profileUUID: "unknown")
            return
        }

        // SECURITY: Extract profile UUID for session isolation
        // SFExtensionProfileKey provides the Safari profile identifier (macOS 14+)
        let profileUUID: String
        if let uuid = item.userInfo?[SFExtensionProfileKey] as? UUID {
            profileUUID = uuid.uuidString
        } else if let str = item.userInfo?[SFExtensionProfileKey] as? String {
            profileUUID = str
        } else {
            profileUUID = "default"
        }

        guard let action = payload["action"] as? String else {
            let error = locatedNSError(
                domain: "SafariExtension",
                code: SafariExtensionError.missingAction.rawValue,
                description: "No action is provided, cannot execute request"
            )
            errorController.run(context, ["error": ErrorSerializer.serialize(error)], profileUUID: profileUUID)
            return
        }

        if let controllerType = routes[action] {
            do {
                let controller = controllerType.init()
                try controller.run(context, payload, profileUUID: profileUUID)
            } catch {
                errorController.run(context, ["error": ErrorSerializer.serialize(error)], profileUUID: profileUUID)
            }
            return
        }

        let error = locatedNSError(
            domain: "SafariExtension",
            code: SafariExtensionError.unsupportedAction.rawValue,
            description: "Unsupported action: \(action)"
        )
        errorController.run(context, ["error": ErrorSerializer.serialize(error)], profileUUID: profileUUID)
    }
}
