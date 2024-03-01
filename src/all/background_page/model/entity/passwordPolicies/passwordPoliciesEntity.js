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
import PasswordGeneratorSettingsEntity from "./passwordGeneratorSettingsEntity";
import PassphraseGeneratorSettingsEntity from "./passphraseGeneratorSettingsEntity";

const ENTITY_NAME = 'PasswordPolicies';

const POLICY_PASSPHRASE = "passphrase";
const POLICY_PASSWORD = "password";

class PasswordPoliciesEntity extends Entity {
  /**
   * @inheritDoc
   */
  constructor(passwordPoliciesDto, options = {}) {
    super(EntitySchema.validate(
      PasswordPoliciesEntity.ENTITY_NAME,
      passwordPoliciesDto,
      PasswordPoliciesEntity.getSchema()
    ), options);

    // Associations
    if (this._props.password_generator_settings) {
      this._password_generator_settings = PasswordGeneratorSettingsEntity.createFromDefault(this._props.password_generator_settings);
      delete this._props.password_generator_settings;
    }
    if (this._props.passphrase_generator_settings) {
      this._passphrase_generator_settings = PassphraseGeneratorSettingsEntity.createFromDefault(this._props.passphrase_generator_settings);
      delete this._props.passphrase_generator_settings;
    }
  }

  /**
   * Get password policies entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "default_generator",
        "external_dictionary_check",
        "password_generator_settings",
        "passphrase_generator_settings"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
        },
        "external_dictionary_check": {
          "type": "boolean"
        },
        "default_generator": {
          "type": "string",
          "enum": [
            POLICY_PASSWORD,
            POLICY_PASSPHRASE,
          ]
        },
        "password_generator_settings": PasswordGeneratorSettingsEntity.getSchema(),
        "passphrase_generator_settings": PassphraseGeneratorSettingsEntity.getSchema(),
        "source": {
          "type": "string",
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "modified_by": {
          "type": "string",
          "format": "uuid"
        },
      }
    };
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   *
   * @param {object} [contain] optional
   * @returns {object}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }
    if (this._passphrase_generator_settings && contain.passphrase_generator_settings) {
      result.passphrase_generator_settings = this._passphrase_generator_settings.toDto();
    }
    if (this._password_generator_settings && contain.password_generator_settings) {
      result.password_generator_settings = this._password_generator_settings.toDto();
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(PasswordPoliciesEntity.ALL_CONTAIN_OPTIONS);
  }

  /**
   * Returns the specific configuration of the password generator of the current policies
   * @returns {string}
   */
  get passwordGeneratorSettings() {
    return this._password_generator_settings;
  }

  /**
   * Returns the specific configuration of the passphrase generator of the current policies
   * @returns {string}
   */
  get passphraseGeneratorSettings() {
    return this._passphrase_generator_settings;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * PasswordPoliciesEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * PasswordPoliciesEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      passphrase_generator_settings: true,
      password_generator_settings: true,
    };
  }

  /**
   * Return the default settings overriden with the given data if any.
   * @param {PasswordPoliciesDto} data the data to override the entity with
   * @returns {PasswordPoliciesEntity}
   */
  static createFromDefault(data = {}) {
    const passwordGeneratorSettings = PasswordGeneratorSettingsEntity.createFromDefault(data?.password_generator_settings);
    const passphraseGeneratorSettings = PassphraseGeneratorSettingsEntity.createFromDefault(data?.passphrase_generator_settings);

    delete data?.password_generator_settings;
    delete data?.passphrase_generator_settings;

    const defaultData = {
      default_generator: POLICY_PASSWORD,
      external_dictionary_check: true,
      password_generator_settings: passwordGeneratorSettings.toDto(),
      passphrase_generator_settings: passphraseGeneratorSettings.toDto(),
    };

    //ensures the generator type is an existing one, take the default otherwise
    if (data?.default_generator) {
      data.default_generator = data.default_generator === POLICY_PASSPHRASE
        ? POLICY_PASSPHRASE
        : POLICY_PASSWORD;
    }

    const dto = Object.assign(defaultData, data);
    return new PasswordPoliciesEntity(dto);
  }
}

export default PasswordPoliciesEntity;
