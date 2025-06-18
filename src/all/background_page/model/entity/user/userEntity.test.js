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
import UserEntity from "./userEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {
  customEmailValidationProOrganizationSettings
} from "../organizationSettings/organizationSettingsEntity.test.data";
import OrganizationSettingsModel from "../../organizationSettings/organizationSettingsModel";
import OrganizationSettingsEntity from "../organizationSettings/organizationSettingsEntity";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import ProfileEntity from "passbolt-styleguide/src/shared/models/entity/profile/profileEntity";
import GpgkeyEntity from "passbolt-styleguide/src/shared/models/entity/gpgkey/gpgkeyEntity";
import AccountRecoveryUserSettingEntity from "passbolt-styleguide/src/shared/models/entity/accountRecovery/accountRecoveryUserSettingEntity";
import PendingAccountRecoveryRequestEntity from "passbolt-styleguide/src/shared/models/entity/accountRecovery/pendingAccountRecoveryRequestEntity";
import {defaultGroupUser} from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity.test.data.js";
import {v4 as uuid} from "uuid";

describe("UserEntity", () => {
  describe("UserEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(UserEntity.ENTITY_NAME, UserEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(UserEntity, "id");
      assertEntityProperty.uuid(UserEntity, "id");
      assertEntityProperty.notRequired(UserEntity, "id");
    });

    it("validates role_id property", () => {
      assertEntityProperty.string(UserEntity, "role_id");
      assertEntityProperty.uuid(UserEntity, "role_id");
      assertEntityProperty.notRequired(UserEntity, "role_id");
    });

    it("validates username property", () => {
      assertEntityProperty.string(UserEntity, "username");
      assertEntityProperty.email(UserEntity, "username");
      assertEntityProperty.required(UserEntity, "username");
    });

    it("validates username with custom validation rule", () => {
      expect.assertions(2);
      const organizationSettings = customEmailValidationProOrganizationSettings();
      OrganizationSettingsModel.set(new OrganizationSettingsEntity(organizationSettings));
      const dto = defaultUserDto({username: "ada@passbolt.c"});
      const entity = new UserEntity(dto);
      expect(entity.username).toEqual("ada@passbolt.c");
      /*
       * Ensure that the custom formula used to validate the format of the email is dynamic, and can be changed even if the
       * entity schema is cached. This formula might loaded after the schema was cached and could lead to user not valid.
       */
      OrganizationSettingsModel.flushCache();
      expect(() => new UserEntity(dto)).toThrowEntityValidationError("username", "custom");
    });

    it("validates active property", () => {
      assertEntityProperty.boolean(UserEntity, "active");
      assertEntityProperty.notRequired(UserEntity, "active");
    });

    it("validates deleted property", () => {
      assertEntityProperty.boolean(UserEntity, "deleted");
      assertEntityProperty.notRequired(UserEntity, "deleted");
    });

    it("validates disabled property", () => {
      assertEntityProperty.dateTime(UserEntity, "disabled");
      assertEntityProperty.nullable(UserEntity, "disabled");
      assertEntityProperty.notRequired(UserEntity, "disabled");
    });

    it("validates created property", () => {
      assertEntityProperty.string(UserEntity, "created");
      assertEntityProperty.dateTime(UserEntity, "created");
      assertEntityProperty.notRequired(UserEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(UserEntity, "modified");
      assertEntityProperty.dateTime(UserEntity, "modified");
      assertEntityProperty.notRequired(UserEntity, "modified");
    });

    it("validates last_logged_in property", () => {
      const failDatetimeScenario = [
        {scenario: "not a date", value: "not-a-date"},
        {scenario: "year, month, day, time and zulu", value: "2018-10-18T08:04:30+00:00Z"},
      ];

      assertEntityProperty.assert(UserEntity, "last_logged_in", assertEntityProperty.SUCCESS_DATETIME_SCENARIO, failDatetimeScenario, "format");
      assertEntityProperty.nullable(UserEntity, "last_logged_in");
      assertEntityProperty.notRequired(UserEntity, "last_logged_in");
    });

    it("validates is_mfa_enabled property", () => {
      assertEntityProperty.boolean(UserEntity, "is_mfa_enabled");
      assertEntityProperty.nullable(UserEntity, "is_mfa_enabled");
      assertEntityProperty.notRequired(UserEntity, "is_mfa_enabled");
    });

    it("validates locale property", () => {
      assertEntityProperty.locale(UserEntity, "locale");
      assertEntityProperty.nullable(UserEntity, "locale");
      assertEntityProperty.notRequired(UserEntity, "locale");
    });
  });

  describe("UserEntity::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      const dto = {
        "username": "ada@passbolt.com",
      };
      const entity = new UserEntity(dto);
      expect(entity.toDto()).toEqual(dto);
      expect(entity.id).toBe(null);
      expect(entity.username).toEqual(dto.username);
      expect(entity.roleId).toBeNull();
      expect(entity.isActive).toBeNull();
      expect(entity.isDeleted).toBeNull();
      expect(entity.created).toBeNull();
      expect(entity.modified).toBeNull();
      expect(entity.lastLoggedIn).toBeNull();
      expect(entity.isMfaEnabled).toBeNull();
      expect(entity.locale).toBeNull();
      expect(entity.profile).toBeNull();
      expect(entity.gpgkey).toBeNull();
      expect(entity.groupsUsers).toBeNull();
      expect(entity.accountRecoveryUserSetting).toBeNull();
      expect(entity.pendingAccountRecoveryUserRequest).toBeNull();
    });

    it("works if valid DTO with associated entity data is provided", () => {
      const dto = defaultUserDto({}, {
        withGroupsUsers: true,
        withRole: true,
        withGpgkey: true,
        withAccountRecoveryUserSetting: true,
        withPendingAccountRecoveryUserRequest: true,
      });
      const filtered = {
        id: dto.id,
        role_id: dto.role_id,
        username: dto.username,
        active: dto.active,
        deleted: dto.deleted,
        disabled: dto.disabled,
        created: dto.created,
        modified: dto.modified,
        last_logged_in: dto.last_logged_in,
        is_mfa_enabled: dto.is_mfa_enabled,
      };

      const entity = new UserEntity(dto);
      expect(entity.toDto()).toEqual(filtered);
      expect(entity.profile.firstName).toEqual(dto.profile.first_name);
      expect(entity.profile.lastName).toEqual(dto.profile.last_name);
      expect(entity.role).toBeInstanceOf(RoleEntity);
      expect(entity.profile).toBeInstanceOf(ProfileEntity);
      expect(entity.gpgkey).toBeInstanceOf(GpgkeyEntity);
      expect(entity.accountRecoveryUserSetting).toBeInstanceOf(AccountRecoveryUserSettingEntity);
      expect(entity.role.name).toEqual('user');
      expect(entity.isMfaEnabled).toBe(false);
      expect(entity.gpgkey.armoredKey.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----')).toBe(true);
      expect(entity.accountRecoveryUserSetting.status).toEqual('approved');
      expect(entity.pendingAccountRecoveryUserRequest).toBeInstanceOf(PendingAccountRecoveryRequestEntity);
      expect(entity.pendingAccountRecoveryUserRequest.status).toEqual('pending');

      const dtoWithContain = entity.toDto({
        role: true,
        profile: true,
        gpgkey: true,
        account_recovery_user_setting: true,
        pending_account_recovery_request: true
      });
      expect(dtoWithContain.role.name).toEqual('user');
      expect(dtoWithContain.profile.first_name).toEqual(dto.profile.first_name);
      expect(dtoWithContain.gpgkey.armored_key.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----')).toBe(true);
      expect(dtoWithContain.is_mfa_enabled).toBe(false);
      expect(dtoWithContain.pending_account_recovery_request.status).toBe('pending');
    });

    it("should marshall last_logged_in if empty string given", () => {
      expect.assertions(1);
      const dto = defaultUserDto({last_logged_in: ""});
      const entity = new UserEntity(dto);
      expect(entity.lastLoggedIn).toBeNull();
    });

    it("should, with enabling the ignore invalid option, ignore groups users which do not validate their schema", () => {
      const dto = defaultUserDto({
        groups_users: [
          defaultGroupUser({group_id: 42}),
          defaultGroupUser(),
        ]
      });

      expect.assertions(2);
      const entity = new UserEntity(dto, {ignoreInvalidEntity: true});
      expect(entity._groups_users).toHaveLength(1);
      expect(entity._groups_users.items[0]._props.id).toEqual(dto.groups_users[1].id);
    });

    /*
     * @todo Associated entities validation error details to review when entity will aggregate them.
     * @see EntityV2.constructor
     */
    it("should throw if one of associated collection data item does not validate their schema", () => {
      const dto = defaultUserDto({
        groups_users: [
          defaultGroupUser({group_id: 42}),
          defaultGroupUser(),
        ]
      });

      expect.assertions(2);
      // Currently throw
      expect(() => new UserEntity(dto)).toThrowCollectionValidationError("0.group_id.type");
      // Should throw, or similar fashion, path is important.
      expect(() => new UserEntity(dto)).not.toThrowCollectionValidationError("groups_users.0.group_id.type");
    });

    it("should, with enabling the ignore invalid option, ignore groups users which do not validate their schema", () => {
      const dto = defaultUserDto({
        groups_users: [
          defaultGroupUser({group_id: 42}),
          defaultGroupUser(),
        ]
      });

      expect.assertions(2);
      const entity = new UserEntity(dto, {ignoreInvalidEntity: true});
      expect(entity._groups_users).toHaveLength(1);
      expect(entity._groups_users.items[0]._props.id).toEqual(dto.groups_users[1].id);
    });
  });

  describe("UserEntity::toDto", () => {
    it("serialization works with full object inside collection", () => {
      const dto = defaultUserDto({}, {
        withGroupsUsers: true,
        withRole: true,
        withGpgkey: true,
        withAccountRecoveryUserSetting: true,
        withPendingAccountRecoveryUserRequest: true,
      });
      const entity = new UserEntity(dto);
      expect(entity.toDto(UserEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
    });
  });

  describe("UserEntity::getters", () => {
    it("mfa enabled can be null or ommited", () => {
      const dto = {
        "role_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
        "username": "dame@passbolt.com",
        "is_mfa_enabled": null
      };
      const entity = new UserEntity(dto);
      expect(entity.isMfaEnabled).toBeNull();

      const dto2 = {
        "role_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
        "username": "dame@passbolt.com",
      };
      const entity2 = new UserEntity(dto2);
      expect(entity2.isMfaEnabled).toBeNull();
    });
  });
  describe("::missingMetadataKeysIds", () => {
    it("should return an empty array if missing_metadata_key_ids is not defined", () => {
      expect.assertions(1);

      const dto = defaultUserDto({}, {
        withRole: true,
        withGpgkey: true,
      });
      const entity = new UserEntity(dto);

      expect(entity.missingMetadataKeysIds).toEqual([]);
    });
    it("should return an array of missing_metadata_key_ids", () => {
      expect.assertions(1);
      const uuid1 = uuid();
      const uuid2 = uuid();

      const dto = defaultUserDto({
        missing_metadata_key_ids: [
          uuid1,
          uuid2
        ]
      }, {
        withRole: true,
        withGpgkey: true,
      });
      const entity = new UserEntity(dto);

      expect(entity.missingMetadataKeysIds).toEqual([
        uuid1,
        uuid2
      ]);
    });

    it("should set the missing_metadata_key_ids", () => {
      expect.assertions(1);
      const uuid1 = uuid();
      const uuid2 = uuid();

      const dto = defaultUserDto({
        missing_metadata_key_ids: []
      }, {
        withRole: true,
        withGpgkey: true,
      });
      const entity = new UserEntity(dto);
      entity.missingMetadataKeysIds = [
        uuid1,
        uuid2
      ];
      expect(entity.missingMetadataKeysIds).toEqual([
        uuid1,
        uuid2
      ]);
    });
  });
});
