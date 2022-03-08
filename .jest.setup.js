import MockStorage from './src/all/background_page/sdk/storage.test.mock';

global.chrome = {};
global.openpgp = require('openpgp');
global.Validator = require('validator');
global.Validator.isUtf8 = require('./src/all/background_page/utils/validatorRules').isUtf8;
global.TextEncoder = require('text-encoding-utf-8').TextEncoder;
global.TextDecoder = require('text-encoding-utf-8').TextDecoder;
global.setImmediate = typeof global.setImmediate === "function" ? global.setImmediate : () => {};

beforeEach(() => {
  // Before each test, reinitialise the local storages
  global.browser = Object.assign({}, {storage: new MockStorage()}); // Required by local storage
  global.chrome = global.browser;
  global.storage = require('./src/all/background_page/sdk/storage').storage
});
