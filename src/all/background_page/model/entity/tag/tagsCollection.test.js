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
import {v4 as uuid} from "uuid";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {defaultTagDto} from "./tagEntity.test.data";
import TagsCollection from "./tagsCollection";
import TagEntity from "./tagEntity";

describe("TagsCollection", () => {
  describe("TagsCollection::constructor", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(TagsCollection.ENTITY_NAME, TagsCollection.getSchema());
    });

    it("constructor works if valid minimal DTO is provided", () => {
      const tag1 = defaultTagDto({slug: 'tag1'});
      const tag2 = defaultTagDto({slug: 'tag2'});
      const dto = [tag1, tag2];
      const entity = new TagsCollection(dto);
      expect(entity.toDto()).toEqual(dto);
      expect(JSON.stringify(entity)).toEqual(JSON.stringify(dto));
      expect(entity.items[0].slug).toEqual('tag1');
      expect(entity.items[1].slug).toEqual('tag2');
    });

    it("constructor fails if reusing same tag", () => {
      const tag1 = defaultTagDto();
      const dto = [tag1, tag1];

      const t = () => {
        new TagsCollection(dto);
      };
      expect(t).toThrow(EntityCollectionError);
    });

    /*
     * it("constructor fails if reusing same slug", () => {
     *   const tag1 = {
     *     "id": "45ce85c9-e301-4de2-8b41-298507002861",
     *     "slug": 'tag1',
     *     "is_shared": false,
     *   };
     *   const tag2 = {
     *     "id": "45ce85c9-e301-4de2-8b41-298507002862",
     *     "slug": 'tag1',
     *     "is_shared": false,
     *   };
     *   const dto = [tag1, tag2];
     *
     *   let t = () => {new TagsCollection(dto)};
     *   expect(t).toThrow(EntityCollectionError);
     * });
     */

    it("constructor fails if reusing same id", () => {
      const tag1 = defaultTagDto();
      const tag2 = defaultTagDto({id: tag1.id});
      const dto = [tag1, tag2];

      const t = () => {
        new TagsCollection(dto);
      };
      expect(t).toThrow(EntityCollectionError);
    });
  });

  describe("TagsCollection:push", () => {
    it("it should allow to push new item from a dto", () => {
      const collection = new TagsCollection([]);
      const tag1 = defaultTagDto();
      const tag2 = defaultTagDto();
      const tag3 = defaultTagDto();

      expect.assertions(9);
      collection.push(tag1);
      expect(collection).toHaveLength(1);
      expect(collection.items[0]).toBeInstanceOf(TagEntity);
      expect(collection.items[0].id).toEqual(tag1.id);
      collection.push(tag2);
      expect(collection).toHaveLength(2);
      expect(collection.items[1]).toBeInstanceOf(TagEntity);
      expect(collection.items[1].id).toEqual(tag2.id);
      collection.push(tag3);
      expect(collection).toHaveLength(3);
      expect(collection.items[2]).toBeInstanceOf(TagEntity);
      expect(collection.items[2].id).toEqual(tag3.id);
    });

    it("it should allow to push new item from an entity", () => {
      const collection = new TagsCollection([]);
      const tag1 = new TagEntity(defaultTagDto());
      const tag2 = new TagEntity(defaultTagDto());
      const tag3 = new TagEntity(defaultTagDto());

      expect.assertions(9);
      collection.push(tag1);
      expect(collection).toHaveLength(1);
      expect(collection.items[0]).toBeInstanceOf(TagEntity);
      expect(collection.items[0].id).toEqual(tag1.id);
      collection.push(tag2);
      expect(collection).toHaveLength(2);
      expect(collection.items[1]).toBeInstanceOf(TagEntity);
      expect(collection.items[1].id).toEqual(tag2.id);
      collection.push(tag3);
      expect(collection).toHaveLength(3);
      expect(collection.items[2]).toBeInstanceOf(TagEntity);
      expect(collection.items[2].id).toEqual(tag3.id);
    });

    it("it fails if the unique id build rule fails", () => {
      const collection = new TagsCollection([]);
      const tag1 = defaultTagDto();
      const tag2 = defaultTagDto();
      const tag3 = defaultTagDto({id: tag1.id});

      expect.assertions(3);
      expect(() => collection.push(tag1)).not.toThrow();
      expect(() => collection.push(tag2)).not.toThrow();
      expect(() => collection.push(tag3)).toThrow(EntityCollectionError);
    });

    it("it should allow to push new items from a dto", () => {
      const collection = new TagsCollection([]);
      const tag1 = defaultTagDto();
      const tag2 = defaultTagDto();
      const tag3 = defaultTagDto();

      expect.assertions(7);
      collection.push([tag1, tag2, tag3]);
      expect(collection).toHaveLength(3);
      expect(collection.items[0]).toBeInstanceOf(TagEntity);
      expect(collection.items[0].id).toEqual(tag1.id);
      expect(collection.items[1]).toBeInstanceOf(TagEntity);
      expect(collection.items[1].id).toEqual(tag2.id);
      expect(collection.items[2]).toBeInstanceOf(TagEntity);
      expect(collection.items[2].id).toEqual(tag3.id);
    });

    it("it should allow to push new items from an array of entities", () => {
      const collection = new TagsCollection([]);
      const tag1 = new TagEntity(defaultTagDto());
      const tag2 = new TagEntity(defaultTagDto());
      const tag3 = new TagEntity(defaultTagDto());

      expect.assertions(7);
      collection.push([tag1, tag2, tag3]);
      expect(collection).toHaveLength(3);
      expect(collection.items[0]).toBeInstanceOf(TagEntity);
      expect(collection.items[0].id).toEqual(tag1.id);
      expect(collection.items[1]).toBeInstanceOf(TagEntity);
      expect(collection.items[1].id).toEqual(tag2.id);
      expect(collection.items[2]).toBeInstanceOf(TagEntity);
      expect(collection.items[2].id).toEqual(tag3.id);
    });

    it("it fails if the unique id build rule fails", () => {
      const tag1 = defaultTagDto();
      const tag2 = defaultTagDto();
      const tag3 = defaultTagDto({id: tag1.id});

      expect.assertions(2);
      expect(() => new TagsCollection([]).push([tag1, tag2, tag3])).toThrow(EntityCollectionError);
      expect(() => new TagsCollection([]).push([tag1, tag1])).toThrow(EntityCollectionError);
    });
  });

  describe("TagsCollection:removeById", () => {
    it("remove by id works", () => {
      const tag1 = defaultTagDto();
      const tag2 = defaultTagDto();
      const tag3 = defaultTagDto();
      const dto = [tag1, tag2, tag3];
      const collection = new TagsCollection(dto);
      expect(collection.length).toBe(3);
      expect(collection.removeById(uuid())).toBe(false);
      expect(collection.length).toBe(3);
      expect(collection.removeById(tag2.id)).toBe(true);
      expect(collection.length).toBe(2);
      expect(collection.removeById(tag2.id)).toBe(false);
      expect(collection.length).toBe(2);
      expect(collection.removeById(tag1.id)).toBe(true);
      expect(collection.length).toBe(1);
      expect(collection.removeById(tag1.id)).toBe(false);
      expect(collection.length).toBe(1);
      expect(collection.removeById(tag3.id)).toBe(true);
      expect(collection.length).toBe(0);
      expect(collection.removeById(tag3.id)).toBe(false);
      expect(collection.length).toBe(0);
    });
  });

  describe("TagsCollection:update", () => {
    it("update works", () => {
      const tag1 = defaultTagDto();
      const tag2 = defaultTagDto({slug: 'personal-tag-2'});
      const dto = [tag1, tag2];
      const collection = new TagsCollection(dto);
      expect(collection.replaceTag(tag1.id, new TagEntity({
        ...tag1,
        slug: 'updated'
      }))).toBe(true);
      expect(collection.items[0].slug).toBe('updated');
      expect(collection.items[1].slug).toBe('personal-tag-2');
      expect(collection.length).toBe(2);
      expect(collection.replaceTag("45ce85c9-e301-4de2-8b41-298507002860", new TagEntity({
        ...tag2,
        slug: 'nope'
      }))).toBe(false);
      expect(collection.length).toBe(2);
    });
  });
});
