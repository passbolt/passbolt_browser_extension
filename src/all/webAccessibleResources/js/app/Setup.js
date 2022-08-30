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
import ExtAuthenticationSetup from "passbolt-styleguide/src/react-extension/ExtAuthenticationSetup";
/* eslint-disable no-unused-vars */
import Port from "../lib/port";
/* eslint-enable no-unused-vars */

/**
 * Wait until the background pagemod is ready.
 * @returns {Promise}
 */
async function waitPagemodIsReady() {
  let resolver;
  const promise = new Promise(resolve => { resolver = resolve; });

  const checkInterval = setInterval(() => {
    port.request("passbolt.pagemod.is-ready").then(() => {
      resolver();
      clearInterval(checkInterval);
    });
  }, 50);

  return promise;
}

async function main() {
  await waitPagemodIsReady();
  const domContainer = document.createElement("div");
  document.body.appendChild(domContainer);
  ReactDOM.render(React.createElement(ExtAuthenticationSetup, {port: port}), domContainer);
}

main();
