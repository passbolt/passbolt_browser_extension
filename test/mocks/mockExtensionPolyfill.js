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
 * @since         4.6.0
 */
import mockSessionStorage from "./mockSessionStorage";
import mockLocalStorage from "./mockLocalStorage";
import MockAlarms from "./mockAlarms";
import "webextension-polyfill";

jest.mock("webextension-polyfill", () => {
  const browser = jest.requireActual("webextension-polyfill");
  return {
    ...browser,
    // Alarms is not mocked by jest-webextension-mock v3.8.9
    alarms: new MockAlarms(),
    /*
     * Cookies is not mocked by jest-webextension-mock v3.8.9
     * @see https://github.com/clarkbw/jest-webextension-mock/issues/109
     */
    cookies: {
      get: jest.fn()
    },
    runtime: {
      ...browser.runtime,
      // Force the extension runtime url
      getURL: jest.fn(() => "chrome-extension://didegimhafipceonhjepacocaffmoppf"),
      // Force extension version
      getManifest: jest.fn(() => ({
        version: "v3.6.0"
      })),
      // Runtime primitives not mocked by jest-webextension-mock v3.8.9
      OnInstalledReason: {
        INSTALL: "install",
        UPDATE: "update"
      },
    },
    storage: {
      ...browser.storage,
      // Storage.local mock is incorrect with jest-webextension-mock v3.8.9
      local: mockLocalStorage,
      // Storage.session is not mocked by jest-webextension-mock v3.8.9
      session: mockSessionStorage
    },
    tabs: {
      ...browser.tabs,
      // Tabs primitives not mocked by jest-webextension-mock v3.8.9
      executeScript: jest.fn(),
      insertCSS: jest.fn(),
      onActivated: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
      reload: jest.fn(),
    },
    /*
     * Windows is not mocked by jest-webextension-mock v3.8.9
     * @see https://github.com/clarkbw/jest-webextension-mock/issues/89
     */
    windows: {
      onFocusChanged: {
        addListener: jest.fn(),
        hasListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  };
});
