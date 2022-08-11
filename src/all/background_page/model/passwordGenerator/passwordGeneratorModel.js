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
 * @since         3.3.0
 */
import PasswordGeneratorLocalStorage from "../../service/local_storage/passwordGeneratorLocalStorage";
import PasswordGeneratorService from "../../service/api/passwordGenerator/passwordGeneratorService";
import PasswordGeneratorEntity from "../entity/passordGenerator/passwordGeneratorEntity";
import PassboltApiFetchError from "../../error/passboltApiFetchError";

/** List of possible generator types */
const GENERATORS =  [
  {
    "name": "Password",
    "type": "password",
    "default_options": {
      "length": 18,
      "look_alike": true,
      "min_length": 8,
      "max_length": 128,
    },
    "masks": [
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
    ],
  },
  {
    "name": "Passphrase",
    "type": "passphrase",
    "default_options": {
      "word_count": 9,
      "word_case": "lowercase",
      "min_word": 4,
      "max_word": 40,
      "separator": " "
    },
  }
];

class PasswordGeneratorModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.passwordGeneratorService = new PasswordGeneratorService(apiClientOptions);
  }

  /**
   * Update the passwordGenerator local storage with the latest API passwordGenerator the user has access.
   *
   * @return {ResourceTypesCollection}
   */
  async updateLocalStorage() {
    let passwordGeneratorDto = {};
    try {
      passwordGeneratorDto = await this.passwordGeneratorService.find();
      passwordGeneratorDto = Object.assign({}, passwordGeneratorDto, {generators: GENERATORS});
    } catch (error) {
      if (error instanceof PassboltApiFetchError && error.data && error.data.code === 404) {
        const default_generator = "password";
        passwordGeneratorDto = Object.assign({}, {default_generator: default_generator}, {generators: GENERATORS});
      } else {
        throw error;
      }
    }
    await PasswordGeneratorLocalStorage.set(passwordGeneratorDto);
    return new PasswordGeneratorEntity(passwordGeneratorDto);
  }

  /**
   * Get the password generator settings from the local storage.
   * If the local storage is unset, initialize it.
   *
   * @return {PasswordGenerator}
   */
  async getOrFindAll() {
    const passwordGeneratorDto = await PasswordGeneratorLocalStorage.get();
    if (typeof passwordGeneratorDto !== 'undefined') {
      return new PasswordGeneratorEntity(passwordGeneratorDto);
    }
    return this.updateLocalStorage();
  }
}

export default PasswordGeneratorModel;
