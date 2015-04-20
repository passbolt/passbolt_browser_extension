var config = require("config/config");
var Request = require("sdk/request").Request;

var config = {
//	"url": "http://192.168.0.108/passbolt"
		url: "passbolt.dev"
};

for (var i in config) {
  exports[i] = config[i];
}
