/**
 * Toolbar model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var BrowserSettings = require('../controller/browserSettingsController');
var User = require('./user').User;
var Setup = require('./setup').Setup;

/**
 * Toolbar constructor.
 * @constructor
 */
var Toolbar = function () {};

/**
 * Get the toolbar url, that will be used when the user click
 * on the toolbar passbolt button.
 *
 * Regarding the current user configuration, the results can be :
 * - Plugin installed but not configured, return the public page getting started url;
 * - Plugin installed but partially configured, return the setup url;
 * - Plugin installed and configured, return the passbolt url.
 * @return {string}
 */
Toolbar.getToolbarUrl = function (tab) {
  var url = '',
    user = new User(),
    setup = new Setup();

  // The plugin is installed and configured
  if (user.isValid()) {
    url = user.settings.getDomain();
  }
  // The plugin is installed but the configuration is incomplete
  else if (setup.get('stepId') != '') {
    url = BrowserSettings.getExtensionUrl() + '/data/setup.html';
  }
  // The plugin is installed but not configured
  else {
    url = 'https://www.passbolt.com/start';
  }

  return url;
};


exports.Toolbar = Toolbar;
