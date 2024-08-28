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
 * @since         3.0.0
 */
import CommentEntity from "./commentEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {defaultCommentDto} from "passbolt-styleguide/src/shared/models/entity/comment/commentEntity.test.data";

describe("Comment entity", () => {
  describe("CommentEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(CommentEntity.ENTITY_NAME, CommentEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.uuid(CommentEntity, "id");
      assertEntityProperty.notRequired(CommentEntity, "id");
    });

    it("validates user_id property", () => {
      assertEntityProperty.uuid(CommentEntity, "user_id");
      assertEntityProperty.required(CommentEntity, "user_id");
    });

    it("validates foreign_key property", () => {
      assertEntityProperty.uuid(CommentEntity, "foreign_key");
      assertEntityProperty.required(CommentEntity, "foreign_key");
    });

    it("validates foreign_model property", () => {
      const expectedValues = [
        "Resource",
      ];
      const unexpectedValues = ["1", "false", "test"];
      assertEntityProperty.enumeration(CommentEntity, "foreign_model", expectedValues, unexpectedValues);
      assertEntityProperty.required(CommentEntity, "foreign_model");
    });

    it("validates parent_id property", () => {
      assertEntityProperty.uuid(CommentEntity, "parent_id");
      assertEntityProperty.nullable(CommentEntity, "parent_id");
      assertEntityProperty.notRequired(CommentEntity, "parent_id");
    });

    it("validates content property", () => {
      assertEntityProperty.string(CommentEntity, "content");
      assertEntityProperty.minLength(CommentEntity, "content", 1);
      assertEntityProperty.maxLength(CommentEntity, "content", 255);
      assertEntityProperty.required(CommentEntity, "content");
    });

    it("validates created property", () => {
      assertEntityProperty.string(CommentEntity, "created");
      assertEntityProperty.dateTime(CommentEntity, "created");
      assertEntityProperty.notRequired(CommentEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(CommentEntity, "modified");
      assertEntityProperty.dateTime(CommentEntity, "modified");
      assertEntityProperty.notRequired(CommentEntity, "modified");
    });

    it("validates created_by property", () => {
      assertEntityProperty.uuid(CommentEntity, "created_by");
      assertEntityProperty.notRequired(CommentEntity, "created_by");
    });

    it("validates modified_by property", () => {
      assertEntityProperty.uuid(CommentEntity, "modified_by");
      assertEntityProperty.notRequired(CommentEntity, "modified_by");
    });
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = defaultCommentDto();
    const entity = new CommentEntity(dto);

    // Test mandatory field getters
    expect(entity.toDto()).toEqual(dto);
    expect(entity.content).toBe(dto.content);
    expect(entity.foreignKey).toBe(dto.foreign_key);
    expect(entity.foreignModel).toBe(dto.foreign_model);
    expect(entity.userId).toBe(dto.user_id);
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {
    const dto = defaultCommentDto({
      // non supported
      _type: "None"
    });
    const filtered = defaultCommentDto({
      id: dto.id
    });

    const entity = new CommentEntity(dto);
    expect(entity.toDto()).toEqual(filtered);

    // Test optional field getters
    expect(entity.parentId).toBe(filtered.parent_id);
    expect(entity.modified).toBe(filtered.modified);
    expect(entity.created).toBe(filtered.created);
  });

  it('serialization should work with associated user model for creator / modifier', () => {
    const dto = defaultCommentDto({}, {
      withCreator: true,
      withModifier: true
    });

    const entity = new CommentEntity(dto);
    expect(entity.creator.username).toBe('ada@passbolt.com');
    expect(entity.creator.profile.firstName).toBe('Ada');
    expect(entity.creator.profile.avatar.urlMedium).toBe('\/avatars\/view\/e6927385-195c-4c7f-a107-a202ea86de40\/medium.jpg');

    const serializedDto = entity.toDto();
    expect(Object.prototype.hasOwnProperty.call(serializedDto, 'creator')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(serializedDto, 'modifier')).toBe(false);

    const serializedDtoWithAssoc = entity.toDto({creator: true, modifier: true});
    expect(Object.prototype.hasOwnProperty.call(serializedDtoWithAssoc, 'creator')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(serializedDtoWithAssoc, 'modifier')).toBe(true);
  });
});
