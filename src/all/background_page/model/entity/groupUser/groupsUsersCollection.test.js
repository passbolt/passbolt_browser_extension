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
import GroupsUsersCollection from "./groupsUsersCollection";
import {GroupsUsersCollectionTestFixtures} from "./groupsUsersCollection.test.fixtures";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("Groups users collection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GroupsUsersCollection.ENTITY_NAME, GroupsUsersCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = GroupsUsersCollectionTestFixtures.default;
    const entity = new GroupsUsersCollection(dto);
    expect(entity.toDto()).toEqual(GroupsUsersCollectionTestFixtures.without_user);
  });

  describe("sanitizeDto", () => {
    it("sanitizeDto should remove groups users that don't validate ", () => {
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

      const santitizedDtos = GroupsUsersCollection.sanitizeDto([groupUser1, groupUser2]);
      expect(santitizedDtos).toHaveLength(1);
      expect(santitizedDtos).toEqual(expect.arrayContaining([groupUser1]));

      const collection = new GroupsUsersCollection(santitizedDtos);
      expect(collection).toHaveLength(1);
    });

    it("sanitizeDto should return an empty array if an unsupported type of data is given in parameter", () => {
      const santitizedDtos = GroupsUsersCollection.sanitizeDto("not-an-array");
      expect(santitizedDtos).toHaveLength(0);

      const collection = new GroupsUsersCollection(santitizedDtos);
      expect(collection).toHaveLength(0);
    });
  });
});
