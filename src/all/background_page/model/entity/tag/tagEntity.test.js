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
import TagEntity from "./tagEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import {defaultTagDto, minimalTagDto} from "./tagEntity.test.data";

describe("TagEntity", () => {
  describe("TagEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(TagEntity.ENTITY_NAME, TagEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(TagEntity, "id");
      assertEntityProperty.uuid(TagEntity, "id");
      assertEntityProperty.notRequired(TagEntity, "id");
    });

    it("validates slug property", () => {
      assertEntityProperty.string(TagEntity, "slug");
      assertEntityProperty.minLength(TagEntity, "slug", 1);
      assertEntityProperty.maxLength(TagEntity, "slug", 128);
      assertEntityProperty.required(TagEntity, "slug");
    });

    it("validates is_shared property", () => {
      assertEntityProperty.boolean(TagEntity, "is_shared");
      assertEntityProperty.notRequired(TagEntity, "is_shared");
    });
  });

  describe("TagEntity:constructor", () => {
    it("should work if valid minimal DTO is provided", () => {
      expect.assertions(4);
      const dto = minimalTagDto();
      const entity = new TagEntity(dto);
      const expectedToDto = {...dto, is_shared: false}; // Is shared is marshalled.
      expect(entity.toDto()).toEqual(expectedToDto);
      expect(entity.id).toBeNull();
      expect(entity.slug).toEqual(dto.slug);
      expect(entity.isShared).toBeFalsy();
    });

    it("should work if complete DTO is provided", () => {
      expect.assertions(4);
      const dto = defaultTagDto();
      const entity = new TagEntity(dto);
      expect(entity.toDto()).toEqual(dto);
      expect(entity.id).toEqual(dto.id);
      expect(entity.slug).toEqual(dto.slug);
      expect(entity.isShared).toEqual(dto.is_shared);
    });

    it("should marshall is_shared depending on the slug", () => {
      expect.assertions(4);
      const dtoNotShared = minimalTagDto();
      const entityNotShared = new TagEntity(dtoNotShared);
      expect(entityNotShared.slug).toEqual(dtoNotShared.slug);
      expect(entityNotShared.isShared).toBeFalsy();
      const dtoShared = minimalTagDto({slug: "#shared-tag"});
      const entityShared = new TagEntity(dtoShared);
      expect(entityShared.slug).toEqual(dtoShared.slug);
      expect(entityShared.isShared).toBeTruthy();
    });

    // The entity should throw an exception, the validation instantiated the error but does not throw it.
    it.skip("should throw an exception if a personal tag starts with a hashtag", () => {
      expect.assertions(1);
      const dto = defaultTagDto({slug: "#shared-tag", is_shared: false});
      expect(() => new TagEntity(dto)).toThrowEntityValidationError("is_shared", "hashtag", dto);
    });

    it.todo("should throw an exception if a shared tag does not start with a hashtag");
  });
});

