global.chrome = {};
global.openpgp= require('openpgp/dist/openpgp');
global.Validator = require('validator');
global.Validator.isUtf8 = require('./src/all/background_page/utils/validatorRules').isUtf8;
global.TextEncoder = require('text-encoding-utf-8').TextEncoder;
