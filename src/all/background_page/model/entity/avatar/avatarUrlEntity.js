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

const ENTITY_NAME = "AvatarUrl";
const AVATAR_URL_SIZE_SMALL = "small";
const AVATAR_URL_SIZE_MEDIUM = "medium";

class AvatarUrlEntity extends EntityV2 {
  /**
   * Get avatar entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        AvatarUrlEntity.AVATAR_URL_SIZE_MEDIUM,
        AvatarUrlEntity.AVATAR_URL_SIZE_SMALL
      ],
      "properties": {
        "medium": {
          "type": "string",
        },
        "small": {
          "type": "string",
        }
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get url (medium size)
   * @returns {string}
   */
  get medium() {
    return this._props.medium;
  }

  /**
   * Get url (small size)
   * @returns {string}
   */
  get small() {
    return this._props.small;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AvatarUrlEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AvatarUrlEntity.AVATAR_URL_SIZE_MEDIUM
   * @returns {string}
   */
  static get AVATAR_URL_SIZE_MEDIUM() {
    return AVATAR_URL_SIZE_MEDIUM;
  }

  /**
   * AvatarUrlEntity.AVATAR_URL_SIZE_SMALL
   * @returns {string}
   */
  static get AVATAR_URL_SIZE_SMALL() {
    return AVATAR_URL_SIZE_SMALL;
  }
}

export default AvatarUrlEntity;
