// SDK add-on
const webExtension = require("sdk/webextension");

webExtension.startup().then(function(api) {
  console.log('SDK Extension started');
  const {browser} = api;

  // local storage
  var ss = require("sdk/simple-storage");

  if(typeof ss.storage !== 'undefined')
  var data = JSON.stringify(ss.storage);
  console.log(data);

  // pass content
  browser.runtime.onConnect.addListener(function(port) {
      port.postMessage({
      content: data
    });
  });

});
