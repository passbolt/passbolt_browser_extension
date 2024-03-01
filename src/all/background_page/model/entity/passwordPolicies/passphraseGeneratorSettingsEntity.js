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
 * @since         4.2.0
 */

import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'PassphraseGeneratorSettings';

const PASSPHRASE_WORDS_UPPERCASE = "uppercase";
const PASSPHRASE_WORDS_LOWERCASE = "lowercase";
const PASSPHRASE_WORDS_CAMELCASE = "camelcase";

class PassphraseGeneratorSettingsEntity extends Entity {
  /**
   * @inheritDoc
   */
  constructor(passphraseGeneratorSettingsDto, options = {}) {
    super(EntitySchema.validate(
      PassphraseGeneratorSettingsEntity.ENTITY_NAME,
      passphraseGeneratorSettingsDto,
      PassphraseGeneratorSettingsEntity.getSchema()
    ), options);
  }

  /**
   * Get passphrase generator settings entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "words",
        "word_separator",
        "word_case",
        "min_words",
        "max_words",
      ],
      "properties": {
        "words": {
          "type": "integer",
          "minimum": 4,
          "maximum": 40,
        },
        "word_separator": {
          "type": "string",
          "maxLength": 10,
        },
        "word_case": {
          "type": "string",
          "enum": [
            PASSPHRASE_WORDS_UPPERCASE,
            PASSPHRASE_WORDS_LOWERCASE,
            PASSPHRASE_WORDS_CAMELCASE,
          ]
        },
        "min_words": {
          "type": "integer",
        },
        "max_words": {
          "type": "integer",
        }
      }
    };
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * PassphraseGeneratorSettingsEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * Return the default settings overriden with the given data if any.
   * @param {PasswordPoliciesDto} data the data to override the entity with
   * @returns {PasswordPoliciesEntity}
   */
  static createFromDefault(data = {}) {
    const defaultDto = Object.assign({
      words: 9,
      min_words: 4,
      max_words: 40,
      word_separator: " ",
      word_case: PASSPHRASE_WORDS_LOWERCASE,
    }, data);

    return new PassphraseGeneratorSettingsEntity(defaultDto);
  }
}

export default PassphraseGeneratorSettingsEntity;
