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
import {TagsCollection} from "./tagsCollection";
import {EntityCollectionError} from "../abstract/entityCollectionError";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

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

    let t = () => {new TagsCollection(dto)};
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor fails if reusing same slug", () => {
    const tag1 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "slug": 'tag1',
      "is_shared": false,
    };
    const tag2 = {
      "id": "45ce85c9-e301-4de2-8b41-298507002862",
      "slug": 'tag1',
      "is_shared": false,
    };
    const dto = [tag1, tag2];

    let t = () => {new TagsCollection(dto)};
    expect(t).toThrow(EntityCollectionError);
  });

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

    let t = () => {new TagsCollection(dto)};
    expect(t).toThrow(EntityCollectionError);
  });
});
