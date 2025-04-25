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
 * @since         4.8.0
 */
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {enableFetchMocks} from "jest-fetch-mock";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PendingAccountRecoveryRequestEntity from "passbolt-styleguide/src/shared/models/entity/accountRecovery/pendingAccountRecoveryRequestEntity";
import {defaultGroupUser} from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity.test.data.js";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import ProfileEntity from "passbolt-styleguide/src/shared/models/entity/profile/profileEntity";
import AccountRecoveryUserSettingEntity from "passbolt-styleguide/src/shared/models/entity/accountRecovery/accountRecoveryUserSettingEntity";
import GroupsUsersCollection from "passbolt-styleguide/src/shared/models/entity/groupUser/groupsUsersCollection";
import UserModel from "./userModel";
import UserLocalStorage from "../../service/local_storage/userLocalStorage";
import UserEntity from "../entity/user/userEntity";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";

beforeAll(() => {
  enableFetchMocks();
});

describe("UserModel", () => {
  describe("UserModel::updateLocalStorage", () => {
    it("should request the API and store the retrieved data in the local storage", async() => {
      expect.assertions(7);

      const dtoOptions = {
        withRole: true,
        withGroupsUsers: true,
        withGpgkey: true,
        withAccountRecoveryUserSetting: true,
        withPendingAccountRecoveryUserRequest: true,
      };
      const dto1 = defaultUserDto({username: "ada@passbolt.com"}, dtoOptions);
      const dto2 = defaultUserDto({username: "betty@passbolt.com"}, dtoOptions);
      const dto3 = defaultUserDto({username: "carole@passbolt.com"}, dtoOptions);
      const dtos = [dto1, dto2, dto3];

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/users\.json/, async() => (mockApiResponse(dtos)));

      //Mock the local storage call and check if the given parameters are ok
      jest.spyOn(UserLocalStorage, "set").mockImplementation(collection => {
        expect(collection).toHaveLength(3);
        expect(collection.items[0]._role).toBeInstanceOf(RoleEntity);
        expect(collection.items[0]._profile).toBeInstanceOf(ProfileEntity);
        expect(collection.items[0]._groups_users).toBeInstanceOf(GroupsUsersCollection);
        expect(collection.items[0]._groups_users).toHaveLength(1);
        expect(collection.items[0]._account_recovery_user_setting).toBeInstanceOf(AccountRecoveryUserSettingEntity);
        expect(collection.items[0]._pending_account_recovery_request).toBeInstanceOf(PendingAccountRecoveryRequestEntity);
      });

      const apiClientOption = defaultApiClientOptions();
      const model = new UserModel(apiClientOption);
      await model.updateLocalStorage();
    });

    it("should ignore invalid users or invalid associated groups users if any", async() => {
      const dtoOptions = {
        withRole: true,
        withGroupsUsers: true,
        withGpgkey: true,
        withAccountRecoveryUserSetting: true,
        withPendingAccountRecoveryUserRequest: true,
      };

      const dto1 = defaultUserDto({username: "ada@passbolt.com"}, dtoOptions);
      // Invalid group user
      const dto2 = defaultUserDto({
        username: "betty@passbolt.com",
        groups_users: [defaultGroupUser({group_id: 42, is_admin: true})]
      }, dtoOptions);
      // Duplicated user id;
      const dto3 = defaultUserDto({id: dto2.id, username: "carole@passbolt.com"}, dtoOptions);
      const dto4 = defaultUserDto({username: "dame@passbolt.com"}, dtoOptions);
      const dtos = [dto1, dto2, dto3, dto4];

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/users\.json/, async() => (mockApiResponse(dtos)));

      expect.assertions(12);

      //Mock the local storage call and check if the given parameters are ok
      jest.spyOn(UserLocalStorage, "set").mockImplementation(collection => {
        expect(collection).toHaveLength(3);
        expect(collection.items[0]._props.id).toEqual(dto1.id);
        expect(collection.items[0]._role).toBeInstanceOf(RoleEntity);
        expect(collection.items[0]._profile).toBeInstanceOf(ProfileEntity);
        expect(collection.items[0]._groups_users).toBeInstanceOf(GroupsUsersCollection);
        expect(collection.items[0]._groups_users).toHaveLength(1);
        expect(collection.items[0]._account_recovery_user_setting).toBeInstanceOf(AccountRecoveryUserSettingEntity);
        expect(collection.items[0]._pending_account_recovery_request).toBeInstanceOf(PendingAccountRecoveryRequestEntity);
        expect(collection.items[1]._props.id).toEqual(dto2.id);
        expect(collection.items[1]._groups_users).toBeInstanceOf(GroupsUsersCollection);
        expect(collection.items[1]._groups_users).toHaveLength(0);
        expect(collection.items[2]._props.id).toEqual(dto4.id);
      });

      const apiClientOption = defaultApiClientOptions();
      const model = new UserModel(apiClientOption);
      await model.updateLocalStorage();
    });
  });

  describe("UserModel::findOne", () => {
    it("should throw an error if users or its associated content do not validated.", async() => {
      expect.assertions(2);

      const dtoOptions = {
        withGroupsUsers: true,
        withGpgkey: true,
        withAccountRecoveryUserSetting: true,
        withPendingAccountRecoveryUserRequest: true,
      };
      const dto = defaultUserDto({
        username: "betty@passbolt.com",
        groups_users: [defaultGroupUser({group_id: 42, is_admin: true})]
      }, dtoOptions);

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/users\/.*\.json/, async() => (mockApiResponse(dto)));

      const apiClientOption = defaultApiClientOptions();
      const model = new UserModel(apiClientOption);

      try {
        await model.findOne(dto.id, {groups_users: true});
      } catch (error) {
        // @todo It should receive an EntityValidationError that should embed the details of the associated collection error.
        expect(error).toBeInstanceOf(CollectionValidationError);
        expect(error.details?.[0]?.group_id?.type).toBeTruthy();
      }
    });

    it("should, with the option ignoreInvalid, ignore invalid groups users if any", async() => {
      const dtoOptions = {
        withGroupsUsers: true,
        withGpgkey: true,
        withAccountRecoveryUserSetting: true,
        withPendingAccountRecoveryUserRequest: true,
      };
      const dto = defaultUserDto({
        username: "betty@passbolt.com",
        groups_users: [defaultGroupUser({group_id: 42, is_admin: true})]
      }, dtoOptions);

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/users\/.*\.json/, async() => (mockApiResponse(dto)));

      const apiClientOption = defaultApiClientOptions();
      const model = new UserModel(apiClientOption);
      const entity = await model.findOne(dto.id, {groups_users: true}, true);

      expect.assertions(2);
      expect(entity._groups_users).toBeInstanceOf(GroupsUsersCollection);
      expect(entity._groups_users).toHaveLength(0);
    });
  });

  describe("UserModel::findAll", () => {
    it("should throw an error if users or its associated content do not validated.", async() => {
      expect.assertions(2);

      const dtoOptions = {
        withGroupsUsers: true,
        withGpgkey: true,
        withAccountRecoveryUserSetting: true,
        withPendingAccountRecoveryUserRequest: true,
      };

      const dto1 = defaultUserDto({username: "ada@passbolt.com"}, dtoOptions);
      const dto2 = defaultUserDto({id: dto1.id, username: "carole@passbolt.com"}, dtoOptions);
      const dtos = [dto1, dto2];

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/users\.json/, async() => (mockApiResponse(dtos)));

      const apiClientOption = defaultApiClientOptions();
      const model = new UserModel(apiClientOption);

      try {
        await model.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(CollectionValidationError);
        expect(error.details?.[1]?.id?.unique).toBeTruthy();
      }
    });

    it("should, with the option ignoreInvalid, ignore invalid users or associated groups users if any", async() => {
      const dtoOptions = {
        withGroupsUsers: true,
        withGpgkey: true,
        withAccountRecoveryUserSetting: true,
        withPendingAccountRecoveryUserRequest: true,
      };

      const dto1 = defaultUserDto({username: "ada@passbolt.com"}, dtoOptions);
      // Invalid group user
      const dto2 = defaultUserDto({
        username: "betty@passbolt.com",
        groups_users: [defaultGroupUser({group_id: 42, is_admin: true})]
      }, dtoOptions);
      // Duplicated user id
      const dto3 = defaultUserDto({id: dto2.id, username: "carole@passbolt.com"}, dtoOptions);
      const dto4 = defaultUserDto({username: "dame@passbolt.com"}, dtoOptions);
      const dtos = [dto1, dto2, dto3, dto4];

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/users\.json/, async() => (mockApiResponse(dtos)));

      expect.assertions(8);

      const apiClientOption = defaultApiClientOptions();
      const model = new UserModel(apiClientOption);
      const collection = await model.findAll({}, {}, {}, true);

      expect(collection).toHaveLength(3);
      expect(collection.items[0]._props.id).toEqual(dto1.id);
      expect(collection.items[0]._groups_users).toBeInstanceOf(GroupsUsersCollection);
      expect(collection.items[0]._groups_users).toHaveLength(1);
      expect(collection.items[1]._props.id).toEqual(dto2.id);
      expect(collection.items[1]._groups_users).toBeInstanceOf(GroupsUsersCollection);
      expect(collection.items[1]._groups_users).toHaveLength(0);
      expect(collection.items[2]._props.id).toEqual(dto4.id);
    });
  });

  describe("UserModel::update", () => {
    it("should, with the option ignoreInvalid, ignore invalid groups users if any", async() => {
      expect.assertions(1);

      const updateUserDto = defaultUserDto({
        name: "group1",
        groups_users: [defaultGroupUser(), defaultGroupUser({group_id: 42})],
      });

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/users\/.*\.json/, async() => (mockApiResponse(updateUserDto)));

      //Mock the local storage call and check if the given parameters are ok
      jest.spyOn(UserLocalStorage, "updateUser").mockImplementation(entity => {
        expect(entity.groupsUsers).toHaveLength(1);
      });

      const apiClientOption = defaultApiClientOptions();
      const model = new UserModel(apiClientOption);
      await model.update(new UserEntity(defaultUserDto()), true);
    });
  });
});
