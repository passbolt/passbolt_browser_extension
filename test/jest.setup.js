import '../src/all/tests/matchers/extendExpect';
import MockStorage from '../src/all/background_page/sdk/storage.test.mock';
import {OrganizationSettingsModel} from "../src/all/background_page/model/organizationSettings/organizationSettingsModel";
import Config from "../src/all/background_page/model/config";
import {Keyring} from "../src/all/background_page/model/keyring";
import {UserLocalStorage} from "../src/all/background_page/service/local_storage/userLocalStorage";

/*
 * Fix jest-webextension-mock after upgrading webextension-polyfill to 0.9.0
 * @see https://github.com/clarkbw/jest-webextension-mock/issues/149#issuecomment-1116558554
 */
chrome.runtime.id = "test id";
global.openpgp = require('openpgp');
global.Validator = require('validator');
global.Validator.isUtf8 = require('../src/all/background_page/utils/validatorRules').isUtf8;
global.TextEncoder = require('text-encoding-utf-8').TextEncoder;
global.TextDecoder = require('text-encoding-utf-8').TextDecoder;
global.setImmediate = typeof global.setImmediate === "function" ? global.setImmediate : () => {};
global.stripslashes = require('locutus/php/strings/stripslashes');
global.urldecode = require('locutus/php/url/urldecode');
global.jsSHA = require('jssha');
global.XRegExp = require('xregexp');

beforeEach(async() => {
  // Before each test, reinitialise the local storages
  global.browser = Object.assign({}, {
    storage: new MockStorage(),
    runtime: {
      getManifest: jest.fn(() => ({
        version: "v3.6.0"
      }))
    }
  }); // Required by local storage
  global.chrome = global.browser;
  global.storage = require('../src/all/background_page/sdk/storage').storage;
  global.storage._data = {}; // Flush the local storage.
  // Flush caches
  OrganizationSettingsModel.flushCache();
  Config.flush();
  const keyring = new Keyring();
  keyring.flush(Keyring.PUBLIC);
  keyring.flush(Keyring.PRIVATE);
  await UserLocalStorage.flush();
});
