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
const {PasswordGeneratorEntity} = require('../entity/passordGenerator/passwordGeneratorEntity');
const {PasswordGeneratorLocalStorage} = require('../../service/local_storage/passwordGeneratorLocalStorage');
const {PasswordGeneratorService} = require('../../service/api/passwordGenerator/passwordGeneratorService');
const PassboltApiFetchError = require('../../error/passboltApiFetchError').PassboltApiFetchError;
const {Log} = require('../../model/log');

/** List of possible generator types */
const GENERATORS =  [
  {
    "name": "Passphrase",
    "type": "passphrase",
    "default_options":{
      "word_count": 8,
      "word_case": "lowercase",
      "min_word": 4,
      "max_word": 40,
      "separator": " "
    },
  },
  {
    "name": "Password",
    "type": "password",
    "default_options":{
      "length": 18,
      "look_alike": true,
      "min_length": 8,
      "max_length": 128,
    },
    "masks": [
      {
        "name": "upper",
        "label": "A-Z",
        "characters": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "active": true
      },
      {
        "name": "lower",
        "label": "a-z",
        "characters": "abcdefghijklmnopqrstuvwxyz",
        "active": true
      },
      {
        "name": "digit",
        "label": "0-9",
        "characters": "0123456789",
        "active": true
      },
      {
        "name": "special_char1",
        "label": "# $ % & @ ^ ~",
        "characters": "#$%&@^~",
        "active": true
      },
      {
        "name": "parenthesis",
        "label": "{ [ ( | ) ] ] }",
        "characters": "([|])",
        "active": true
      },
      {
        "name": "special_char2",
        "label": ". , : ;",
        "characters": ".,:;",
        "active": true
      },
      {
        "name": "special_char3",
        "label": "' \" `",
        "characters": "'\"`",
        "active": true
      },
      {
        "name": "special_char4",
        "label": "/ \\ _ -",
        "characters": "/\\_-",
        "active": true
      },
      {
        "name": "special_char5",
        "label": "< * + ! ? =",
        "characters": "<*+!?=",
        "active": true
      },
      {
        "name": "emoji",
        "label": "😘",
        "characters": "😀😃😄😁😆😅😂🤣🥲☺️😊😇🙂🙃😉😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎🥸🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺😢😭😤😠😡🤬🤯😳🥵🥶😱😨😰😥😓🤗🤔🤭🤫🤥😶😐😑😬🙄😯😦😧😮😲🥱😴🤤😪😵🤐🥴🤢🤮🤧😷🤒🤕🤑🤠😈👿👹👺🤡💩👻💀☠️👽👾🤖🎃😺😸😹😻😼😽🙀😿😾"
      }
    ],
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
  async updateLocalStorage () {
    let passwordGeneratorDto = {};
    try {
      passwordGeneratorDto = await this.passwordGeneratorService.find();
      passwordGeneratorDto = Object.assign({}, passwordGeneratorDto, {generators: GENERATORS});
    } catch (error) {
      if (error instanceof PassboltApiFetchError && error.data && error.data.code === 404) {
        const default_generator = "passphrase";
        passwordGeneratorDto = Object.assign({}, {default_generator}, {generators: GENERATORS});
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

exports.PasswordGeneratorModel = PasswordGeneratorModel;
