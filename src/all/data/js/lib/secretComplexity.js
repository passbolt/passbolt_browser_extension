/**
 * Secret complexity helper.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var secretComplexity = {};

(function (exports) {

  /**
   * Secret entropy levels
   */
  var STRENGTH = {
    0: {
      id: 'not_available',
      label: 'n/a'
    },
    1: {
      id: 'very_weak',
      label: 'very weak'
    },
    60: {
      id: 'weak',
      label: 'weak'
    },
    80: {
      id: 'fair',
      label: 'fair'
    },
    112: {
      id: 'strong',
      label: 'strong'
    },
    128: {
      id: 'very_strong',
      label: 'very strong'
    }
  };
  exports.STRENGTH = STRENGTH;

  /**
   * Secret existing masks.
   */
  var MASKS = {
    'alpha': {
      size: 26,
      data: 'abcdefghijklmnopqrstuvwxyz',
      pattern: /[a-z]/
    },
    'uppercase': {
      size: 26,
      data: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      pattern: /[A-Z]/
    },
    'digit': {
      size: 10,
      data: '0123456789',
      pattern: /[0-9]/
    },
    'special': {
      size: 32,
      // ASCII Code = 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96, 123, 124, 125, 126
      data: '!"#$%&\'()*+,-./:;<=>?@[:\\]^_`{|}~',
      pattern: /[!"#$%&\'\(\)*+,\-./:;<=>?@\[\]^_`{|}~]/
    }
  };
  exports.MASKS = MASKS;

  /**
   * Generate a random number in the given range.
   * @param min {int} The min limit
   * @param max {int} The mas limit
   * @returns {int}
   */
  var randomRange = function (min, max) {
    var arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    var random = arr[0]/(0xffffffff + 1);
    return Math.floor(random * (max - min + 1)) + min;
  };

  /**
   * Calculate the entropy regarding the given primitives.
   * @param length {int} The number of characters
   * @param maskSize {int} The number of possibility for each character
   * @return {int}
   */
  var calculEntropy = function (length, maskSize) {
    return length * (Math.log(maskSize) / Math.log(2));
  };

  /**
   * Mesure the entropy of a password.
   * @param pwd {srtring} The password to test the entropy
   * @return {int}
   */
  var entropy = function (pwd) {
    var maskSize = 0;

    for (var i in MASKS) {
      if (pwd.match(MASKS[i].pattern)) {
        maskSize += MASKS[i].size;
      }
    }

    return calculEntropy(pwd.length, maskSize);
  };
  exports.entropy = entropy;

  /**
   * Get the entropy level regarding the mesure of the entropy.
   * @param txt {string} The text to work on
   * @return {object} The entropy level
   *  format :
   *  {
   *    start {int},
   *    id {string},
   *    label {string}
   *  }
   */
  var strength = function (txt) {
    if (txt == null) {
      return null;
    }

    var txtEntropy = entropy(txt),
      strengthsKeys = Object.keys(STRENGTH).reverse();

    for (var i in strengthsKeys) {
      var level = strengthsKeys[i];
      if (txtEntropy >= level) {
        return level;
      }
    }

    return 0;
  };
  exports.strength = strength;

  /**
   * Check if a text matches multiple masks.
   * @param txt {string} The text to
   * @returns {array} The list of masks as following :
   *   {
   *     alpha: true,
   *     uppercase: false,
   *     ...
   *   }
   */
  var matchMasks = function (txt) {
    var matches = {};
    for (var i in MASKS) {
      matches[i] = false;
      if (txt.match(MASKS[i].pattern)) {
        matches[i] = true;
      }
    }
    return matches;
  };
  exports.matchMasks = matchMasks;

  /**
   * Generate a password following the system settings.
   * @param length {int} (optional) The password length. Default 18.
   * @param masks {array} (optional) The list of masks to use. Default all.
   * @return {string}
   */
  var generate = function (length, masks) {
    var secret = '',
      mask = [],
      masks = masks || ["alpha", "uppercase", "digit", "special"],
      length = length || 18,
      expectedEntropy = null;

    // Build the mask to use to generate a secret.
    for (var i in masks) {
      mask = $.merge(mask, MASKS[masks[i]].data);
    }

    // Generate a password which should fit the expected entropy.
    // Try maximum 10 times.
    var j = 0;
    do {
      secret = '';
      expectedEntropy = calculEntropy(length, mask.length);
      for (var i = 0; i < length; i++) {
        secret += mask[randomRange(0, mask.length - 1)];
      }
    } while (expectedEntropy != entropy(secret) && j++ < 10);

    return secret;
  };
  exports.generate = generate;

})(secretComplexity);
