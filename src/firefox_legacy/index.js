// SDK add-on
const webExtension = require("sdk/webextension");

webExtension.startup().then(function(api) {
  const {browser} = api;

  // local storage
  var ss = require("sdk/simple-storage");
  var data = JSON.stringify(ss.storage);

  // pass content
  browser.runtime.onConnect.addListener(function(port) {
      port.postMessage({
      content: data
    });
  });

  // empty storage (no migration next time)
  ss.storage = {};
});
