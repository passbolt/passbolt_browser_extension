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
import GroupUserEntity from "./groupUserEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {defaultGroupUser, minimumGroupUserDto} from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity.test.data.js";

describe("GroupUserEntity", () => {
  describe("GroupUserEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(GroupUserEntity.ENTITY_NAME, GroupUserEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(GroupUserEntity, "id");
      assertEntityProperty.uuid(GroupUserEntity, "id");
      assertEntityProperty.notRequired(GroupUserEntity, "id");
    });

    it("validates user_id property", () => {
      assertEntityProperty.string(GroupUserEntity, "user_id");
      assertEntityProperty.uuid(GroupUserEntity, "user_id");
      assertEntityProperty.required(GroupUserEntity, "user_id");
    });

    it("validates group_id property", () => {
      assertEntityProperty.string(GroupUserEntity, "group_id");
      assertEntityProperty.uuid(GroupUserEntity, "group_id");
      assertEntityProperty.notRequired(GroupUserEntity, "group_id");
    });

    it("validates is_admin property", () => {
      assertEntityProperty.boolean(GroupUserEntity, "is_admin");
      assertEntityProperty.required(GroupUserEntity, "is_admin");
    });

    it("validates created property", () => {
      assertEntityProperty.string(GroupUserEntity, "created");
      assertEntityProperty.dateTime(GroupUserEntity, "created");
      assertEntityProperty.notRequired(GroupUserEntity, "created");
    });
  });

  describe("GroupUserEntity::constructor", () => {
    it("constructor works if a valid minimal DTO is provided", () => {
      const dto = minimumGroupUserDto();
      const entity = new GroupUserEntity(dto);
      expect(entity.toDto()).toEqual(dto);
    });

    it("constructor works if a valid complete DTO is provided", () => {
      const dto = defaultGroupUser();
      const entity = new GroupUserEntity(dto);
      expect(entity.toDto()).toEqual(dto);
    });
  });
});
