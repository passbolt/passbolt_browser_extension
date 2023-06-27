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
 */
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import GroupUpdateEntity from "./groupUpdateEntity";
import GroupEntity from "../groupEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("Group update entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GroupUpdateEntity.ENTITY_NAME, GroupUpdateEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      id: '8e3874ae-4b40-590b-968a-418f704b9d9a',
      name: 'Group name'
    };
    const groupUpdateEntity = new GroupUpdateEntity(dto);
    expect(groupUpdateEntity.toDto()).toEqual(dto);
    expect(groupUpdateEntity.id).toEqual(dto.id);
    expect(groupUpdateEntity.name).toEqual(dto.name);
  });

  it("constructor works fails if not enough data is provided", () => {
    try {
      new GroupUpdateEntity({});
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(typeof error.details).toEqual("object");
      expect(error.details.id).not.toBeUndefined();
      expect(error.details.name).not.toBeUndefined();
    }
  });

  it("construct from groups diff", () => {
    const originalGroupDto = {
      id: '8e3874ae-4b40-590b-968a-418f704b9d9a',
      name: 'Group name',
      groups_users: [{
        "id": "49a7cdf0-9786-4f26-a98a-e3f935d50d04",
        "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
        "is_admin": true
      }, {
        "id": "0c17f5e3-2f28-4697-9e7b-4e4943ec546a",
        "user_id": "e97b14ba-8957-57c9-a357-f78a6e1e1a46",
        "is_admin": false,
      }]
    };
    const originalGroupEntity = new GroupEntity(originalGroupDto);
    const updatedGroupDto = {
      id: '8e3874ae-4b40-590b-968a-418f704b9d9a',
      name: 'Group name',
      groups_users: [{
        "id": "49a7cdf0-9786-4f26-a98a-e3f935d50d04",
        "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
        "is_admin": false
      }, {
        "user_id": "33966163-6457-50a7-968e-836b904d7867",
        "is_admin": true,
      }]
    };
    const updatedGroupEntity = new GroupEntity(updatedGroupDto);
    const groupUpdateEntity = GroupUpdateEntity.createFromGroupsDiff(originalGroupEntity, updatedGroupEntity);
    expect(groupUpdateEntity.id).toEqual(originalGroupEntity.id);
    expect(groupUpdateEntity.name).toEqual(updatedGroupEntity.name);
    const updatedGroupUserChange = {
      "id": "49a7cdf0-9786-4f26-a98a-e3f935d50d04",
      "is_admin": false
    };
    expect(groupUpdateEntity.groupsUsers.toDto()).toEqual(expect.arrayContaining([updatedGroupUserChange]));
    const addedGroupUserChange = {
      "user_id": "33966163-6457-50a7-968e-836b904d7867",
      "is_admin": true
    };
    expect(groupUpdateEntity.groupsUsers.toDto()).toEqual(expect.arrayContaining([addedGroupUserChange]));
    const deletedGroupUserChange = {
      "id": "0c17f5e3-2f28-4697-9e7b-4e4943ec546a",
      "delete": true
    };
    expect(groupUpdateEntity.groupsUsers.toDto()).toEqual(expect.arrayContaining([deletedGroupUserChange]));
  });
});
