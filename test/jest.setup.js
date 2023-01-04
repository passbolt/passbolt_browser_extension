import './matchers/extendExpect';
import MockStorage from '../src/all/background_page/sdk/storage.test.mock';
import MockAlarms from './mocks/mockAlarms';
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
global.fetch = require('node-fetch');
global.crypto = {
  getRandomValues: jest.fn()
};
jest.mock("webextension-polyfill", () => Object.assign({}, {
  storage: new MockStorage(),
  runtime: {
    getManifest: jest.fn(() => ({
      version: "v3.6.0"
    })),
    connect: jest.fn(function ({ name }) {
      return {
        name,
        postMessage: jest.fn(),
        onDisconnect: {
          addListener: jest.fn(),
        },
        onMessage: {
          addListener: jest.fn(),
        },
        disconnect: jest.fn(),
      };
    }),
  },
  alarms: new MockAlarms(),
  tabs: {
    onUpdated: {
      addListener: jest.fn()
    },
    onRemoved: {
      addListener: jest.fn()
    },
    query: jest.fn(),
    executeScript: jest.fn(),
    insertCSS: jest.fn()
  },
  browserAction: {
    setIcon: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  commands: {
    onCommand: {
      addListener: jest.fn()
    }
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
