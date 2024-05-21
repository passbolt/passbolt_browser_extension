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
import AvatarUrlEntity from "./avatarUrlEntity";

const ENTITY_NAME = 'Avatar';
const AVATAR_URL_SIZE_SMALL = 'small';
const AVATAR_URL_SIZE_MEDIUM = 'medium';

class AvatarEntity extends EntityV2 {
  /**
   * @inheritDoc
   */
  constructor(dto = {}, options = {}) {
    super(dto, options);

    // Associations
    if (this._props.url) {
      this._url = new AvatarUrlEntity(this._props.url, {...options, clone: false});
      delete this._props.url;
    }
  }

  /**
   * Get avatar entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "url"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "url": AvatarUrlEntity.getSchema(),
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get avatar id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get url (medium size)
   * @returns {string}
   */
  get urlMedium() {
    return this._url.medium;
  }

  /**
   * Get url (small size)
   * @returns {string}
   */
  get urlSmall() {
    return this._url.small;
  }

  /**
   * Get avatar creation date
   * @returns {(string|null)} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get avatar modification date
   * @returns {(string|null)} date
   */
  get modified() {
    return this._props.modified || null;
  }

  /**
   * Return a DTO ready to be sent to API
   * @param {object} [contain] optional for example {profile: {avatar:true}}
   * @returns {*}
   */
  toDto(contain) {
    const result = super.toDto(contain);
    result.url = this._url.toDto();
    return result;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * AvatarEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AvatarEntity.AVATAR_URL_SIZE_MEDIUM
   * @returns {string}
   */
  static get AVATAR_URL_SIZE_MEDIUM() {
    return AVATAR_URL_SIZE_MEDIUM;
  }

  /**
   * AvatarEntity.AVATAR_URL_SIZE_SMALL
   * @returns {string}
   */
  static get AVATAR_URL_SIZE_SMALL() {
    return AVATAR_URL_SIZE_SMALL;
  }
}

export default AvatarEntity;
