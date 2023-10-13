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
import ReactDOM from "react-dom";
import ExtBootstrapRecover from "passbolt-styleguide/src/react-extension/ExtBootstrapRecover";
import Port from "../../../webAccessibleResources/js/lib/port";
import MessageService from "../service/messageService";
import MessageEventHandler from "../message/messageEventHandler";
import ConnectPortController from "../controller/connectPortController";

async function main() {
  // Port connection
  const port = new Port(self.portname);
  // Emit a success if the port is still connected
  port.on("passbolt.port.check", requestId => port.emit(requestId, "SUCCESS"));
  await port.connect();
  // Message listener
  const messageService = new MessageService();
  const messageEventHandler = new MessageEventHandler(messageService);
  messageEventHandler.listen("passbolt.port.connect", ConnectPortController, port);
  // Start ExtBootstrapRecover
  console.log("test")
  const browserExtensionUrl = chrome.runtime.getURL("/");
  console.log("test", browserExtensionUrl)
  const domContainer = document.createElement("div");
  console.log("test", domContainer)
  document.body.appendChild(domContainer);
  console.log("append", domContainer, document)
  ReactDOM.render(<ExtBootstrapRecover port={port} browserExtensionUrl={browserExtensionUrl}/>, domContainer);
}

main();
