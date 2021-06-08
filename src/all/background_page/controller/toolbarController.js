/**
 * Toolbar controller.
 *
 * @copyright (c) 2017 Passbolt SARL
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
    _this.openPassboltTab();
  });
  chrome.commands.onCommand.addListener(function(command) {
    if (command === "passbolt-open") {
      _this.openPassboltTab();
    }
  });
};

/**
 * Open a new tab and go to passbolt.
 */
ToolbarController.prototype.openPassboltTab = function () {
  var url = Toolbar.getToolbarUrl();
  tabsController.open(url);
};

// Exports the User object.
exports.ToolbarController = ToolbarController;
