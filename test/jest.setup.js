/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import "./mocks/mockWebExtensionPolyfill";
import browser from "../src/all/common/polyfill/browserPolyfill";
import "./mocks/mockTextEncoder";
import "passbolt-styleguide/test/mocks/mockCrypto";
import "./matchers/extendExpect";
import MockNavigatorLocks from './mocks/mockNavigatorLocks';
import OrganizationSettingsModel from "../src/all/background_page/model/organizationSettings/organizationSettingsModel";
import {Config} from "../src/all/background_page/model/config";
import Keyring from "../src/all/background_page/model/keyring";
import ResourceLocalStorage from "../src/all/background_page/service/local_storage/resourceLocalStorage";
import FolderLocalStorage from "../src/all/background_page/service/local_storage/folderLocalStorage";

// hides all the messages from Log
jest.mock("../src/all/background_page/model/log.js");

global.console = {
  ...console,
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};
global.fetch = require('node-fetch');
if (!global.navigator) {
  global.navigator = {};
}
if (!global.navigator.locks) {
  global.navigator.locks = new MockNavigatorLocks();
}

/*
 * quick polyfill for jest to have stucturedClone function defined
 * if it's not defined, it is set to a function that returns the given object itself
 */
if (!global.structuredClone) {
  global.structuredClone = object => object;
}

beforeEach(async() => {
  // Before each test, ensure a new copy of the browser API is made available in the global scope.
  global.browser = browser;
  global.chrome = browser;
  // Flush the local storage
  await browser.storage.local.clear();
  // Flush the session storage
  await browser.storage.session.clear();
  // Flush caches
  OrganizationSettingsModel.flushCache();
  ResourceLocalStorage.flush();
  FolderLocalStorage.flush();
  Config.flush();
  const keyring = new Keyring();
  keyring.flush(Keyring.PUBLIC);
  keyring.flush(Keyring.PRIVATE);
});
