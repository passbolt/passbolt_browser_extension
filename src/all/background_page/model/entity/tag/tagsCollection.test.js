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
import { v4 as uuid } from "uuid";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import { FAIL_ARRAY_SCENARIOS } from "passbolt-styleguide/test/assert/assertEntityProperty";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";

import { defaultTagDto } from "./tagEntity.test.data";
import TagsCollection from "./tagsCollection";
import TagEntity from "./tagEntity";
import { defaultTagsCollectionDto, defaultTagsDtos, minimalTagsCollectionDto } from "./tagsCollection.test.data";

describe("TagsCollection", () => {
  const minimalCollectionDto = minimalTagsCollectionDto(),
    defaultCollectionDto = defaultTagsCollectionDto();

  describe("TagsCollection::constructor", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(TagsCollection.ENTITY_NAME, TagsCollection.getSchema());
    });

    it("works if valid minimal DTOs are provided", () => {
      expect.assertions(9);

      const minimalCollection = new TagsCollection(minimalCollectionDto);

      const expectToDtos = minimalCollectionDto.map((dto) => ({ ...dto, is_shared: false })); // Is shared is marshalled.
      expect(minimalCollection.items).toHaveLength(minimalCollectionDto.length);
      expect(minimalCollection.toDto()).toEqual(expectToDtos);
      expect(JSON.stringify(minimalCollection)).toEqual(JSON.stringify(expectToDtos));
      expect(minimalCollection.items[0]).toBeInstanceOf(TagEntity);
      expect(minimalCollection.items[0].slug).toEqual("tag1");
      expect(minimalCollection.items[1]).toBeInstanceOf(TagEntity);
      expect(minimalCollection.items[1].slug).toEqual("tag2");
      expect(minimalCollection.items[2]).toBeInstanceOf(TagEntity);
      expect(minimalCollection.items[2].slug).toEqual("tag3");
    });

    it("works if valid complete DTOs are provided", () => {
      expect.assertions(9);

      const defaultCollection = new TagsCollection(defaultCollectionDto);

      expect(defaultCollection.items).toHaveLength(defaultCollectionDto.length);
      expect(defaultCollection.toDto()).toEqual(defaultCollectionDto);
      expect(JSON.stringify(defaultCollection)).toEqual(JSON.stringify(defaultCollectionDto));
      expect(defaultCollection.items[0]).toBeInstanceOf(TagEntity);
      expect(defaultCollection.items[0].id).toEqual(defaultCollectionDto[0].id);
      expect(defaultCollection.items[1]).toBeInstanceOf(TagEntity);
      expect(defaultCollection.items[1].id).toEqual(defaultCollectionDto[1].id);
      expect(defaultCollection.items[2]).toBeInstanceOf(TagEntity);
      expect(defaultCollection.items[2].id).toEqual(defaultCollectionDto[2].id);
    });

    it("works if valid entities are provided", () => {
      expect.assertions(7);

      const entity1 = new TagEntity(defaultTagDto({ slug: "tag1" }));
      const entity2 = new TagEntity(defaultTagDto({ slug: "tag2" }));
      const entity3 = new TagEntity(defaultTagDto({ slug: "tag" }));
      const collection = new TagsCollection([entity1, entity2, entity3]);

      expect(collection.items).toHaveLength(3);
      expect(collection.items[0]).toBeInstanceOf(TagEntity);
      expect(collection.items[0].id).toEqual(entity1.id);
      expect(collection.items[1]).toBeInstanceOf(TagEntity);
      expect(collection.items[1].id).toEqual(entity2.id);
      expect(collection.items[2]).toBeInstanceOf(TagEntity);
      expect(collection.items[2].id).toEqual(entity3.id);
    });

    it("should throw if the collection schema does not validate", () => {
      expect.assertions(1);
      expect(() => new TagsCollection({})).toThrowEntityValidationError("items");
    });

    it("should throw if one of data item does not validate the collection entity schema", () => {
      const dto1 = defaultTagDto({ slug: "tag 1" });
      const dto2 = defaultTagDto({ slug: 42 });

      expect.assertions(1);
      expect(() => new TagsCollection([dto1, dto2])).toThrowCollectionValidationError("1.slug.type");
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      const dto1 = defaultTagDto({ slug: "tag1" });
      const dto2 = defaultTagDto({ slug: "tag2" });
      const dto3 = defaultTagDto({ id: dto2.id, slug: "tag3" });

      expect.assertions(1);
      expect(() => new TagsCollection([dto1, dto2, dto3])).toThrowCollectionValidationError("2.id.unique");
    });

    // The unique slug build rule is not yet enforced
    it.skip("should throw if one of data item does not validate the unique slug build rule", () => {
      const dto1 = defaultTagDto({ slug: "tag1" });
      const dto2 = defaultTagDto({ slug: "tag2" });
      const dto3 = defaultTagDto({ slug: dto2.slug });

      expect.assertions(1);
      expect(() => new TagsCollection([dto1, dto2, dto3])).toThrowCollectionValidationError("2.id.unique_slug");
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate their schema", () => {
      const dto1 = defaultTagDto({ slug: "tag1" });
      const dto2 = defaultTagDto({ slug: 42 });
      const dto3 = defaultTagDto({ slug: "tag3" });

      expect.assertions(3);
      const collection = new TagsCollection([dto1, dto2, dto3], { ignoreInvalidEntity: true });
      expect(collection.items).toHaveLength(2);
      expect(collection.items[0].id).toEqual(dto1.id);
      expect(collection.items[1].id).toEqual(dto3.id);
    });
  });

  describe("TagsCollection:pushMany", () => {
    it("[performance] should ensure performance adding large dataset remains effective.", async () => {
      const count = 10_000;
      const dtos = defaultTagsDtos(count);

      const start = performance.now();
      const collection = new TagsCollection(dtos);
      const time = performance.now() - start;
      expect(collection).toHaveLength(count);
      expect(time).toBeLessThan(5_000);
    });
  });

  describe("TagsCollection:pushOrReplaceMany", () => {
    it("should add new tags to the collection", () => {
      const collection = new TagsCollection();

      collection.pushOrReplaceMany(defaultCollectionDto);

      expect(collection).toEqual(new TagsCollection(defaultCollectionDto));
    });

    it("should replace tags in the collection", () => {
      const collection = new TagsCollection(defaultCollectionDto);

      const updatedCollectionDto = [...defaultCollectionDto];
      updatedCollectionDto[0] = {
        ...defaultCollectionDto[0],
        slug: "updated",
      };

      collection.pushOrReplaceMany(updatedCollectionDto);

      expect(collection).toEqual(new TagsCollection(updatedCollectionDto));
    });

    it("should add and replace tags in the collection", () => {
      const collection = new TagsCollection(defaultCollectionDto);

      collection.pushOrReplaceMany(minimalCollectionDto);

      expect(collection).toEqual(new TagsCollection([...defaultCollectionDto, ...minimalCollectionDto]));
    });

    it("should not throw an EntityValidatorError if an item is malformed when ignoreInvalidEntity is true", () => {
      const collection = new TagsCollection(defaultCollectionDto);

      expect(() => collection.pushOrReplaceMany([{ id: null }], { ignoreInvalidEntity: true })).not.toThrow();

      expect(collection).toEqual(new TagsCollection(defaultCollectionDto));
    });

    it("should throw a TypeError if data is not an array", () => {
      FAIL_ARRAY_SCENARIOS.forEach((scenario) => {
        expect(() => new TagsCollection().pushOrReplaceMany(scenario)).toThrow(TypeError);
      });
    });

    it("should throw a CollectionValidationError if data is contains invalid TagEntity", () => {
      expect(() => new TagsCollection().pushOrReplaceMany([{}])).toThrow(CollectionValidationError);
    });
  });

  describe("TagsCollection:removeById", () => {
    it("remove by id works", () => {
      const collection = new TagsCollection(defaultCollectionDto);

      expect(collection.length).toBe(3);
      expect(collection.removeById(uuid())).toBe(false);
      expect(collection.length).toBe(3);

      expect(collection.removeById(defaultCollectionDto[2].id)).toBe(true);
      expect(collection.length).toBe(2);
      expect(collection.removeById(defaultCollectionDto[2].id)).toBe(false);
      expect(collection.length).toBe(2);

      expect(collection.removeById(defaultCollectionDto[1].id)).toBe(true);
      expect(collection.length).toBe(1);
      expect(collection.removeById(defaultCollectionDto[1].id)).toBe(false);
      expect(collection.length).toBe(1);

      expect(collection.removeById(defaultCollectionDto[0].id)).toBe(true);
      expect(collection.length).toBe(0);
      expect(collection.removeById(defaultCollectionDto[0].id)).toBe(false);
      expect(collection.length).toBe(0);
    });
  });

  describe("TagsCollection:update", () => {
    it("update works", () => {
      const collection = new TagsCollection(defaultCollectionDto);
      const [tag1, tag2] = defaultCollectionDto;

      expect(
        collection.replaceTag(
          tag1.id,
          new TagEntity({
            ...tag1,
            slug: "updated",
          }),
        ),
      ).toBe(true);

      expect(collection.items[0].slug).toBe("updated");
      expect(collection.items[1].slug).toBe(defaultCollectionDto[1].slug);
      expect(collection.length).toBe(defaultCollectionDto.length);

      expect(
        collection.replaceTag(
          "45ce85c9-e301-4de2-8b41-298507002860",
          new TagEntity({
            ...tag2,
            slug: "nope",
          }),
        ),
      ).toBe(false);
      expect(collection.length).toBe(defaultCollectionDto.length);
    });
  });
});
