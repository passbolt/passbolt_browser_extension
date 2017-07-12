/**
 * Get Random Bytes
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
exports.randomBytes = function(size) {
  var buf = new Uint8Array(size);
  window.crypto.getRandomValues(buf);
  return buf;
};
