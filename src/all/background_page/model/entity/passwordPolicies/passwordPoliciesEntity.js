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
 */
import Entity from "../abstract/entity";
import EntitySchema from "../abstract/entitySchema";

const ENTITY_NAME = 'PasswordsPolicies';


class PasswordPoliciesEntity extends Entity {
  constructor(passwordPoliciesDto) {
    super(EntitySchema.validate(
      PasswordPoliciesEntity.ENTITY_NAME,
      passwordPoliciesDto,
      PasswordPoliciesEntity.getSchema()
    ));
  }

  static getSchema() {
    return {
      "type": "object",
      "required": [
        "policy_passphrase_entropy",
        "policy_passphrase_external_services",
        "policy_password_generator_length",
        "policy_passphrase_words_generator_length",
        "policy_allow_mask_upper",
        "policy_allow_mask_lower",
        "policy_allow_mask_digit",
        "policy_allow_mask_special_char1",
        "policy_allow_mask_special_char2",
        "policy_allow_mask_special_char3",
        "policy_allow_mask_special_char4",
        "policy_allow_mask_special_char5",
        "policy_allow_mask_parenthesis",
        "policy_allow_mask_emoji",
        "policy_like_characters",
        "policy_passphrase_words_separator",
        "policy_passphrase_words_case",
      ],
      "properties": {
        "policy_passphrase_entropy": {
          "type": "integer",
          enum: PasswordPoliciesEntity.SUPPORTED_POLICY_ENTROPY
        },
        "policy_password_generator_length": {
          "type": "integer",
        },
        "policy_passphrase_words_generator_length": {
          "type": "integer",
        },
        "policy_passphrase_external_services": {
          "type": "boolean",
        },
        "policy_allow_mask_upper": {
          "type": "boolean",
        },
        "policy_allow_mask_lower": {
          "type": "boolean",
        },
        "policy_allow_mask_digit": {
          "type": "boolean",
        },
        "policy_allow_mask_special_char1": {
          "type": "boolean",
        },
        "policy_allow_mask_special_char2": {
          "type": "boolean",
        },
        "policy_allow_mask_special_char3": {
          "type": "boolean",
        },
        "policy_allow_mask_special_char4": {
          "type": "boolean",
        },
        "policy_allow_mask_special_char5": {
          "type": "boolean",
        },
        "policy_allow_mask_parenthesis": {
          "type": "boolean",
        },
        "policy_allow_mask_emoji": {
          "type": "boolean",
        },
        "policy_like_characters": {
          "type": "boolean",
        },
        "policy_passphrase_words_separator": {
          "type": "string",
        },
        "policy_passphrase_words_case": {
          "type": "string",
        },
      }
    };
  }
  static get SUPPORTED_POLICY_ENTROPY() {
    return [
      0, 50,  64,  80, 96, 128, 160, 192, 224
    ];
  }

  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  get policyPassphraseEntropy() {
    return this._props.policy_passphrase_entropy;
  }

  get policyPassphraseExternalServices() {
    return this._props.policy_passphrase_external_services;
  }
  get policyPasswordGeneratorLength() {
    return this._props.policy_password_generator_length;
  }
  get policyPassphraseWordsGeneratorLength() {
    return this._props.policy_passphrase_words_generator_length;
  }
  get policyAllowMaskUpper() {
    return this._props.policy_allow_mask_upper;
  }
  get policyAllowMaskLower() {
    return this._props.policy_allow_mask_lower;
  }
  get policyAllowMaskDigit() {
    return this._props.policy_allow_mask_digit;
  }
  get policyAllowMaskSpecialChar1() {
    return this._props.policy_allow_mask_special_char1;
  }
  get policyAllowMaskSpecialChar2() {
    return this._props.policy_allow_mask_special_char2;
  }

  get policyAllowMaskSpecialChar3() {
    return this._props.policy_allow_mask_special_char3;
  }
  get policyAllowMaskSpecialChar4() {
    return this._props.policy_allow_mask_special_char4;
  }

  get policyAllowMaskSpecialChar5() {
    return this._props.policy_allow_mask_special_char5;
  }

  get policyAllowMaskParenthesis() {
    return this._props.policy_allow_mask_parenthesis;
  }

  get policyAllowMaskEmoji() {
    return this._props.policy_allow_mask_emoji;
  }

  get policyLikeCharacters() {
    return this._props.policy_like_characters;
  }

  get policyPassphraseWordsSeparator() {
    return this._props.policy_passphrase_words_separator;
  }

  get policyPassphraseWordsCase() {
    return this._props.policy_passphrase_words_case;
  }
}

export default PasswordPoliciesEntity;
