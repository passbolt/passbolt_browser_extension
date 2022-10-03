import './matchers/extendExpect';
import MockStorage from '../src/all/background_page/sdk/storage.test.mock';
import OrganizationSettingsModel from "../src/all/background_page/model/organizationSettings/organizationSettingsModel";
import {Config} from "../src/all/background_page/model/config";
import Keyring from "../src/all/background_page/model/keyring";
import browser from "webextension-polyfill";

/*
 * Fix jest-webextension-mock after upgrading webextension-polyfill to 0.9.0
 * @see https://github.com/clarkbw/jest-webextension-mock/issues/149#issuecomment-1116558554
 */
chrome.runtime.id = "test id";
global.console = {
  ...console,
  debug: jest.fn(),
  error: jest.fn(),
  warning: jest.fn()
};
global.TextEncoder = require('text-encoding-utf-8').TextEncoder;
global.TextDecoder = require('text-encoding-utf-8').TextDecoder;
jest.mock("webextension-polyfill", () => Object.assign({}, {
  storage: new MockStorage(),
  runtime: {
    getManifest: jest.fn(() => ({
      version: "v3.6.0"
    }))
  }
}));

beforeEach(async() => {
  global.chrome = browser;
  browser.storage.local.clear(); // Flush the local storage
  // Flush caches
  OrganizationSettingsModel.flushCache();
  Config.flush();
  const keyring = new Keyring();
  keyring.flush(Keyring.PUBLIC);
  keyring.flush(Keyring.PRIVATE);
});
