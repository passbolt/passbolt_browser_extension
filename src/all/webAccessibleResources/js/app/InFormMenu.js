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
 * @since         3.4.0
 */
import React from "react";
import ReactDOM from "react-dom";
import ExtInFormMenu from "passbolt-styleguide/src/react-web-integration/ExtInFormMenu";
import Port from "../lib/port";

async function main() {
  const query = new URLSearchParams(window.location.search);
  const portname = query.get('passbolt');
  const port = new Port(portname);
  await port.connect();
  const domContainer = document.createElement("div");
  document.body.appendChild(domContainer);
  ReactDOM.render(React.createElement(ExtInFormMenu, {port: port}), domContainer);
}

main();
