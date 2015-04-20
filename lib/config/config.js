var extId = "jid1-AI9Ae0ocGaCdsA";
var config = {
//	"url": "http://192.168.0.108/passbolt"
  "url": "http://passbolt.dev",
  "setupBootstrapUrl": "setup/install#" + extId
};

for (var i in config) {
  exports[i] = config[i];
}
