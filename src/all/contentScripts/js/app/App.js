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
 */
import React from "react";
import ReactDOM from "react-dom";
import ExtBootstrapApp from "passbolt-styleguide/src/react-extension/ExtBootstrapApp";
import Port from "../../../webAccessibleResources/js/lib/port";
import browser from "webextension-polyfill";

async function main() {
  const port = new Port(self.portname);
  await port.connect();
  const storage = browser.storage;
  const browserExtensionUrl = chrome.runtime.getURL("/");
  const domContainer = document.createElement("div");
  document.body.appendChild(domContainer);
  ReactDOM.render(<ExtBootstrapApp port={port} storage={storage} browserExtensionUrl={browserExtensionUrl}/>, domContainer);
}

main();
