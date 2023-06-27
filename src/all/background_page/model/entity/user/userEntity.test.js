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
import {UserEntityTestFixtures} from "./userEntity.test.fixtures";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {
  customEmailValidationProOrganizationSettings
} from "../organizationSettings/organizationSettingsEntity.test.data";
import OrganizationSettingsModel from "../../organizationSettings/organizationSettingsModel";
import OrganizationSettingsEntity from "../organizationSettings/organizationSettingsEntity";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";

describe("User entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(UserEntity.ENTITY_NAME, UserEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "role_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "username": "dame@passbolt.com",
    };
    const entity = new UserEntity(dto);
    expect(entity.toDto()).toEqual(dto);
    expect(entity.username).toEqual('dame@passbolt.com');
    expect(entity.roleId).toEqual('a58de6d3-f52c-5080-b79b-a601a647ac85');
    expect(entity.created).toBe(null);
    expect(entity.modified).toBe(null);
    expect(entity.profile).toBe(null);
  });

  it("constructor works if valid DTO with associated entity data is provided", () => {
    const dto = UserEntityTestFixtures.default;
    const filtered = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "role_id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
      "username": "admin@passbolt.com",
      "active": true,
      "deleted": false,
      "created": "2020-04-20T11:32:16+00:00",
      "modified": "2020-04-20T11:32:16+00:00",
      "last_logged_in": "2012-07-04T13:39:25+00:00",
      "is_mfa_enabled": false
    };

    const entity = new UserEntity(dto);
    expect(entity.toDto()).toEqual(filtered);
    expect(entity.profile.firstName).toEqual('Admin');
    expect(entity.profile.lastName).toEqual('User');
    expect(entity.role).not.toBe(null);
    expect(entity.profile).not.toBe(null);
    expect(entity.gpgkey).not.toBe(null);
    expect(entity.accountRecoveryUserSetting).not.toBe(null);
    expect(entity.role.name).toEqual('admin');
    expect(entity.isMfaEnabled).toBe(false);
    expect(entity.gpgkey.armoredKey.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----')).toBe(true);
    expect(entity.accountRecoveryUserSetting.status).toEqual('approved');
    expect(entity.pendingAccountRecoveryUserRequest).not.toBe(null);
    expect(entity.pendingAccountRecoveryUserRequest.status).toEqual('pending');

    const dtoWithContain = entity.toDto({role: true, profile: true, gpgkey: true, account_recovery_user_setting: true, pending_account_recovery_request: true});
    expect(dtoWithContain.role.name).toEqual('admin');
    expect(dtoWithContain.profile.first_name).toEqual('Admin');
    expect(dtoWithContain.gpgkey.armored_key.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----')).toBe(true);
    expect(dtoWithContain.is_mfa_enabled).toBe(false);
    expect(dtoWithContain.pending_account_recovery_request.status).toBe('pending');
  });

  it("constructor throws an exception if DTO is missing required field", () => {
    try {
      new UserEntity({"created": "2020-04-20T11:32:17+00:00"});
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('username', 'required')).toBe(true);
      // expect(error.hasError('role_id', 'required')).toBe(true);
    }
  });

  it("constructor throws an exception if DTO contains invalid field", () => {
    try {
      new UserEntity({
        "id": "🤷",
        "role_id": -0,
        "username": "(ノಠ益ಠ)ノ",
      });
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id', 'format')).toBe(true);
      expect(error.hasError('role_id', 'type')).toBe(true);
      expect(error.hasError('username', 'custom')).toBe(true);
    }
  });

  it("constructor returns validation error if the username is not standard.", () => {
    expect.assertions(2);
    try {
      const dto = defaultUserDto({username: "ada@passbolt.c"});
      new UserEntity(dto);
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('username', 'custom')).toBe(true);
    }
  });

  it("constructor works if the username is not standard and the application settings defined a custom validation.", () => {
    expect.assertions(1);
    const organizationSettings = customEmailValidationProOrganizationSettings();
    OrganizationSettingsModel.set(new OrganizationSettingsEntity(organizationSettings));
    const dto = defaultUserDto({username: "ada@passbolt.c"});
    const entity = new UserEntity(dto);
    expect(entity.username).toEqual("ada@passbolt.c");
  });

  it("serialization works with full object inside collection", () => {
    const dto = UserEntityTestFixtures.default;
    const entity = new UserEntity(dto);
    expect(entity.groupsUsers).not.toBeNull();
    expect(entity.groupsUsers.items[0].id).toEqual('03e26ff8-81d2-5b7f-87e4-99bbc40e1f95');
    expect(entity.toDto(UserEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
  });

  it("mfa enabled can be null or ommited", () => {
    const dto = {
      "role_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "username": "dame@passbolt.com",
      "is_mfa_enabled": null
    };
    const entity = new UserEntity(dto);
    expect(entity.isMfaEnabled).toBe(null);

    const dto2 = {
      "role_id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "username": "dame@passbolt.com",
    };
    const entity2 = new UserEntity(dto2);
    expect(entity2.isMfaEnabled).toBe(null);
  });

  describe("sanitizeDto", () => {
    it("sanitizeDto should remove groups users that don't validate from the groups_users property ", () => {
      const groupUser1 = {
        "id": "10801423-4151-42a4-99d1-86e66145a01a",
        "group_id": "10801423-4151-42a4-99d1-86e66145a08c",
        "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
        "is_admin": true
      };
      const groupUser2 = {
        "id": "10801423-4151-42a4-99d1-86e66145a01b",
        "group_id": null,
        "user_id": "d57c10f5-639d-5160-9c81-8a0c6c4ec857",
        "is_admin": true
      };
      const user = {
        "id": "10801423-4151-42a4-99d1-86e66145a08c",
        "username": "admin@passbolt.com",
        "groups_users": [groupUser1, groupUser2]
      };

      const santitizedDto = UserEntity.sanitizeDto(user);
      expect(santitizedDto.groups_users).toHaveLength(1);
      expect(santitizedDto.groups_users).toEqual(expect.arrayContaining([groupUser1]));

      new UserEntity(santitizedDto);
    });

    it("sanitizeDto should return the same data if unsupported type of data is given in parameter", () => {
      const dto = "not-an-array";
      const santitizedDto = UserEntity.sanitizeDto(dto);
      expect(santitizedDto).toEqual(dto);
    });
  });
});
