/**
 * Toolbar controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var tabsController = require('./tabsController');
var Toolbar = require('../model/toolbar').Toolbar;

/**
 * Toolbar Controller constructor.
 * @constructor
 */
var ToolbarController = function() {
  var _this = this;
  chrome.browserAction.onClicked.addListener(function() {
    _this.onButtonClick();
  });
  chrome.commands.onCommand.addListener(function(command) {
    _this.onShortcutPressed();
  });
};

/**
 * Handle the click on the passbolt toolbar icon.
 */
ToolbarController.prototype.onButtonClick = function() {
  this.openPassboltTab();
};

/**
 * Handle the shortcut pressed event.
 */
ToolbarController.prototype.onShortcutPressed = function() {
  this.openPassboltTab();
};

/**
 * Open a new tab and go to passbolt.
 */
ToolbarController.prototype.openPassboltTab = function () {
  var url = Toolbar.getToolbarUrl();
  try {
    tabsController.open(url);
  } catch (e) {
    // If something wrong happens, redirect the user to the passbolt home page
    tabsController.open('https://www.passbolt.com/start');
  }
};

// Exports the User object.
exports.ToolbarController = ToolbarController;
