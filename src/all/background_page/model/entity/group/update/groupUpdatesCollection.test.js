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
 * @since         5.6.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import GroupUpdatesCollection from "./groupUpdatesCollection";
import {
  groupMemberAdditionOperationDto,
  groupMemberAdditionWithoutSecretOperationDto,
  groupMemberRemovalOperationDto,
  groupMemberRoleUpdateOperationDto,
  groupNameUpdateOperationDto,
  defaultGroupUpdateDto
} from "./groupUpdatesCollection.test.data";
import GroupUpdateEntity from "./groupUpdateEntity";

describe("GroupUpdatesCollections", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GroupUpdatesCollection.name, GroupUpdatesCollection.getSchema());
  });

  describe("::constructor", () => {
    it("works with empty data", () => {
      expect.assertions(1);
      const collection = new GroupUpdatesCollection([]);
      expect(collection).toHaveLength(0);
    });

    it("works if group name operation DTO is provided", () => {
      expect.assertions(3);
      const dto = groupNameUpdateOperationDto();

      const collection = new GroupUpdatesCollection([dto]);
      expect(collection).toHaveLength(1);

      const item = collection.items[0];
      expect(item.id).toStrictEqual(dto.id);
      expect(item.name).toStrictEqual(dto.name);
    });

    it("works if member addition without secret operation DTO is provided", () => {
      expect.assertions(5);
      const dto = groupMemberAdditionWithoutSecretOperationDto();

      const collection = new GroupUpdatesCollection([dto]);
      expect(collection).toHaveLength(1);

      console.log(dto, collection.items[0].groupsUsers.items);

      const item = collection.items[0];
      expect(item.id).toStrictEqual(dto.id);
      expect(item.name).toStrictEqual(dto.name);
      expect(item.groupsUsers.toDto()).toStrictEqual(dto.groups_users);
      expect(item.secrets).toBeNull();
    });

    it("works if member addition operation DTO is provided", () => {
      expect.assertions(5);
      const dto = groupMemberAdditionOperationDto();

      const collection = new GroupUpdatesCollection([dto]);
      expect(collection).toHaveLength(1);

      const item = collection.items[0];
      expect(item.id).toStrictEqual(dto.id);
      expect(item.name).toStrictEqual(dto.name);
      expect(item.groupsUsers.toDto()).toStrictEqual(dto.groups_users);
      expect(item.secrets.toDto()).toStrictEqual(dto.secrets);
    });

    it("works if role update operation DTO is provided", () => {
      expect.assertions(4);
      const dto = groupMemberRoleUpdateOperationDto();

      const collection = new GroupUpdatesCollection([dto]);
      expect(collection).toHaveLength(1);
      expect(collection.items[0].id).toStrictEqual(dto.id);

      const item = collection.items[0];
      expect(item.name).toStrictEqual(dto.name);
      expect(item.groupsUsers.toDto()).toStrictEqual(dto.groups_users);
    });

    it("works if member removal operation DTO is provided", () => {
      expect.assertions(4);
      const dto = groupMemberRemovalOperationDto();

      const collection = new GroupUpdatesCollection([dto]);
      expect(collection).toHaveLength(1);
      expect(collection.items[0].id).toStrictEqual(dto.id);

      const item = collection.items[0];
      expect(item.name).toStrictEqual(dto.name);
      expect(item.groupsUsers.toDto()).toStrictEqual(dto.groups_users);
    });

    it("works if all types of operation are provided", () => {
      expect.assertions(6);
      const dto = [
        groupNameUpdateOperationDto(),
        groupMemberAdditionWithoutSecretOperationDto(),
        groupMemberAdditionOperationDto(),
        groupMemberRoleUpdateOperationDto(),
        groupMemberRemovalOperationDto(),
      ];
      const collection = new GroupUpdatesCollection(dto);
      expect(collection).toHaveLength(dto.length);
      expect(collection.items[0].toDto()).toStrictEqual(dto[0]);
      expect(collection.items[1].toDto()).toStrictEqual(dto[1]);
      expect(collection.items[2].toDto()).toStrictEqual(dto[2]);
      expect(collection.items[3].toDto()).toStrictEqual(dto[3]);
      expect(collection.items[4].toDto()).toStrictEqual(dto[4]);
    });
  });

  describe("::createFromGroupUpdateEntity", () => {
    /**
     * Returns a name relative to the type of operation to be done on the API.
     * @param {GroupUpdateEntity} groupUpdateEntity
     * @returns {string}
     */
    function getOperationType(groupUpdateEntity) {
      if (groupUpdateEntity.groupsUsers === null) {
        return "group-name-update";
      } else if (groupUpdateEntity.secrets !== null) {
        return "user-add";
      } else if (groupUpdateEntity.groupsUsers.items[0].isDeleted) {
        return "user-delete";
      }
      return "user-update";
    }

    it("should build a collection with all kind of items and put them in the right order", async() => {
      expect.assertions(19);

      //1 delete operation, 2 add operations, 2 update operations
      const groupUpdateDto = new GroupUpdateEntity(defaultGroupUpdateDto());

      const expectedOperationCount = groupUpdateDto.groupsUsers.length + 1;
      const collection = GroupUpdatesCollection.createFromGroupUpdateEntity(groupUpdateDto);

      //checking operation count: user count + 1 operation for group name update;
      expect(collection.length).toStrictEqual(expectedOperationCount);

      //checking operation types order and data integrity
      const items = collection.items;

      expect(getOperationType(items[0])).toStrictEqual("group-name-update");
      expect(items[0].groupsUsers).toBeNull();
      expect(items[0].secrets).toBeNull();

      expect(getOperationType(items[1])).toStrictEqual("user-add");
      expect(items[1].groupsUsers).toHaveLength(1);
      expect(items[1].secrets).toHaveLength(1);

      expect(getOperationType(items[2])).toStrictEqual("user-add");
      expect(items[2].groupsUsers).toHaveLength(1);
      expect(items[2].secrets).toHaveLength(2);

      expect(getOperationType(items[3])).toStrictEqual("user-update");
      expect(items[3].groupsUsers).toHaveLength(1);
      expect(items[3].secrets).toBeNull();

      expect(getOperationType(items[4])).toStrictEqual("user-update");
      expect(items[4].groupsUsers).toHaveLength(1);
      expect(items[4].secrets).toBeNull();

      expect(getOperationType(items[5])).toStrictEqual("user-delete");
      expect(items[5].groupsUsers).toHaveLength(1);
      expect(items[5].secrets).toBeNull();
    });

    it("should throw an error if the operation type is unknown", () => {
      expect.assertions(1);

      const groupUpdateDto = new GroupUpdateEntity(defaultGroupUpdateDto());

      jest.spyOn(groupUpdateDto.groupsUsers.items[0], "scenario", 'get').mockImplementation(() => "unknown");

      expect(() => GroupUpdatesCollection.createFromGroupUpdateEntity(groupUpdateDto)).toThrowError("Unsupported Group user membership update operation type.");
    });
  });
});
