const Log = require('../model/log').Log;

/**
 * Browser Settings Controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
/**
 * Get the value of given browser setting
 *
 * @param {string} key
 * @return {string} value
 */
const get = function(key) {
  Log.write({level: 'error', message: `Chrome browserSettingsController::get for key ${key} not implemented`});
  return undefined;
};
exports.get = get;

/**
 * Set the value of given browser setting
 */
const set = function() {
  Log.write({level: 'error', message: 'Chrome browserSettingsController::set not implemented'});
};
exports.set = set;

/**
 * Get the extension version.
 *
 * @return {string}
 */
const getExtensionVersion = function() {
  return chrome.runtime.getManifest().version;
};
exports.getExtensionVersion = getExtensionVersion;
