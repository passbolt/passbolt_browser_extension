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
 * @since         2.13.0
 */
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

class SecretEntity extends EntityV2 {
  /**
   * @inheritDoc
   * @throws {EntityValidationError} Build Rule: Verify the data is a valid openpgp message.
   */
  constructor(dto, options = {}) {
    super(dto, options);
  }

  /**
   * Get secret entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "data"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "resource_id": {
          "type": "string",
          "format": "uuid"
        },
        "data": {
          "type": "string",
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        }
      }
    };
  }

  /**
   * @inheritDoc
   * @throw {EntityValidationError} If the data is not formatted as a valid pgp message.
   *
   */
  validateBuildRules() {
    SecretEntity.assertValidMessage(this._props.data);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get secret id
   * @returns {string|null} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get secret data
   * @returns {string} armored pgp message
   */
  get data() {
    return this._props.data;
  }

  /**
   * Get secret user id
   * @returns {string|null} uuid
   */
  get userId() {
    return this._props.user_id || null;
  }

  /**
   * Get secret resource id
   * @returns {string|null} uuid
   */
  get resourceId() {
    return this._props.resource_id || null;
  }

  /**
   * Assert a given OpenPGP armored message block is valid
   * @param {string} message
   * @throws {EntityValidationError} if the message is not a valid armored block
   * TODO a-fA-F0-9\=... before readArmored
   * TODO this format validation should be part of the json schema.
   */
  static assertValidMessage(message) {
    const error = new EntityValidationError('This is not a valid OpenPGP armored message');
    if (!message || (typeof message !== 'string') || message === '') {
      error.addError('data', 'empty', 'The OpenPGP armored message should not be empty.');
      throw error;
    }
    if (!message.match(/-----BEGIN PGP MESSAGE-----/)) {
      error.addError('data', 'begin', 'The OpenPGP armored message should contain a start delimiter.');
      throw error;
    }
    if (!message.match(/-----END PGP MESSAGE-----/)) {
      error.addError('data', 'end', 'The OpenPGP armored message should contain an end delimiter.');
      throw error;
    }
  }
}

export default SecretEntity;
