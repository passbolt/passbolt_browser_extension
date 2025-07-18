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
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import PendingAccountRecoveryRequestEntity from "passbolt-styleguide/src/shared/models/entity/accountRecovery/pendingAccountRecoveryRequestEntity";
import GpgkeyEntity from "passbolt-styleguide/src/shared/models/entity/gpgkey/gpgkeyEntity";
import ProfileEntity from "passbolt-styleguide/src/shared/models/entity/profile/profileEntity";
import GroupsUsersCollection from "passbolt-styleguide/src/shared/models/entity/groupUser/groupsUsersCollection";
import AccountRecoveryUserSettingEntity from "passbolt-styleguide/src/shared/models/entity/accountRecovery/accountRecoveryUserSettingEntity";
import AppEmailValidatorService from "../../../service/validator/appEmailValidatorService";

const ENTITY_NAME = 'User';

class UserEntity extends EntityV2 {
  /**
   * @inheritDoc
   */
  constructor(dto, options = {}) {
    super(dto, options);

    // Associations
    if (this._props.profile) {
      this._profile = new ProfileEntity(this._props.profile, {...options, clone: false});
      delete this._props.profile;
    }
    if (this._props.role) {
      this._role = new RoleEntity(this._props.role, {...options, clone: false});
      delete this._props.role;
    }
    if (this._props.gpgkey) {
      this._gpgkey = new GpgkeyEntity(this._props.gpgkey, {...options, clone: false});
      delete this._props.gpgkey;
    }
    if (this._props.groups_users) {
      this._groups_users = new GroupsUsersCollection(this._props.groups_users, {...options, clone: false});
      delete this._props.groups_users;
    }
    if (this._props.account_recovery_user_setting) {
      this._account_recovery_user_setting = new AccountRecoveryUserSettingEntity(this._props.account_recovery_user_setting, {...options, clone: false});
      delete this._props.account_recovery_user_setting;
    }
    if (this._props.pending_account_recovery_request) {
      this._pending_account_recovery_request = new PendingAccountRecoveryRequestEntity(this._props.pending_account_recovery_request, {...options, clone: false});
      delete this._props.pending_account_recovery_request;
    }
  }

  /**
   * @inheritDoc
   * Marshall the last_logged_in to null if empty string given
   */
  marshall() {
    if (this._props.last_logged_in === "") {
      this._props.last_logged_in = null;
    }
    super.marshall();
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
        // "role_id",
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
          "custom": AppEmailValidatorService.validate
        },
        "active": {
          "type": "boolean"
        },
        "deleted": {
          "type": "boolean"
        },
        "disabled": {
          "type": "string",
          "format": "date-time",
          "nullable": true,
        },
        "missing_metadata_key_ids": {
          "type": "array",
          "items": {
            "type": "string",
            "format": "uuid"
          },
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
          "type": "string",
          "format": "date-time",
          "nullable": true,
        },
        "is_mfa_enabled": {
          "type": "boolean",
          "nullable": true,
        },
        "locale": {
          "type": "string",
          "pattern": /^[a-z]{2}-[A-Z]{2}$/,
          "nullable": true,
        },
        // Associated models
        "role": RoleEntity.getSchema(),
        "profile": ProfileEntity.getSchema(),
        "gpgkey": GpgkeyEntity.getSchema(),
        "groups_users": GroupsUsersCollection.getSchema(),
        "account_recovery_user_setting": AccountRecoveryUserSettingEntity.getSchema(),
        "pending_account_recovery_request": PendingAccountRecoveryRequestEntity.getSchema()
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
   * @param {object} [contain] optional for example {profile: {avatar:true}}
   * @returns {*}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }
    if (this.role && contain.role) {
      result.role = this.role.toDto();
    }
    if (this.profile && contain.profile) {
      if (contain.profile === true) {
        result.profile = this.profile.toDto();
      } else {
        result.profile = this.profile.toDto(contain.profile);
      }
    }
    if (this.gpgkey && contain.gpgkey) {
      result.gpgkey = this.gpgkey.toDto();
    }
    if (this.groupsUsers && contain.groups_users) {
      result.groups_users = this.groupsUsers.toDto();
    }
    if (this.accountRecoveryUserSetting && contain.account_recovery_user_setting) {
      result.account_recovery_user_setting = this.accountRecoveryUserSetting.toDto();
    }
    if (this.pendingAccountRecoveryUserRequest && contain.pending_account_recovery_request) {
      result.pending_account_recovery_request = this.pendingAccountRecoveryUserRequest.toDto();
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

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get user id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get user role id
   * @returns {(string|null)} uuid
   */
  get roleId() {
    return this._props.role_id || null;
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
    if (typeof this._props.active === 'undefined') {
      return null;
    }
    return this._props.active;
  }

  /**
   * Get user deleted status
   * @returns {(boolean|null)} true if user is deleted
   */
  get isDeleted() {
    if (typeof this._props.deleted === 'undefined') {
      return null;
    }
    return this._props.deleted;
  }

  /**
   * Get missing metadata keys ids for a user
   * @returns {(array)} the list of missing metadata keys
   */
  get missingMetadataKeysIds() {
    return this._props.missing_metadata_key_ids || [];
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
   * Get mfa enabled flag
   * @returns {(boolean|null)} true if mfa is enabled
   */
  get isMfaEnabled() {
    if (typeof this._props.is_mfa_enabled === 'undefined') {
      return null;
    }
    return this._props.is_mfa_enabled;
  }

  /**
   * Get the user locale.
   * @returns {(string|null)}
   */
  get locale() {
    return this._props.locale || null;
  }

  /**
   * Set the user locale
   * @params {string} locale The locale to set
   */
  set locale(locale) {
    this._props.locale = locale;
  }

  /**
   * Set the user missing metadata keys ids
   * @params {array} the missing metadata keys ids
   */
  set missingMetadataKeysIds(missingMetadataKeysIds) {
    this._props.missing_metadata_key_ids = missingMetadataKeysIds;
  }

  /**
   * UserEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      profile: ProfileEntity.ALL_CONTAIN_OPTIONS,
      role: true, gpgkey: true,
      groups_users: true,
      account_recovery_user_setting: true,
      pending_account_recovery_request: true
    };
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

  /*
   * ==================================================
   * Associated properties getters
   * ==================================================
   */
  /**
   * Get user profile
   * @returns {(ProfileEntity|null)} profile
   */
  get profile() {
    return this._profile || null;
  }

  /**
   * Get user role
   * @returns {(RoleEntity|null)} role
   */
  get role() {
    return this._role || null;
  }

  /**
   * Get user gpgkey
   * @returns {(GpgkeyEntity|null)} key
   */
  get gpgkey() {
    return this._gpgkey || null;
  }

  /**
   * Get user groups
   * @returns {(GroupsUsersCollection|null)} users groups
   */
  get groupsUsers() {
    return this._groups_users || null;
  }

  /**
   * Get user account recover setting
   * @returns {(AccountRecoveryUserSettingEntity|null)} account recover setting
   */
  get accountRecoveryUserSetting() {
    return this._account_recovery_user_setting || null;
  }

  /**
   * Get the pending account recovery request
   * @returns {AccountRecoveryRequestEntity|null} pending account recovery request
   */
  get pendingAccountRecoveryUserRequest() {
    return this._pending_account_recovery_request || null;
  }
}

export default UserEntity;
