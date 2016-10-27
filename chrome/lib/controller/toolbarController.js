/**
 * The class that deals with users.
 */
var ToolbarController = function() {
  var _this = this;
  // React when a browser action's icon is clicked.
  chrome.browserAction.onClicked.addListener(function (tab) {
    _this.onButtonClick(tab);
  });
};

ToolbarController.prototype.onButtonClick = function(tab) {
  //var setupUrl = chrome.extension.getURL('data/setup.html');
  chrome.tabs.update(tab.id, {url: 'http://passbolt.dev'});
};

var toolbar = new ToolbarController();

// Exports the User object.
exports.ToolbarController = ToolbarController;
