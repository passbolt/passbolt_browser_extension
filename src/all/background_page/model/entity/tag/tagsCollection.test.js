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
import TagsCollection from "./tagsCollection";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("Tag entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(TagsCollection.ENTITY_NAME, TagsCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const tag1 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "slug": 'tag1',
      "is_shared": false,
    };
    const tag2 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002862",
      "slug": 'tag2',
      "is_shared": false,
    };
    const dto = [tag1, tag2];
    const entity = new TagsCollection(dto);
    expect(entity.toDto()).toEqual(dto);
    expect(JSON.stringify(entity)).toEqual(JSON.stringify(dto));
    expect(entity.items[0].slug).toEqual('tag1');
    expect(entity.items[1].slug).toEqual('tag2');
  });

  it("constructor fails if reusing same tag", () => {
    const tag1 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "slug": 'tag1',
      "is_shared": false,
    };
    const dto = [tag1, tag1];

    const t = () => { new TagsCollection(dto); };
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
    const tag1 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "slug": 'tag1',
      "is_shared": false,
    };
    const tag2 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "slug": 'tag2',
      "is_shared": false,
    };
    const dto = [tag1, tag2];

    const t = () => { new TagsCollection(dto); };
    expect(t).toThrow(EntityCollectionError);
  });

  it("remove by id works", () => {
    const tag1 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "slug": 'tag1',
      "is_shared": false,
    };
    const tag2 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002862",
      "slug": 'tag2',
      "is_shared": false,
    };
    const tag3 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002863",
      "slug": 'tag3',
      "is_shared": false,
    };
    const dto = [tag1, tag2, tag3];
    const collection = new TagsCollection(dto);
    expect(collection.length).toBe(3);
    expect(collection.removeById("45ce85c9-e301-4de2-8b41-298507002860")).toBe(false);
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


  it("update works", () => {
    const tag1 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "slug": 'tag1',
      "is_shared": false,
    };
    const tag2 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002862",
      "slug": 'tag2',
      "is_shared": false,
    };
    const dto = [tag1, tag2];
    const collection = new TagsCollection(dto);
    expect(collection.replaceTag("45ce85c9-e301-4de2-8b41-298507002861", new TagEntity({
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "slug": 'updated',
      "is_shared": false}))).toBe(true);
    expect(collection.items[0].slug).toBe('updated');
    expect(collection.items[1].slug).toBe('tag2');
    expect(collection.length).toBe(2);
    expect(collection.replaceTag("45ce85c9-e301-4de2-8b41-298507002860", new TagEntity({
      "id": "45ce85c9-e301-4de2-8b41-298507002860",
      "slug": 'nope',
      "is_shared": false}))).toBe(false);
    expect(collection.length).toBe(2);
  });
});
