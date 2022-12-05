/**
 * UUID Generator
 *
 * @copyright (c) 2018 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import jsSHA from 'jssha';
import XRegExp from 'xregexp';
import CryptoRandomValuesService from "../service/crypto/cryptoRandomValuesService";

/**
 * Generate a random text.
 * @param size {int} The desired random text size.
 * @returns {string}
 */
function generateRandomHex(size) {
  let i; let text = '';
  const possible = 'ABCDEF0123456789';
  const random_array = CryptoRandomValuesService.randomValuesArray(size);
  for (i = size; i > 0; i--) {
    text += possible.charAt(Math.floor(random_array[i] % possible.length));
  }
  return text;
}

/**
 * Generate a random uuid.
 * @param seed {string} (optional) The seed to use to generate a predictable uuid
 *  based on its sha1 hashed
 * @returns {string}
 */
const get = function(seed) {
  let hashStr;

  // Generate a random hash if no seed is provided
  if (typeof seed === 'undefined') {
    hashStr = generateRandomHex(32);
  } else {
    // Create SHA hash from seed.
    const shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.update(seed);
    hashStr = shaObj.getHash('HEX').substring(0, 32);
  }
  // Build a uuid based on the hash
  const search = XRegExp('^(?<first>.{8})(?<second>.{4})(?<third>.{1})(?<fourth>.{3})(?<fifth>.{1})(?<sixth>.{3})(?<seventh>.{12}$)');
  const replace = XRegExp('${first}-${second}-3${fourth}-a${sixth}-${seventh}');

  // Replace regexp by corresponding mask, and remove / character at each side of the result.
  return XRegExp.replace(hashStr, search, replace).replace(/\//g, '');
};

export const Uuid = {get};
