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
 * @since         3.4.0
 */
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');

const ENTITY_NAME = 'AccountRecoveryOrganizationPublicKey';
const FINGERPRINT_LENGTH = 40;

class AccountRecoveryOrganizationPublicKeyEntity extends Entity {
  /**
   * Resource entity constructor
   *
   * @param {Object} resourceDto resource DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryOrganizationPublicKeyDto) {
    super(EntitySchema.validate(
      AccountRecoveryOrganizationPublicKeyEntity.ENTITY_NAME,
      accountRecoveryOrganizationPublicKeyDto,
      AccountRecoveryOrganizationPublicKeyEntity.getSchema()
    ));
  }

  /**
   * Get resource entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "armored_key"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "armored_key": {
          "type": "string",
        },
        "fingerprint": {
          "anyOf": [{
            "type": "string",
            "length": FINGERPRINT_LENGTH
          }, {
            "type": "null"
          }]
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified_by": {
          "type": "string",
          "format": "uuid"
        },
        "deleted": {
          "type": "string",
          "format": "date-time"
        }
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
  toDto() {
    return Object.assign({}, this._props);
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ResourceEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

exports.AccountRecoveryOrganizationPublicKeyEntity = AccountRecoveryOrganizationPublicKeyEntity;
