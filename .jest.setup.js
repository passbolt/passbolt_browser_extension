const { TextDecoder } = require('util'); // Avoid issue for node version < 11
global.TextDecoder = TextDecoder