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
 * @since         3.0.0
 */
import React from "react";
import ReactDOM from "react-dom";
import browser from "../../../background_page/sdk/polyfill/browserPolyfill";
import ExtApp from "passbolt-styleguide/src/react-extension/ExtApp";
import Port from "../lib/port";

async function main() {
  const query = new URLSearchParams(window.location.search);
  const portname = query.get('passbolt');
  const port = new Port(portname);
  await port.connect();
  const storage = browser.storage;
  const domContainer = document.createElement("div");
  document.body.appendChild(domContainer);
  ReactDOM.render(React.createElement(ExtApp, {port: port, storage: storage}), domContainer);
}

main();
