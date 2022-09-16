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
import GroupUserChangeEntity from "./groupUserChangeEntity";
import GroupUserEntity from "../groupUserEntity";

describe("Group user change entity", () => {
  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {};
    const groupUserChangeEntity = new GroupUserChangeEntity(dto);
    expect(groupUserChangeEntity.toDto()).toEqual(dto);
  });

  describe("Construct group user change entity from group user", () => {
    it("construct group user change entity for a create operation from a group user", () => {
      const groupUserToAddDto = {
        "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
        "is_admin": true
      };
      const groupUserToAddEntity = new GroupUserEntity(groupUserToAddDto);
      const groupUserChangeToAddEntity = GroupUserChangeEntity.createFromGroupUser(groupUserToAddEntity, GroupUserChangeEntity.GROUP_USER_CHANGE_CREATE);
      expect(groupUserChangeToAddEntity.id).toBeNull();
      expect(groupUserChangeToAddEntity.userId).toEqual(groupUserToAddDto.user_id);
      expect(groupUserChangeToAddEntity.isAdmin).toEqual(groupUserToAddDto.is_admin);
      expect(groupUserChangeToAddEntity.isDeleted).toBeNull();
      expect(groupUserChangeToAddEntity.scenario).toEqual(GroupUserChangeEntity.GROUP_USER_CHANGE_CREATE);
    });

    it("construct group user change entity for an update operation from a group user", () => {
      const groupUserToUpdateDto = {
        "id": "49a7cdf0-9786-4f26-a98a-e3f935d50d04",
        "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
        "is_admin": true
      };
      const groupUserToUpdateEntity = new GroupUserEntity(groupUserToUpdateDto);
      const groupUserChangeToUpdateEntity = GroupUserChangeEntity.createFromGroupUser(groupUserToUpdateEntity, GroupUserChangeEntity.GROUP_USER_CHANGE_UPDATE);
      expect(groupUserChangeToUpdateEntity.id).toEqual(groupUserToUpdateDto.id);
      expect(groupUserChangeToUpdateEntity.userId).toBeNull();
      expect(groupUserChangeToUpdateEntity.isAdmin).toEqual(groupUserToUpdateDto.is_admin);
      expect(groupUserChangeToUpdateEntity.isDeleted).toBeNull();
      expect(groupUserChangeToUpdateEntity.scenario).toEqual(GroupUserChangeEntity.GROUP_USER_CHANGE_UPDATE);
    });

    it("construct group user change entity for a delete operation from a group user", () => {
      const groupUserToDeleteDto = {
        "id": "49a7cdf0-9786-4f26-a98a-e3f935d50d04",
        "user_id": "f848277c-5398-58f8-a82a-72397af2d450",
        "is_admin": true
      };
      const groupUserToDeleteEntity = new GroupUserEntity(groupUserToDeleteDto);
      const groupUserChangeToDeleteEntity = GroupUserChangeEntity.createFromGroupUser(groupUserToDeleteEntity, GroupUserChangeEntity.GROUP_USER_CHANGE_DELETE);
      expect(groupUserChangeToDeleteEntity.id).toEqual(groupUserToDeleteDto.id);
      expect(groupUserChangeToDeleteEntity.userId).toBeNull();
      expect(groupUserChangeToDeleteEntity.isAdmin).toBeNull();
      expect(groupUserChangeToDeleteEntity.isDeleted).toBeTruthy();
      expect(groupUserChangeToDeleteEntity.scenario).toEqual(GroupUserChangeEntity.GROUP_USER_CHANGE_DELETE);
    });
  });
});
