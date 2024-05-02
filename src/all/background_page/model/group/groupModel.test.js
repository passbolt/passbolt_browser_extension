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
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultGroupDto} from "../entity/group/groupEntity.test.data";
import GroupLocalStorage from "../../service/local_storage/groupLocalStorage";
import GroupModel from "./groupModel";
import {enableFetchMocks} from "jest-fetch-mock";
import GroupUserEntity from "../entity/groupUser/groupUserEntity";
import UserEntity from "../entity/user/userEntity";
import {defaultGroupUser} from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity.test.data.js";
import GroupUpdateEntity from "../entity/group/update/groupUpdateEntity";

beforeAll(() => {
  enableFetchMocks();
});

describe("GroupModel", () => {
  describe("GroupModel::updateLocalStorage", () => {
    it("should request the API and store the retrieved data in the local storage", async() => {
      expect.assertions(4);

      const dto1 = defaultGroupDto({name: "group1"}, {withMyGroupUser: true, withModifier: true});
      const dto2 = defaultGroupDto({name: "group2"}, {withMyGroupUser: true, withModifier: true});
      const dto3 = defaultGroupDto({name: "group3"}, {withMyGroupUser: true, withModifier: true});
      const dtos = [dto1, dto2, dto3];

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/groups\.json/, async() => (mockApiResponse(dtos)));

      //Mock the local storage call and check if the given parameters are ok
      jest.spyOn(GroupLocalStorage, "set").mockImplementation(collection => {
        expect(collection).toHaveLength(3);
        expect(collection.items[0].groupsUsers).toHaveLength(1);
        expect(collection.items[0].myGroupUser).toBeInstanceOf(GroupUserEntity);
        expect(collection.items[0]._modifier).toBeInstanceOf(UserEntity);
      });

      const apiClientOption = defaultApiClientOptions();
      const model = new GroupModel(apiClientOption);
      await model.updateLocalStorage();
    });

    it("should ignore invalid groups or invalid associated groups users if any", async() => {
      expect.assertions(13);

      const dto1 = defaultGroupDto({name: "group1"}, {withMyGroupUser: true, withModifier: true});
      // Invalid groups users item
      const dto2 = defaultGroupDto({
        name: "group 2",
        groups_users: [defaultGroupUser({group_id: 42, is_admin: true})]
      }, {withMyGroupUser: true, withModifier: true});
      // Duplicated group id;
      const dto3 = defaultGroupDto({id: dto1.id, name: "group3"}, {withMyGroupUser: true, withModifier: true});
      const dto4 = defaultGroupDto({name: "group4"}, {withMyGroupUser: true, withModifier: true});
      const dtos = [dto1, dto2, dto3, dto4];

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/groups\.json/, async() => (mockApiResponse(dtos)));

      //Mock the local storage call and check if the given parameters are ok
      jest.spyOn(GroupLocalStorage, "set").mockImplementation(collection => {
        expect(collection).toHaveLength(3);
        expect(collection.items[0]._props.id).toEqual(dto1.id);
        expect(collection.items[0].groupsUsers).toHaveLength(1);
        expect(collection.items[0].myGroupUser).toBeInstanceOf(GroupUserEntity);
        expect(collection.items[0]._modifier).toBeInstanceOf(UserEntity);
        expect(collection.items[1]._props.id).toEqual(dto2.id);
        expect(collection.items[1].groupsUsers).toHaveLength(0);
        expect(collection.items[1].myGroupUser).toBeInstanceOf(GroupUserEntity);
        expect(collection.items[1]._modifier).toBeInstanceOf(UserEntity);
        expect(collection.items[2]._props.id).toEqual(dto4.id);
        expect(collection.items[2].groupsUsers).toHaveLength(1);
        expect(collection.items[2].myGroupUser).toBeInstanceOf(GroupUserEntity);
        expect(collection.items[2]._modifier).toBeInstanceOf(UserEntity);
      });

      const apiClientOption = defaultApiClientOptions();
      const model = new GroupModel(apiClientOption);
      await model.updateLocalStorage();
    });
  });

  describe("GroupModel::findAll", () => {
    it("should, with the option ignoreInvalid, ignore invalid groups or invalid associated groups users if any", async() => {
      expect.assertions(13);

      const dto1 = defaultGroupDto({name: "group1"}, {withMyGroupUser: true, withModifier: true});
      // Invalid groups users item
      const dto2 = defaultGroupDto({
        name: "group 2",
        groups_users: [defaultGroupUser({group_id: 42, is_admin: true})]
      }, {withMyGroupUser: true, withModifier: true});
      // Duplicated group id;
      const dto3 = defaultGroupDto({id: dto1.id, name: "group3"}, {withMyGroupUser: true, withModifier: true});
      const dto4 = defaultGroupDto({name: "group4"}, {withMyGroupUser: true, withModifier: true});
      const dtos = [dto1, dto2, dto3, dto4];

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/groups\.json/, async() => (mockApiResponse(dtos)));

      const apiClientOption = defaultApiClientOptions();
      const model = new GroupModel(apiClientOption);
      const collection = await model.findAll({}, {}, {}, true);
      expect(collection).toHaveLength(3);
      expect(collection.items[0]._props.id).toEqual(dto1.id);
      expect(collection.items[0].groupsUsers).toHaveLength(1);
      expect(collection.items[0].myGroupUser).toBeInstanceOf(GroupUserEntity);
      expect(collection.items[0]._modifier).toBeInstanceOf(UserEntity);
      expect(collection.items[1]._props.id).toEqual(dto2.id);
      expect(collection.items[1].groupsUsers).toHaveLength(0);
      expect(collection.items[1].myGroupUser).toBeInstanceOf(GroupUserEntity);
      expect(collection.items[1]._modifier).toBeInstanceOf(UserEntity);
      expect(collection.items[2]._props.id).toEqual(dto4.id);
      expect(collection.items[2].groupsUsers).toHaveLength(1);
      expect(collection.items[2].myGroupUser).toBeInstanceOf(GroupUserEntity);
      expect(collection.items[2]._modifier).toBeInstanceOf(UserEntity);
    });
  });

  describe("GroupModel::update", () => {
    it("should, with the option ignoreInvalid, ignore invalid groups users if any", async() => {
      expect.assertions(1);

      const updatedGroupDto = defaultGroupDto({
        name: "group1",
        groups_users: [defaultGroupUser(), defaultGroupUser({group_id: 42})],
      });

      //Mock the API call and check if the call is the one expected
      fetch.doMockOnceIf(/groups\/.*\.json/, async() => (mockApiResponse(updatedGroupDto)));

      //Mock the local storage call and check if the given parameters are ok
      jest.spyOn(GroupLocalStorage, "updateGroup").mockImplementation(entity => {
        expect(entity.groupsUsers).toHaveLength(1);
      });

      const apiClientOption = defaultApiClientOptions();
      const model = new GroupModel(apiClientOption);
      await model.update(new GroupUpdateEntity(defaultGroupDto()), true);
    });
  });
});
