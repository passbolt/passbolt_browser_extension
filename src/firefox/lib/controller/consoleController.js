/**
 * Console Controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
/**
 * Set the log level
 *
 * @param {string} level
 */
var setLogLevel = function(level) {
  require('./browserSettingsController').set('extensions.sdk.console.logLevel', level);
};
exports.setLogLevel = setLogLevel;
