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
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');

const ENTITY_NAME = 'Avatar';
const AVATAR_URL_SIZE_SMALL = 'small';
const AVATAR_URL_SIZE_MEDIUM = 'medium';

class AvatarEntity extends Entity {
  /**
   * Avatar entity constructor
   *
   * @param {Object} avatarDto avatar DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(avatarDto) {
    super(EntitySchema.validate(
      AvatarEntity.ENTITY_NAME,
      avatarDto,
      AvatarEntity.getSchema()
    ));
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
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "url": {
          "type": "object",
          "required": [
            AvatarEntity.AVATAR_URL_SIZE_MEDIUM,
            AvatarEntity.AVATAR_URL_SIZE_SMALL
          ],
          "properties": {
            "medium": {
              "type": "string",
              // "format": "x-url"
            },
            "small": {
              "type": "string",
              // "format": "x-url"
            }
          }
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
      }
    }
  }

  // ==================================================
  // Dynamic properties getters
  // ==================================================
  /**
   * Get avatar id
   * @returns {string} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get user id
   * @returns {*}
   */
  get userId() {
    return this._props.user_id || null;
  }

  /**
   * Get url (medium size)
   * @returns {*}
   */
  get urlMedium() {
    return this._props.url["medium"];
  }

  /**
   * Get url (small size)
   * @returns {*}
   */
  get urlSmall() {
    return this._props.url["small"];
  }

  /**
   * Get avatar url
   *
   * @param {string} size medium|small
   * @returns {string} admin or user
   */
   getUrl(size) {
    if (!size) {
      throw new TypeError('A size is needed.');
    }
    if (size !== 'medium' || size !== 'small') {
      throw new TypeError('Invalid size, use small or medium.');
    }
    return this._props.url[size];
  }

  /**
   * Get avatar creation date
   * @returns {string} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get avatar modification date
   * @returns {string} date
   */
  get modified() {
    return this._props.modified || null;
  }

  // ==================================================
  // Static properties getters
  // ==================================================
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

exports.AvatarEntity = AvatarEntity;
