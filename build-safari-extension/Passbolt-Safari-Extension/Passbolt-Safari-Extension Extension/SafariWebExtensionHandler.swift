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

// Entry point of the Application part of the Safari extension.
// It is mainly used to handle request from the extension
@available(macOSApplicationExtension 12.0, *)
final class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    func beginRequest(with context: NSExtensionContext) {
        guard
            let item = context.inputItems.first as? NSExtensionItem,
            let payload = item.userInfo?[SFExtensionMessageKey] as? [String: Any]
        else {
            return respond(context, error: "Bad or missing message")
        }

        guard let action = payload["action"] as? String else {
            return respond(context, error: "No action is provided, cannot excute request")
        }

        if action == "save-file" {
            return runSaveFile(context, payload)
        }

        return respond(context, error: "Unsupported action: \(action)");
    }

    private func runSaveFile(_ context: NSExtensionContext, _ payload: [String: Any]) {
        do {
            let destinationPath = try SaveFileService.saveFile(payload)
            respond(context, extra: ["path": destinationPath])
        } catch {
            respond(context, error: error.localizedDescription)
        }
    }

    private func respond(_ context: NSExtensionContext, error: String? = nil, extra: [String: Any] = [:]) {
        var body: [String: Any] = [:]

        if let error {
            body["ok"] = false
            body["error"] = error
        } else {
            body["ok"] = true
        }

        for (k, v) in extra {
            body[k] = v
        }

        let reply = NSExtensionItem()
        reply.userInfo = [ SFExtensionMessageKey: body ]

        context.completeRequest(returningItems: [reply], completionHandler: nil)
    }
}
