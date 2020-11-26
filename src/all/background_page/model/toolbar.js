/**
 * Toolbar model.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var User = require('./user').User;

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
 * - Plugin installed and configured, return the passbolt url.
 * @return {string}
 */
Toolbar.getToolbarUrl = function () {
  var url = '',
    user = User.getInstance();

  // The plugin is installed and configured
  if (user.isValid()) {
    url = user.settings.getDomain();
  }
  // The plugin is installed but not configured
  else {
    url = 'https://www.passbolt.com/start';
  }

  return url;
};


exports.Toolbar = Toolbar;
