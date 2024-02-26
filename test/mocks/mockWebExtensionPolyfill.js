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
import "jest-webextension-mock";
import MockAlarms from "./mockAlarms";
import MockEventListener from "./mockEventListener";
import MockStorage from "./mockStorage";

jest.mock("webextension-polyfill", () => {
  const originalBrowser = jest.requireActual("webextension-polyfill");
  return {
    ...originalBrowser,
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
      ...originalBrowser.runtime,
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
      ...originalBrowser.storage,
      // Override jest-webextension-mock v3.8.9 storage.local with custom one offering local scope store
      local: new MockStorage(),
      // Storage.session is not mocked by jest-webextension-mock v3.8.9
      session: new MockStorage(),
    },
    tabs: {
      ...originalBrowser.tabs,
      // Tabs primitives not mocked by jest-webextension-mock v3.8.9
      executeScript: jest.fn(),
      insertCSS: jest.fn(),
      onActivated: new MockEventListener(),
      onUpdated: new MockEventListener(),
      onRemoved: new MockEventListener(),
      reload: jest.fn(),
    },
    /*
     * Windows is not mocked by jest-webextension-mock v3.8.9
     * @see https://github.com/clarkbw/jest-webextension-mock/issues/89
     */
    windows: {
      create: jest.fn(),
      onFocusChanged: {
        addListener: jest.fn(),
        hasListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
  };
});
