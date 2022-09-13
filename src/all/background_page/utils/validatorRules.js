/**
 * Extra validator rules
 *
 * @copyright (c) 2018 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * Check that the input value is a utf8 (extended) string.
 * This method will reject all non-string values.
 *
 * @param {mixed} value The value to validate
 * @return {boolean}
 */
const isUtf8Extended = function(value) {
  return typeof value === 'string';
};

/**
 * Check that the input value is a utf8 string.
 * This method will reject all non-string values.
 *
 * Disallow bytes higher within the basic multilingual plane (Code up to U+FFFF).
 * (emoticons + $ € £ ^ ...)
 * MySQL's older utf8 encoding type does not allow characters above the basic multilingual plane.
 *
 * @param {mixed} value The value to validate
 * @return {boolean}
 */
const isUtf8 = function(value) {
  if (typeof value !== 'string') {
    return false;
  }

  // Check that there is no character from the extended range \u10000 to \u10FFFF
  if (/[\u{10000}-\u{10FFFF}]/u.test(value)) {
    return false;
  }

  return true;
};

export const ValidatorRule = {isUtf8, isUtf8Extended};
