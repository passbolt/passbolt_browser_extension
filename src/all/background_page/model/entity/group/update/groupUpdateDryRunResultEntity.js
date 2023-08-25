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
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import NeededSecretsCollection from "../../secret/needed/neededSecretsCollection";
import SecretsCollection from "../../secret/secretsCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'GroupUpdateDryRunResult';

class GroupUpdateDryRunResultEntity extends Entity {
  /**
   * GroupUpdateDryRunResult entity constructor
   *
   * @param {Object} groupUpdateDryRunResultDto DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(groupUpdateDryRunResultDto) {
    super(EntitySchema.validate(
      GroupUpdateDryRunResultEntity.ENTITY_NAME,
      groupUpdateDryRunResultDto,
      GroupUpdateDryRunResultEntity.getSchema()
    ));

    // Association
    if (this._props.secrets) {
      this._secrets = new SecretsCollection(this._props.secrets);
      delete this._props.secrets;
    }
    if (this._props.needed_secrets) {
      this._needed_secrets = new NeededSecretsCollection(this._props.needed_secrets);
      delete this._props.needed_secrets;
    }
  }

  /**
   * Get group entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [],
      "properties": {
        // Associations
        "secrets": SecretsCollection.getSchema(),
        "needed_secrets": NeededSecretsCollection.getSchema()
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
   * @returns {*}
   */
  toDto() {
    const result = Object.assign({}, this._props);
    if (this._secrets) {
      result.secrets = this._secrets.toDto();
    }
    if (this._needed_secrets) {
      result.needed_secrets = this._needed_secrets.toDto();
    }
    return result;
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
   * Other associated properties methods
   * ==================================================
   */

  /**
   * Return secrets
   * @returns {(SecretsCollection|null)}
   */
  get secrets() {
    return this._secrets || null;
  }

  /**
   * Return needed secrets
   * @returns {(SecretsCollection|null)}
   */
  get neededSecrets() {
    return this._needed_secrets || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * GroupEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default GroupUpdateDryRunResultEntity;
