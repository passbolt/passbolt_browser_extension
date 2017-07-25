// SDK add-on
const webExtension = require("sdk/webextension");

webExtension.startup().then(function(api) {
  console.log('SDK Extension started');
  const {browser} = api;
  browser.runtime.onConnect.addListener(function(port) {
      port.postMessage({
      content: "content from legacy add-on"
    });
  });
});
