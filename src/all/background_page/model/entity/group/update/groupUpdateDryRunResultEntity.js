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
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";
import NeededSecretsCollection from "../../secret/needed/neededSecretsCollection";
import GroupUpdateSecretsCollection from "../../secret/groupUpdate/groupUpdateSecretsCollection";

class GroupUpdateDryRunResultEntity extends EntityV2 {
  /**
   * @inheritDoc
   */
  constructor(dto, options = {}) {
    super(dto, options);

    // Association
    if (this._props.secrets) {
      this._secrets = new GroupUpdateSecretsCollection(this._props.secrets, {clone: false});
      delete this._props.secrets;
    }
    if (this._props.needed_secrets) {
      this._needed_secrets = new NeededSecretsCollection(this._props.needed_secrets, {clone: false});
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
        "secrets": GroupUpdateSecretsCollection.getSchema(),
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
   * @returns {GroupUpdateSecretsCollection|null}
   */
  get secrets() {
    return this._secrets || null;
  }

  /**
   * Return needed secrets
   * @returns {NeededSecretsCollection|null}
   */
  get neededSecrets() {
    return this._needed_secrets || null;
  }
}

export default GroupUpdateDryRunResultEntity;
