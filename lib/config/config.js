var Config = require("config/config");
var Request = require("sdk/request").Request;

var config = {
  "url": "http://passbolt.dev"
};

for (var i in config) {
  exports[i] = config[i];
}
