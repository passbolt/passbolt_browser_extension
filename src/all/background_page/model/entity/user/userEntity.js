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
const {RoleEntity} = require('../role/roleEntity');
const {ProfileEntity} = require('../profile/profileEntity');
const {GpgkeyEntity} = require('../gpgkey/gpgkeyEntity');

const ENTITY_NAME = 'User';

class UserEntity extends Entity {
  /**
   * User entity constructor
   *
   * @param {Object} userDto user DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(userDto) {
    super(EntitySchema.validate(
      UserEntity.ENTITY_NAME,
      UserEntity._cleanupLastLoginDate(userDto),
      UserEntity.getSchema()
    ));

    // Associations
    if (this._props.profile) {
      this._profile = new ProfileEntity(this._props.profile);
      delete this._props.profile;
    }
    if (this._props.role) {
      this._role = new RoleEntity(this._props.role);
      delete this._props.role;
    }
    if (this._props.gpgkey) {
      this._gpgkey = new GpgkeyEntity(this._props.gpgkey);
      delete this._props.gpgkey;
    }
  }

  /**
   * Get user entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "username",
        "role_id",
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "role_id": {
          "type": "string",
          "format": "uuid"
        },
        "username": {
          "type": "string",
          "format": "email"
        },
        "active": {
          "type": "boolean"
        },
        "deleted": {
          "type": "boolean"
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "last_logged_in": {
          "anyOf": [{
            "type": "string",
            "format": "date-time"
          }, {
            "type": "null"
          }]
        },
        "role": RoleEntity.getSchema(),
        "profile": ProfileEntity.getSchema(),
        "gpgkey": GpgkeyEntity.getSchema(),
        //groups_users
        //gpgkey
      }
    }
  }

  /**
   * API returns "" for users that never logged in, convert this to null
   * @param {object} dto
   * @return {object} dto
   * @private
   */
  static _cleanupLastLoginDate(dto) {
    if (dto && dto.last_logged_in === '') {
      dto.last_logged_in = null;
    }
    return dto;
  }

  // ==================================================
  // Serialization
  // ==================================================
  /**
   * Return a DTO ready to be sent to API
   * @param {object} [contain] optional for example {profile: {avatar:true}}
   * @returns {*}
   */
  toDto(contain) {
    let result = Object.assign({}, this._props);
    if (contain && contain.role) {
      result.role = this.role ? this.role.toDto() : null;
    }
    if (contain && contain.profile) {
      if (contain.profile === true) {
        result.profile = this.profile.toDto();
      } else {
        result.profile = this.profile.toDto(contain.profile);
      }
    }
    if (contain && contain.gpgkey) {
      if (this.gpgkey) {
        result.gpgkey = this.gpgkey ? this.gpgkey.toDto() : null;
      }
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
  }

  // ==================================================
  // Dynamic properties getters
  // ==================================================
  /**
   * Get user id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get user role id
   * @returns {string} uuid
   */
  get roleId() {
    return this._props.role_id;
  }

  /**
   * Get user username
   * @returns {string} email
   */
  get username() {
    return this._props.username;
  }

  /**
   * Get user activation status
   * @returns {(boolean|null)} true if user completed the setup
   */
  get isActive() {
    return this._props.active || null;
  }

  /**
   * Get user deleted status
   * @returns {(boolean|null)} true if user is deleted
   */
  get isDeleted() {
    return this._props.deleted || null;
  }

  /**
   * Get user creation date
   * @returns {(string|null)} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get user modification date
   * @returns {(string|null)} date
   */
  get modified() {
    return this._props.modified || null;
  }

  /**
   * Get user last login date
   * @returns {(string|null)} date
   */
  get lastLoggedIn() {
    return this._props.last_logged_in || null;
  }

  /**
   * FolderEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {profile: ProfileEntity.ALL_CONTAIN_OPTIONS, role:true, gpgkey: true};
  }

  // ==================================================
  // Static properties getters
  // ==================================================
  /**
   * ProfileEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  // ==================================================
  // Associated properties getters
  // ==================================================
  /**
   * Get user profile
   * @returns {ProfileEntity} profile
   */
  get profile() {
    return this._profile || null;
  }

  /**
   * Get user role
   * @returns {RoleEntity} role
   */
  get role() {
    return this._role || null;
  }

  /**
   * Get user gpgkey
   * @returns {GpgkeyEntity} key
   */
  get gpgkey() {
    return this._gpgkey || null;
  }
}

exports.UserEntity = UserEntity;
