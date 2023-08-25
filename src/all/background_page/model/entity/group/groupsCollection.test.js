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
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

describe("Groups collection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GroupsCollection.ENTITY_NAME, GroupsCollection.getSchema());
  });

  describe("constructor", () => {
    it("constructor works if valid minimal DTO is provided", () => {
      const group1 = {
        "name": "group1",
      };
      const group2 = {
        "name": "group2",
      };
      const dtos = [group1, group2];
      const collection = new GroupsCollection(dtos);
      expect(collection.toDto()).toEqual(dtos);
      expect(JSON.stringify(collection)).toEqual(JSON.stringify(dtos));
      expect(collection.items[0].name).toEqual('group1');
      expect(collection.items[1].name).toEqual('group2');
    });

    it("constructor fails if reusing same id", () => {
      const group1 = {
        "id": "692af28a-58eb-4306-aab7-ab284b6141b3",
        "name": "group1"
      };
      const group2 = {
        "id": "692af28a-58eb-4306-aab7-ab284b6141b3",
        "name": "group2"
      };
      const dtos = [group1, group2];

      const t = () => { new GroupsCollection(dtos); };
      expect(t).toThrow(EntityCollectionError);
    });

    it("constructor fails if reusing same name", () => {
      const group1 = {
        "id": "692af28a-58eb-4306-aab7-ab284b6141b3",
        "name": "group1"
      };
      const group2 = {
        "id": "692af28a-58eb-4306-aab7-ab284b6141b4",
        "name": "group1"
      };
      const dtos = [group1, group2];

      const t = () => { new GroupsCollection(dtos); };
      expect(t).toThrow(EntityCollectionError);
    });

    it("constructor works with empty collection", () => {
      new GroupsCollection([]);
    });
  });

  describe("sanitizeDto", () => {
    it("sanitizeDto should remove duplicated group ids", () => {
      const group1 = {
        "id": "10801423-4151-42a4-99d1-86e66145a08c",
        "name": "group1",
      };
      const group2 = {
        "id": "10801423-4151-42a4-99d1-86e66145a08c",
        "name": "group2",
      };

      const santitizedDtos = GroupsCollection.sanitizeDto([group1, group2]);
      expect(santitizedDtos).toHaveLength(1);
      expect(santitizedDtos).toEqual(expect.arrayContaining([group1]));

      const collection = new GroupsCollection(santitizedDtos);
      expect(collection).toHaveLength(1);
    });

    it("sanitizeDto should remove duplicated group names", () => {
      const group1 = {
        "id": "10801423-4151-42a4-99d1-86e66145a08c",
        "name": "group1",
      };
      const group2 = {
        "id": "10801423-4151-42a4-99d1-86e66145a08d",
        "name": "group1",
      };

      const santitizedDtos = GroupsCollection.sanitizeDto([group1, group2]);
      expect(santitizedDtos).toHaveLength(1);
      expect(santitizedDtos).toEqual(expect.arrayContaining([group1]));

      const collection = new GroupsCollection(santitizedDtos);
      expect(collection).toHaveLength(1);
    });

    it("sanitizeDto should remove groups users that don't validate from groups ", () => {
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
      const group1 = {
        "id": "10801423-4151-42a4-99d1-86e66145a08c",
        "name": "group1",
        "groups_users": [groupUser1, groupUser2]
      };
      const group2 = {
        "id": "10801423-4151-42a4-99d1-86e66145a08d",
        "name": "group2",
        "groups_users": [groupUser1, groupUser2]
      };

      const santitizedDtos = GroupsCollection.sanitizeDto([group1, group2]);
      expect(santitizedDtos).toHaveLength(2);
      expect(santitizedDtos[0].groups_users).toHaveLength(1);
      expect(santitizedDtos[0].groups_users).toEqual(expect.arrayContaining([groupUser1]));
      expect(santitizedDtos[1].groups_users).toHaveLength(1);
      expect(santitizedDtos[1].groups_users).toEqual(expect.arrayContaining([groupUser1]));

      const collection = new GroupsCollection(santitizedDtos);
      expect(collection).toHaveLength(2);
    });

    it("sanitizeDto should return an empty array if an unsupported type of data is given in parameter", () => {
      const santitizedDtos = GroupsCollection.sanitizeDto("not-an-array");
      expect(santitizedDtos).toHaveLength(0);

      const collection = new GroupsCollection(santitizedDtos);
      expect(collection).toHaveLength(0);
    });
  });
});
