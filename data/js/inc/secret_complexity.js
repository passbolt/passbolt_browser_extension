/**
 * Secret complexity helper.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
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
      size:26,
        data: 'abcdefghijklmnopqrstuvwxyz',
        pattern: /[a-z]/
    },
    'uppercase': {
      size:26,
        data: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        pattern: /[A-Z]/
    },
    'digit': {
      size:10,
        data: '0123456789',
        pattern: /[0-9]/
    },
    'special': {
      size:32,
        // ASCII Code = 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96, 123, 124, 125, 126
        data: '!"#$%&\'()*+,-./:;<=>?@[:\\]^_`{|}~',
        pattern: /[!"#$%&\'\(\)*+,\-./:;<=>?@\[\]^_`{|}~]/
    }
  };
  exports.MASKS = MASKS;

  /**
   * Geneate a random number in the given range.
   * @param min
   * @param max
   * @returns {*}
   */
  var randomRange = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * Calculate the entropy regarding the given primitives.
   * @param {int} length The number of characters
   * @param {int} maskSize The number of possibility for each character
   * @return {int}
   */
  var calculEntropy = function(length, maskSize) {
    return length * (Math.log(maskSize) / Math.log(2));
  };

  /**
   * Mesure the entropy of a password
   * @param {srtring} pwd The password to test the entropy
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
   * @param {string} txt The text to work on.
   * @return {object} The entropy level {start:(int), id:(string), label:(string)}
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
   * Get an object with a list of criterias and whether the text given matches them.
   * @param txt
   * @returns {{}}
   */
  var matchMasks = function(txt) {
    var criterias = {};
    for (var i in MASKS) {
      criterias[i] = false;
      if (txt.match(MASKS[i].pattern)) {
        criterias[i] = true;
      }
    }
    return criterias;
  };
  exports.matchMasks = matchMasks;

  /**
   * Generate a password following the system configuration
   * @return {string}
   */
  var generate = function(length, masks) {
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
      for (var i=0; i<length; i++) {
        secret += mask[randomRange(0, mask.length-1)];
      }
    } while (expectedEntropy != entropy(secret) && j++<10	);

    return secret;
  };
  exports.generate = generate;

})(secretComplexity);
