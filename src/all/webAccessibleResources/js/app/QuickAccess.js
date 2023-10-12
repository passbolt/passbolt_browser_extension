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
 * @since         3.2.0
 */
import React from "react";
import ReactDOM from "react-dom";
import ExtQuickAccess from "passbolt-styleguide/src/react-quickaccess/ExtQuickAccess";
import browser from "../../../background_page/sdk/polyfill/browserPolyfill";
import Port from "../lib/port";

function main() {
  // did for testing purpose and debugging but the original version actually works
  const query = new URLSearchParams(window.location.search);
  const portname = query.get('passbolt');
  const port = new Port(portname);
  await port.connect();
  const storage = browser.storage;
  const domContainer = document.querySelector('#quickaccess-container');
  // Extract parameters from the url.
  const urlSearchParams = new URLSearchParams(window.location.search);
  const bootstrapFeature = urlSearchParams.get("feature");
  const bootstrapRequestId = urlSearchParams.get("requestId");
  const openerTabId = urlSearchParams.get('tabId');
  const detached = urlSearchParams.get('uiMode') === "detached";

  const extQuickaccessProps = {port, storage, bootstrapFeature, bootstrapRequestId, openerTabId, detached};
  ReactDOM.render(React.createElement(ExtQuickAccess, extQuickaccessProps), domContainer);
}

main();
