import MockStorage from './src/all/background_page/sdk/storage.test.mock';

global.chrome = {};
global.openpgp = require('openpgp/dist/openpgp');
global.Validator = require('validator');
global.Validator.isUtf8 = require('./src/all/background_page/utils/validatorRules').isUtf8;
global.TextEncoder = require('text-encoding-utf-8').TextEncoder;

beforeEach(() => {
  // Before each test, reinitialise the local storages
  global.browser = Object.assign({}, {storage: new MockStorage()}); // Required by local storage
  global.chrome = global.browser;
  global.storage = require('./src/all/background_page/sdk/storage').storage
});
