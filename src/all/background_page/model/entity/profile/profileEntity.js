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

import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import AvatarEntity from "../avatar/avatarEntity";

const ENTITY_NAME = 'Profile';

class ProfileEntity extends Entity {
  /**
   * Profile entity constructor
   *
   * @param {Object} profileDto profile DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(profileDto) {
    super(EntitySchema.validate(
      ProfileEntity.ENTITY_NAME,
      profileDto,
      ProfileEntity.getSchema()
    ));

    // Association
    if (this._props.avatar) {
      this._avatar = new AvatarEntity(this._props.avatar);
      delete this._props.avatar;
    }
  }

  /**
   * Get profile entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "first_name",
        "last_name"
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
        "first_name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 255
        },
        "last_name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 255
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "avatar": AvatarEntity.getSchema()
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
   * @param {object} [contain] optional example {avatar: true}
   * @returns {*}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (this.avatar && contain && contain.avatar) {
      result.avatar = this.avatar.toDto();
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(ProfileEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * ProfileEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * PermissionEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {avatar: true};
  }

  /*
   * ==================================================
   * Default properties getters
   * ==================================================
   */
  /**
   * Get profile id
   * @returns {string|null} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get name (first and last name)
   * @returns {string}
   */
  get name() {
    return `${this._props.first_name} ${this._props.last_name}`;
  }

  /**
   * Get first name
   * @returns {string}
   */
  get firstName() {
    return this._props.first_name;
  }

  /**
   * Get first name
   * @returns {string}
   */
  get lastName() {
    return this._props.last_name;
  }

  /**
   * Get user id
   * @returns {string|null} uuid
   */
  get userId() {
    return this._props.user_id || null;
  }

  /**
   * Get profile creation date
   * @returns {(string|null)} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get profile modification date
   * @returns {(string|null)} date
   */
  get modified() {
    return this._props.modified || null;
  }

  /*
   * ==================================================
   * Associated properties getters
   * ==================================================
   */
  /**
   * Get the associated avatar entity if any
   * @returns {AvatarEntity|null}
   */
  get avatar() {
    return this._avatar || null;
  }
}

export default ProfileEntity;
