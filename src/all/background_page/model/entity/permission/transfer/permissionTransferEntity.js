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
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

class PermissionTransferEntity extends EntityV2 {
  /**
   * Get permissionTransfer entity schema
   *
   * @returns {Object} schema
   * @public
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id", // Permission ID to promote to permission
        "aco_foreign_key", // Resource or Folder UUID
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "aco_foreign_key": {
          "type": "string",
          "format": "uuid"
        },
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get permission id
   *
   * @returns {string} uuid
   * @public
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get target resource or folder uuid
   *
   * @returns {string} uuid
   * @public
   */
  get acoForeignKey() {
    return this._props.aco_foreign_key;
  }
}

export default PermissionTransferEntity;
