/**
 * Browser Settings Controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var preferences = require('sdk/preferences/service');
var self = require("sdk/self");

/**
 * Get the value of given browser setting
 *
 * @param {string} key
 * @return {string} value
 */
var get = function(key) {
  return preferences.get(key);
};
exports.get = get;

/**
 * Set the value of given browser setting
 *
 * @param {string} key
 * @param {string} value
 */
var set = function(key, value) {
  preferences.set(key, value);
};
exports.set = set;

/**
 * Get the extension url.
 *
 * @return {string}
 */
var getExtensionUrl = function () {
  return "resource://passbolt-at-passbolt-dot-com";
};
exports.getExtensionUrl = getExtensionUrl;

/**
 * Get the extension version.
 *
 * @return {string}
 */
var getExtensionVersion = function () {
  return self.version;
};
exports.getExtensionVersion = getExtensionVersion;
