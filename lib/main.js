// SDK includes
var debug = 1;
var pageMod = require("sdk/page-mod");
var tabs = require('sdk/tabs');
var buttons = require('sdk/ui/button/action');
var data = require("sdk/self").data; 
var filepicker = require("./filepicker.js");
var self = require("sdk/self");
var fileIO = require("sdk/io/file");

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

// Load the passbolt add-on main app on every page
pageMod.PageMod({
	include: '*', 								///.*\/passbolt\/pages\/demo\/plugin-test-ff.*/,
	contentScriptWhen: 'end',					// start | ready | end
	contentScriptFile: [
		data.url("js/jquery-2.1.1.min.js"),
		data.url("js/openpgp.min.js"),
		data.url("js/app.js")
	]
});

// Load the passbolt addon-on config app on config pages
pageMod.PageMod({ 
	include: data.url("config.html"),
	contentScriptWhen: 'end',
	contentScriptFile: [
		data.url("js/jquery-2.1.1.min.js"),
		data.url("js/openpgp.min.js"),
		data.url("js/config.js")
	],
	onAttach: listenConfigEvents
});

// Listen from config pagemod messages
function listenConfigEvents(worker) {
	
	// open file picker event
	worker.port.on("openFilePicker", function(myAddonMessagePayload) {
		var path = filepicker.promptForFile();
		if(fileIO.isFile(path)) {
			var fileContent = fileIO.read(path);
			worker.port.emit("importFromFile", fileContent);
		}
	});
}

tabs.open(data.url("config.html"));
