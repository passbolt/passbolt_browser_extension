/**
 * Main configuration file.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
// Config and user models
var Config = require('./model/config');
var User = require('./model/user').User;

// console and debug utilities
if (Config.isDebug() == true) {
  require('./controller/consoleController').setLogLevel('all');
}

/* ==================================================================================
 *  Interface changes
 *  Where we affect the look and feel of the firefox instance
 * ==================================================================================
 */
var ToolbarController = require('./controller/toolbarController').ToolbarController;
new ToolbarController();

/* ==================================================================================
 *  Page mods init
 *  Run scripts in the context of web pages whose URL matches a given pattern.
 *  see. https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod
 * ==================================================================================
 */
var pageMods = require('./app').pageMods;

pageMods.Bootstrap.init();

// Passbolt Auth pagemod init can also be triggered
// by debug, setup and user events
var user = new User();
if (user.isValid()) {
  pageMods.PassboltAuth.init();
  pageMods.PassboltAuthForm.init();
}

pageMods.SetupBootstrap.init();
pageMods.Setup.init();

// ...
// pageMods.PassboltApp.init();
pageMods.MasterPasswordDialog.init();
pageMods.ProgressDialog.init();
pageMods.SecretEditDialog.init();
pageMods.ShareDialog.init();
pageMods.ShareAutocompleteDialog.init();

// Debug pagemod
if (Config.isDebug()) {
  pageMods.Debug.init();
}
