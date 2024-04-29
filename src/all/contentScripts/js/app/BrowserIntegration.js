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
 * @since        3.4.0
 */
import {BrowserIntegrationBootstrap} from "passbolt-styleguide/src/react-web-integration/BrowserIntegrationBootstrap.js";
import Port from "../../../webAccessibleResources/js/lib/port";
import MessageService from "../service/messageService";
import ConnectPortController from "../controller/connectPortController";
import MessageEventHandler from "../message/messageEventHandler";

async function main() {
  // Make the port object as a global variable to use it directly (TODO the port could be use in props)
  self.port = new Port(self.portname);
  // Emit a success if the port is still connected
  port.on("passbolt.port.check", requestId => self.port.emit(requestId, "SUCCESS"));
  await self.port.connect();
  // Message listener
  const messageService = new MessageService();
  const messageEventHandler = new MessageEventHandler(messageService);
  messageEventHandler.listen("passbolt.port.connect", ConnectPortController, port);
  BrowserIntegrationBootstrap.init();
}

main();
