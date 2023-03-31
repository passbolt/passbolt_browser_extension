/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         hackaton
 * Secret generator complexity
 * Entropy calculate following https://generatepasswords.org/how-to-calculate-entropy/
 */

import PassphraseGeneratorWords from "./PassphraseGeneratorWords";
import GraphemeSplitter from "grapheme-splitter";

const STRENGTH = [
  {
    id: 'not_available',
    label: 'n/a',
    strength: 0
  },
  {
    id: 'very-weak',
    label: 'Very weak',
    strength: 1
  },
  {
    id: 'weak',
    label: 'Weak',
    strength: 60
  },
  {
    id: 'fair',
    label: 'Fair',
    strength: 80
  },
  {
    id: 'strong',
    label: 'Strong',
    strength: 112
  },
  {
    id: 'very-strong',
    label: 'Very strong',
    strength: 128
  }
];

// @todo the tool should use the masks provided by the background page.
const MASKS = [
  {
    "name": "upper",
    "label": "A-Z",
    "characters": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    "active": true
  },
  {
    "name": "lower",
    "label": "a-z",
    "characters": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    "active": true
  },
  {
    "name": "digit",
    "label": "0-9",
    "characters": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    "active": true
  },
  {
    "name": "special_char1",
    "label": "# $ % & @ ^ ~",
    "characters": ["#", "$", "%", "&", "@", "^", "~"],
    "active": true
  },
  {
    "name": "parenthesis",
    "label": "{ [ ( | ) ] ] }",
    "characters": ["{", "(", "[", "|", "]", ")", "}"],
    "active": true
  },
  {
    "name": "special_char2",
    "label": ". , : ;",
    "characters": [".", ",", ":", ";"],
    "active": true
  },
  {
    "name": "special_char3",
    "label": "' \" `",
    "characters": ["'", "\"", "`"],
    "active": true
  },
  {
    "name": "special_char4",
    "label": "/ \\ _ -",
    "characters": ["/", "\\", "_", "-"],
    "active": true
  },
  {
    "name": "special_char5",
    "label": "< * + ! ? =",
    "characters": ["<", "*", "+", "!", "?", "="],
    "active": true
  },
  {
    "name": "emoji",
    "label": "😘",
    // Based on the initial emoticons block (introduce in unicode v6), not updated since 2015 (unicode v8), see https://en.wikipedia.org/wiki/Emoticons_(Unicode_block)
    "characters": [
      "😀", "😁", "😂", "😃", "😄", "😅", "😆", "😇", "😈", "😉",
      "😊", "😋", "😌", "😍", "😎", "😏", "😐", "😑", "😒", "😓",
      "😔", "😕", "😖", "😗", "😘", "😙", "😚", "😛", "😜", "😝",
      "😞", "😟", "😠", "😡", "😢", "😣", "😤", "😥", "😦", "😧",
      "😨", "😩", "😪", "😫", "😬", "😭", "😮", "😯", "😰", "😱",
      "😲", "😳", "😴", "😵", "😶", "😷", "😸", "😹", "😺", "😻",
      "😼", "😽", "😾", "😿", "🙀", "🙁", "🙂", "🙃", "🙄", "🙅",
      "🙆", "🙇", "🙈", "🙉", "🙊", "🙋", "🙌", "🙍", "🙎", "🙏",
    ],
  }
];

const NUMBER_OF_ASCII_CHARACTER = 128;
const NUMBER_OF_WORD_CASE = 3;

export const SecretGeneratorComplexity = {
  /**
   * Calculate a password entropy.
   * @param {string} password The password
   * @returns {Number}
   */
  entropyPassword(password = '') {
    const splitter = new GraphemeSplitter();
    const passwordCharacters = splitter.splitGraphemes(password);
    let maskSize = 0;

    for (const mask of MASKS) {
      const useMask = passwordCharacters.some(character => mask.characters.includes(character));
      if (useMask) {
        maskSize += mask.characters.length;
      }
    }

    return calculEntropy(passwordCharacters.length, maskSize);
  },

  /**
   * Calculate a passphrase entropy.
   * @param {integer} numberOfWords The number of words
   * @param {string} separator The passphrase separator
   * @returns {Number}
   */
  entropyPassphrase(numberOfWords = 0, separator = '') {
    const words = PassphraseGeneratorWords['en-UK'];
    // determine a constant for separator
    const maskSize = (separator.length * NUMBER_OF_ASCII_CHARACTER) + words.length + NUMBER_OF_WORD_CASE;
    return calculEntropy(numberOfWords, maskSize);
  },

  /**
   * Get the strength relative to an entropy
   * @param {number} entropy The entropy
   * @returns {{strength: number, id: string, label: string}|{strength: number, id: string, label: string}|{strength: number, id: string, label: string}|{strength: number, id: string, label: string}|{strength: number, id: string, label: string}}
   */
  strength(entropy = 0)  {
    STRENGTH.reduce((accumulator, item) => {
      if (!accumulator) {
        return item;
      }
      if (item.strength > accumulator.strength && entropy >= item.strength) {
        return item;
      }
      return accumulator;
    }),
    calculEntropy;
  }
};

/**
 * Calculate the entropy regarding the given primitives.
 * @param length {int} The number of characters
 * @param maskSize {int} The number of possibility for each character
 * @return {int}
 */
function calculEntropy(length, maskSize) {
  return (length && maskSize) ? length * (Math.log(maskSize) / Math.log(2)) : 0;
}
