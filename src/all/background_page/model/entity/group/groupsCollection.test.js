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
 * @since         3.0.4
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import GroupsCollection from "./groupsCollection";
import {defaultGroupDto} from "./groupEntity.test.data";
import {defaultGroupUser} from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity.test.data.js";
import GroupEntity from "./groupEntity";

describe("GroupsCollection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GroupsCollection.ENTITY_NAME, GroupsCollection.getSchema());
  });

  describe("GroupsCollection::constructor", () => {
    it("works with empty collection", () => {
      new GroupsCollection([]);
    });

    it("works if valid minimal DTO is provided", () => {
      const dto1 = defaultGroupDto({"name": "group1"});
      const dto2 = defaultGroupDto({"name": "group2"});
      const dto3 = defaultGroupDto({"name": "group3"});
      const dtos = [dto1, dto2, dto3];
      const collection = new GroupsCollection(dtos);

      expect.assertions(10);
      expect(collection.items).toHaveLength(3);
      expect(collection.items[0]).toBeInstanceOf(GroupEntity);
      expect(collection.items[0]._props.id).toEqual(dto1.id);
      expect(collection.items[0]._props.name).toEqual(dto1.name);
      expect(collection.items[1]).toBeInstanceOf(GroupEntity);
      expect(collection.items[1]._props.id).toEqual(dto2.id);
      expect(collection.items[1]._props.name).toEqual(dto2.name);
      expect(collection.items[2]).toBeInstanceOf(GroupEntity);
      expect(collection.items[2]._props.id).toEqual(dto3.id);
      expect(collection.items[2]._props.name).toEqual(dto3.name);
    });

    it("works if valid group entities are provided", () => {
      const entity1 = new GroupEntity(defaultGroupDto({"name": "group1"}));
      const entity2 = new GroupEntity(defaultGroupDto({"name": "group2"}));
      const entities = [entity1, entity2];
      const collection = new GroupsCollection(entities);

      expect.assertions(5);
      expect(collection.items).toHaveLength(2);
      expect(collection.items[0]).toBeInstanceOf(GroupEntity);
      expect(collection.items[0]._props.name).toEqual(entity1.name);
      expect(collection.items[1]).toBeInstanceOf(GroupEntity);
      expect(collection.items[1]._props.name).toEqual(entity2.name);
    });

    it("works if valid maximum DTO is provided", () => {
      const dto1 = defaultGroupDto({"name": "group1"}, {withGroupsUsers: true});
      const dto2 = defaultGroupDto({"name": "group2"}, {withGroupsUsers: true});
      const dto3 = defaultGroupDto({"name": "group3"}, {withGroupsUsers: true});
      const dtos = [dto1, dto2, dto3];
      const collection = new GroupsCollection(dtos);

      expect.assertions(13);
      expect(collection.items).toHaveLength(3);
      expect(collection.items[0]._props.id).toEqual(dto1.id);
      expect(collection.items[0]._props.name).toEqual(dto1.name);
      expect(collection.items[0]._groups_users).toHaveLength(1);
      expect(collection.items[0]._groups_users.items[0].id).toEqual(dto1.groups_users[0].id);
      expect(collection.items[1]._props.id).toEqual(dto2.id);
      expect(collection.items[1]._props.name).toEqual(dto2.name);
      expect(collection.items[1]._groups_users).toHaveLength(1);
      expect(collection.items[1]._groups_users.items[0].id).toEqual(dto2.groups_users[0].id);
      expect(collection.items[2]._props.id).toEqual(dto3.id);
      expect(collection.items[2]._props.name).toEqual(dto3.name);
      expect(collection.items[2]._groups_users).toHaveLength(1);
      expect(collection.items[2]._groups_users.items[0].id).toEqual(dto3.groups_users[0].id);
    });

    it("should throw if one of data item does not validate the collection entity schema", () => {
      const dto1 = defaultGroupDto();
      const dto2 = defaultGroupDto({name: 42});

      expect.assertions(1);
      expect(() => new GroupsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.name.type");
    });

    /*
     * @todo Associated entities validation error details to review when collection will aggregate them.
     * @see EntityV2Collection.pushMany
     */
    it("should throw if one of data item does not validate the collection associated entity schema", () => {
      const dto1 = defaultGroupDto();
      const dto2 = defaultGroupDto({
        name: "group 2",
        groups_users: [
          defaultGroupUser({group_id: 42, is_admin: true})
        ]
      });

      expect.assertions(2);
      // Should not throw
      expect(() => new GroupsCollection([dto1, dto2]))
        .toThrowCollectionValidationError("1.0.group_id.type");
      // Should throw
      expect(() => new GroupsCollection([dto1, dto2]))
        .not.toThrowCollectionValidationError("1.groups_users.0.group_id.type");
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      const dto1 = defaultGroupDto();
      const dto2 = defaultGroupDto({name: "group 1"});
      const dto3 = defaultGroupDto({id: dto2.id, name: "group 2"});

      expect.assertions(1);
      expect(() => new GroupsCollection([dto1, dto2, dto3]))
        .toThrowCollectionValidationError("2.id.unique");
    });

    it("should throw if one of data item does not validate the unique name build rule", () => {
      const dto1 = defaultGroupDto();
      const dto2 = defaultGroupDto({name: "group 1"});
      const dto3 = defaultGroupDto({name: "group 1"});

      expect.assertions(1);
      expect(() => new GroupsCollection([dto1, dto2, dto3]))
        .toThrowCollectionValidationError("2.name.unique");
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate their schema", () => {
      const dto1 = defaultGroupDto();
      const dto2 = defaultGroupDto({name: 42});
      const dto3 = defaultGroupDto({name: "group 3"});

      expect.assertions(3);
      const collection = new GroupsCollection([dto1, dto2, dto3], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(2);
      expect(collection.items[0].id).toEqual(dto1.id);
      expect(collection.items[1].id).toEqual(dto3.id);
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate the unique id build rule", () => {
      const dto1 = defaultGroupDto();
      const dto2 = defaultGroupDto({id: dto1.id, name: "group 2"});
      const dto3 = defaultGroupDto({name: "group 3"});

      expect.assertions(3);
      const collection = new GroupsCollection([dto1, dto2, dto3], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(2);
      expect(collection.items[0].id).toEqual(dto1.id);
      expect(collection.items[1].id).toEqual(dto3.id);
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate the unique name build rule", () => {
      const dto1 = defaultGroupDto();
      const dto2 = defaultGroupDto({name: dto1.name});
      const dto3 = defaultGroupDto({name: "group 3"});

      expect.assertions(3);
      const collection = new GroupsCollection([dto1, dto2, dto3], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(2);
      expect(collection.items[0].id).toEqual(dto1.id);
      expect(collection.items[1].id).toEqual(dto3.id);
    });

    it("should, with enabling the ignore invalid option, ignore items associated groups users entities which do not validate the group users same id build rule", () => {
      const dto1 = defaultGroupDto({}, {withGroupsUsers: true});
      const dto2 = defaultGroupDto({
        name: "group 2",
        groups_users: [
          defaultGroupUser({group_id: 42, is_admin: true})
        ]
      });
      const dto3 = defaultGroupDto({name: "group 3"}, {withGroupsUsers: true});

      expect.assertions(7);
      const collection = new GroupsCollection([dto1, dto2, dto3], {ignoreInvalidEntity: true});
      expect(collection.items).toHaveLength(3);
      expect(collection.items[0].id).toEqual(dto1.id);
      expect(collection.items[0]._groups_users).toHaveLength(1);
      expect(collection.items[1].id).toEqual(dto2.id);
      expect(collection.items[1]._groups_users).toHaveLength(0);
      expect(collection.items[2].id).toEqual(dto3.id);
      expect(collection.items[2]._groups_users).toHaveLength(1);
    });
  });

  describe("GroupsCollection:toDto", () => {
    it("should transform the collection items in dto format", () => {
      const dto1 = defaultGroupDto({"name": "group1"}, {withGroupsUsers: true});
      const dto2p = defaultGroupDto({"name": "group2"}, {withGroupsUsers: true});
      const dto3 = defaultGroupDto({"name": "group3"}, {withGroupsUsers: true});
      const dtos = [dto1, dto2p, dto3];
      const collection = new GroupsCollection(dtos);

      expect.assertions(2);
      expect(collection.toDto()).toEqual(dtos);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(dtos));
    });
  });
});
