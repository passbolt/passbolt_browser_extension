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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("Tag entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(TagEntity.ENTITY_NAME, TagEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "slug": "test",
      "is_shared": false
    };
    const entity = new TagEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new TagEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        slug: {required: 'The slug is required.'}
      });
    }
  });

  it("constructor returns validation error if dto required fields are invalid", () => {
    try {
      new TagEntity({
        "id": "🧟‍️",
        "slug": [],
        "is_shared": "🧟‍",
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {format: 'The id is not a valid uuid.'},
        slug: {type: 'The slug is not a valid string.'},
        is_shared: {type: 'The is_shared is not a valid boolean.'}
      });
    }
  });

  it("constructor returns validation error if dto required fields are invalid - part2 biggie smalls", () => {
    try {
      new TagEntity({
        "id": "45ce85c9-e301-4de2-8b41-298507002861",
        "slug": "",
        "is_shared": false,
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        slug: {minLength: 'The slug should be 1 character in length minimum.'},
      });
    }
    try {
      new TagEntity({
        "id": "45ce85c9-e301-4de2-8b41-298507002861",
        "slug": Array(129).join("a"),
        "is_shared": false,
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        slug: {minLength: 'The slug should be 128 characters in length maximum.'},
      });
    }
  });

  it("constructor returns validation error if dto required fields are invalid - part3 hashtag", () => {
    try {
      new TagEntity({
        "id": "45ce85c9-e301-4de2-8b41-298507002861",
        "slug": 'test',
        "is_shared": true,
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        is_shared: {hashtag: 'A shared tag should start with a hashtag.'},
      });
    }
  });
});

