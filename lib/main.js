// SDK includes
var debug = 1;
var pageMod = require("sdk/page-mod");
var tabs = require('sdk/tabs');
var buttons = require('sdk/ui/button/action');
var data = require("sdk/self").data;
var filepicker = require("./filepicker.js");
var self = require("sdk/self");
var fileIO = require("sdk/io/file");
var openpgp = require("openpgp");
var KeyringController = require("./controller/keyring");
var CipherController = require("./controller/cipher");
var ClipboardController = require("./controller/clipboard");

var name = "extensions.sdk.console.logLevel";
require("sdk/preferences/service").set(name, 'all');

// Passbolt button on browser toolbar
var button = buttons.ActionButton({
	id: "passbolt-link",
	label: "Passbolt",
	icon: {
		"16": "./img/icon-16.png",
		"32": "./img/icon-32.png",
		"64": "./img/icon-64.png"
	},
	onClick: function(state) {
		tabs.open(data.url("config.html"));
	}
});

// Load the passbolt addon-on config app on config pages
pageMod.PageMod({
  include: data.url("config.html"),
  contentScriptWhen: 'end',
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    //data.url("js/lib/openpgp.min.js"),
    //data.url("js/message.js"),
    data.url("js/config.js")
  ],
  onAttach: listenConfigEvents
});

// Load the passbolt add-on main app on every page
pageMod.PageMod({
  include: /.*passbolt.*/, 								///.*\/passbolt\/pages\/demo\/plugin-test-ff.*/,
  contentScriptWhen: 'ready',					// start | ready | end
  contentScriptFile: [
    data.url("js/lib/jquery-2.1.1.min.js"),
    //data.url("js/lib/openpgp.min.js"),
    //data.url("js/message.js"),
    data.url("js/app.js")
  ],
  onAttach: listenAppEvents
});

// Listen from application pagemod messages
function listenAppEvents(worker) {
  // Listen on cipher encrypt request event.
  worker.port.on("passbolt.cipher.encrypt", function(txt) {
    CipherController.encrypt(worker, txt);
  });
  // Listen on cipher decrypt request event.
  worker.port.on("passbolt.cipher.decrypt", function(txt) {
    CipherController.decrypt(worker, txt);
  });
  // Listen on copy to clipboard event.
  worker.port.on("passbolt.clipboard.copy", function(txt) {
    ClipboardController.copy(worker, txt);
  });
}

// Listen from config pagemod messages
function listenConfigEvents(worker) {
  // Listen on import private key event.
  worker.port.on("passbolt.keyring.importPrivate", function(txt) {
    KeyringController.importPrivate(worker, txt);
  });

  // Listen on request a private key import from file.
	worker.port.on("passbolt.keyring.promptPvtFile", function(myAddonMessagePayload) {
		var path = filepicker.promptForFile();
		if(fileIO.isFile(path)) {
			var fileContent = fileIO.read(path);
			worker.port.emit("passbolt.keyring.promptPvtFileSuccess", fileContent);
		}
	});
}

//tabs.open(data.url("config.html"));
