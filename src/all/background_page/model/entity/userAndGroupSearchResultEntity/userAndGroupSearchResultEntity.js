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
 * @since         4.9.0
 */
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";
import GroupEntity from "../group/groupEntity";
import UserEntity from "../user/userEntity";

const ENTITY_NAME = 'UserAndGroupSearchResult';

/**
 * User and group search result entity
 */
class UserAndGroupSearchResultEntity extends EntityV2 {
  /**
   * @inheritDoc
   */
  marshall() {
    if (Object.prototype.hasOwnProperty.call(this._props, 'user_count') && typeof(this._props.user_count) === 'string') {
      // the API might respond with a string for the user_count
      this._props.user_count = parseInt(this._props.user_count, 10);
    }
    super.marshall();
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const userSchema = UserEntity.getSchema();
    const groupSchema = GroupEntity.getSchema();

    return {
      "type": "object",
      "required": [
        "id",
      ],
      "properties": {
        //common
        "id": {
          "type": "string",
          "format": "uuid",
        },

        //user
        "username": userSchema.properties.username,
        "profile": userSchema.properties.profile,

        //group
        "name": groupSchema.properties.name,
        "user_count": {
          "type": "integer",
        },
      }
    };
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * UserAndGroupSearchResultEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default UserAndGroupSearchResultEntity;
