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
 * @since         3.0.0
 */
import GroupUserTransfersCollection from "../../groupUser/transfer/groupUserTransfersCollection";
import PermissionTransfersCollection from "../../permission/transfer/permissionTransfersCollection";
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";


class UserDeleteTransferEntity extends EntityV2 {
  /**
   * @inheritDoc
   */
  constructor(dto, options = {}) {
    super(dto, options);

    // Association
    if (this._props.owners) {
      this._owners = new PermissionTransfersCollection(this._props.owners, {clone: false});
      delete this._props.owners;
    }
    if (this._props.managers) {
      this._managers = new GroupUserTransfersCollection(this._props.managers, {clone: false});
      delete this._props.managers;
    }
  }

  /**
   * @inheritDoc
   */
  // eslint-disable-next-line no-unused-vars
  validateBuildRules(_) {
    if (!this._props.owners && !this._props.managers) {
      throw new EntityValidationError(`The user delete transfer data cannot be empty.`);
    }
  }

  /**
   * Get role entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [],
      "properties": {
        "owners": PermissionTransfersCollection.getSchema(),
        "managers": GroupUserTransfersCollection.getSchema()
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
   * @returns {Object} with owners and/or managers key set
   */
  toDto() {
    const result = {};
    if (this._owners) {
      result.owners = this._owners.toDto();
    }
    if (this._managers) {
      result.managers = this._managers.toDto();
    }
    return result;
  }
}

export default UserDeleteTransferEntity;
