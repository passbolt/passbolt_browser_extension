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

async function main() {
  // Make the port object as a global variable to use it directly (TODO the port could be use in props)
  self.port = new Port(self.portname);
  await self.port.connect();
  BrowserIntegrationBootstrap.init();
}

main();
