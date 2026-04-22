/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since        3.0.0
 */
import React from "react";
import { createRoot } from "react-dom/client";
import ExtBootstrapLogin from "passbolt-styleguide/src/react-extension/ExtBootstrapLogin";
import Port from "../../../webAccessibleResources/js/lib/port";
import MessageService from "../service/messageService";
import MessageEventHandler from "../message/messageEventHandler";
import ConnectPortController from "../controller/connectPortController";

async function main() {
  // Port connection
  const port = new Port(self.portname);
  // Emit a success if the port is still connected
  port.on("passbolt.port.check", (requestId) => port.emit(requestId, "SUCCESS"));
  await port.connect();
  // Message listener
  const messageService = new MessageService();
  const messageEventHandler = new MessageEventHandler(messageService);
  messageEventHandler.listen("passbolt.port.connect", ConnectPortController, port);
  // Start ExtBootstrapLogin
  const browserExtensionUrl = chrome.runtime.getURL("/");
  const domContainer = document.createElement("div");
  document.body.appendChild(domContainer);

  /*
   * Empty unload handler to prevent Chrome from caching this page in BFCache.
   * Without this, navigating away and back to an API-served page may restore
   * it from BFCache with a dead extension message port, preventing the
   * extension from re-initializing.
   *
   * Temporary: Chrome is deprecating unload, replace with proper BFCache handling.
   * See: PB-50644
   */
  window.addEventListener("unload", () => {});

  const root = createRoot(domContainer);
  root.render(<ExtBootstrapLogin port={port} browserExtensionUrl={browserExtensionUrl} />);
}

main();
