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
import PermissionTransfersCollection from "../../permission/transfer/permissionTransfersCollection";
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

class GroupDeleteTransferEntity extends EntityV2 {
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
  }

  /*
   * ==================================================
   * Validation
   * ==================================================
   */
  /**
   * Get role entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "owners"
      ],
      "properties": {
        "owners": PermissionTransfersCollection.getSchema()
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
    return result;
  }
}

export default GroupDeleteTransferEntity;
