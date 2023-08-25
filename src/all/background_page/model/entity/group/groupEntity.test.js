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
import GroupEntity from "./groupEntity";
import {GroupEntityTestFixtures} from "./groupEntity.test.fixtures";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("Group entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GroupEntity.ENTITY_NAME, GroupEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = GroupEntityTestFixtures.default;
    const entity = new GroupEntity(dto);
    expect(entity.toDto(GroupEntity.ALL_CONTAIN_OPTIONS)).toEqual(GroupEntityTestFixtures.without_groups_users_user);
    expect(entity.name).toEqual('test group');
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
      const group = {
        "id": "10801423-4151-42a4-99d1-86e66145a08c",
        "name": "group1",
        "groups_users": [groupUser1, groupUser2]
      };

      const santitizedDto = GroupEntity.sanitizeDto(group);
      expect(santitizedDto.groups_users).toHaveLength(1);
      expect(santitizedDto.groups_users).toEqual(expect.arrayContaining([groupUser1]));

      new GroupEntity(santitizedDto);
    });

    it("sanitizeDto should return the same data if unsupported type of data is given in parameter", () => {
      const dto = "not-an-array";
      const santitizedDto = GroupEntity.sanitizeDto(dto);
      expect(santitizedDto).toEqual(dto);
    });
  });
});
