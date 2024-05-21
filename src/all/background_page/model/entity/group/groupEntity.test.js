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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {
  defaultGroupDto,
  minimumGroupUserDto
} from "passbolt-styleguide/src/shared/models/entity/group/groupEntity.test.data";
import {defaultGroupUser} from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity.test.data.js";
import GroupsUsersCollection from "../groupUser/groupsUsersCollection";
import GroupUserEntity from "../groupUser/groupUserEntity";

describe("GroupEntity", () => {
  describe("GroupEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(GroupEntity.ENTITY_NAME, GroupEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(GroupEntity, "id");
      assertEntityProperty.uuid(GroupEntity, "id");
      assertEntityProperty.notRequired(GroupEntity, "id");
    });

    it("validates name property", () => {
      assertEntityProperty.string(GroupEntity, "name");
      assertEntityProperty.required(GroupEntity, "name");
      assertEntityProperty.minLength(GroupEntity, "name", 1);
      assertEntityProperty.maxLength(GroupEntity, "name", 255);
    });

    it("validates deleted property", () => {
      assertEntityProperty.boolean(GroupEntity, "deleted");
      assertEntityProperty.notRequired(GroupEntity, "deleted");
    });

    it("validates created property", () => {
      assertEntityProperty.string(GroupEntity, "created");
      assertEntityProperty.dateTime(GroupEntity, "created");
      assertEntityProperty.notRequired(GroupEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(GroupEntity, "modified");
      assertEntityProperty.dateTime(GroupEntity, "modified");
      assertEntityProperty.notRequired(GroupEntity, "modified");
    });

    it("validates created_by property", () => {
      assertEntityProperty.uuid(GroupEntity, "created_by");
      assertEntityProperty.notRequired(GroupEntity, "created_by");
    });

    it("validates modified_by property", () => {
      assertEntityProperty.uuid(GroupEntity, "modified_by");
      assertEntityProperty.notRequired(GroupEntity, "modified_by");
    });
  });

  describe("GroupEntity::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      expect.assertions(9);
      const dto = minimumGroupUserDto();
      const entity = new GroupEntity(dto);
      expect(entity.toDto(GroupEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
      expect(entity.id).toBeNull();
      expect(entity.name).toEqual('Current group');
      expect(entity.created).toBeNull();
      expect(entity.modified).toBeNull();
      expect(entity.createdBy).toBeNull();
      expect(entity.modifiedBy).toBeNull();
      expect(entity.groupsUsers).toBeNull();
      expect(entity.myGroupUser).toBeNull();
    });

    it("works if valid complete DTO is provided", () => {
      expect.assertions(12);
      const dto = defaultGroupDto({}, {withMyGroupUser: true, withCreator: true, withModifier: true, withGroupsUsers: true});
      const entity = new GroupEntity(dto);
      expect(entity.toDto(GroupEntity.ALL_CONTAIN_OPTIONS)).toEqual(dto);
      expect(entity.id).toEqual(dto.id);
      expect(entity.name).toEqual('Current group');
      expect(entity.created).toEqual(dto.created);
      expect(entity.modified).toEqual(dto.modified);
      expect(entity.createdBy).toEqual(dto.created_by);
      expect(entity.modifiedBy).toEqual(dto.modified_by);
      expect(entity.groupsUsers).toBeInstanceOf(GroupsUsersCollection);
      expect(entity.groupsUsers).toHaveLength(1);
      expect(entity.groupsUsers.items[0].id).toEqual(dto.groups_users[0].id);
      expect(entity.myGroupUser).toBeInstanceOf(GroupUserEntity);
      expect(entity.myGroupUser.id).toEqual(dto.my_group_user.id);
    });

    it("should, with enabling the ignore invalid option, ignore groups users which do not validate their schema", () => {
      const dto = defaultGroupDto({
        groups_users: [
          defaultGroupUser({group_id: 42}),
          defaultGroupUser(),
        ]
      });

      expect.assertions(2);
      const entity = new GroupEntity(dto, {ignoreInvalidEntity: true});
      expect(entity._groups_users).toHaveLength(1);
      expect(entity._groups_users.items[0]._props.id).toEqual(dto.groups_users[1].id);
    });

    /*
     * @todo Associated entities validation error details to review when entity will aggregate them.
     * @see EntityV2.constructor
     */
    it("should throw if one of associated collection data item does not validate their schema", () => {
      const dto = defaultGroupDto({
        groups_users: [
          defaultGroupUser({group_id: 42}),
          defaultGroupUser(),
        ]
      });

      expect.assertions(2);
      // Currently throw
      expect(() => new GroupEntity(dto)).toThrowCollectionValidationError("0.group_id.type");
      // Should throw, or similar fashion, path is important.
      expect(() => new GroupEntity(dto)).not.toThrowCollectionValidationError("groups_users.0.group_id.type");
    });
  });
});
