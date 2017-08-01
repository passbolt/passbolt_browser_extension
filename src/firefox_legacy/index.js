// SDK add-on
const webExtension = require("sdk/webextension");
var Log = require('../model/log').Log;

webExtension.startup().then(function(api) {
  const {browser} = api;

  Log.write({level: 'debug', message: 'SDK Extension started'});
  browser.runtime.onConnect.addListener(function(port) {
      port.postMessage({
      content: "content from legacy add-on"
    });
  });
});
