/**
 * Toolbar controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var self = require('sdk/self');
var buttons = require('sdk/ui/button/action');
var { Hotkey } = require("sdk/hotkeys");
var tabsController = require('./tabsController');
var setup = new (require("../model/setup").Setup)();

/**
 * Toolbar Controller constructor.
 * @constructor
 */
var ToolbarController = function () {
  var _this = this;

  // Add a passbolt button on browser toolbar.
  buttons.ActionButton({
    id: 'passbolt-link',
    label: 'Passbolt',
    icon: {
      16: './img/logo/icon-16.png',
      32: './img/logo/icon-32.png',
      64: './img/logo/icon-64.png'
    },
    onClick: function() {
      _this.onButtonClick()
    }
  });

  // Add a shortcut to reach passbolt (usefull for test).
  Hotkey({
    combo: "accel-shift-alt-p",
    onPress: function() {
      _this.onShortcutPressed();
    }
  });
};

/**
 * Handle the click on the passbolt toolbar icon.
 */
ToolbarController.prototype.onButtonClick = function () {
  this.openPassboltTab();
};

/**
 * Handle the shortcut pressed event.
 */
ToolbarController.prototype.onShortcutPressed = function () {
  this.openPassboltTab();
};

/**
 * Open a new tab and go to passbolt.
 */
ToolbarController.prototype.openPassboltTab = function () {
  var url = setup.getPassboltUrl();
  try {
    tabsController.open(url);
  } catch (e) {
    // If something wrong happens, redirect the user to the passbolt home page
    tabsController.open('https://www.passbolt.com/start');
  }
};

// Exports the User object.
exports.ToolbarController = ToolbarController;
