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
import {FavoriteEntity} from "./favoriteEntity";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';
import {EntityValidationError} from "../abstract/entityValidationError";

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Favorite entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(FavoriteEntity.ENTITY_NAME, FavoriteEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "45ce85c9-e301-4de2-8b41-298507002861",
      "user_id": "d57c10f5-633d-5160-9c81-8a0c6c4ec856",
      "foreign_key": "10801423-4121-42a4-99d1-86e66145a08c",
      //"foreign_model": "Resource",
      "created": "2020-05-06T21:59:24+00:00",
      // "modified": "2020-05-06T21:59:24+00:00"
    };
    const entity = new FavoriteEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new FavoriteEntity({
        "created": "2020-05-06T21:59:24+00:00",
        "modified": "2020-05-06T21:59:24+00:00"
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {required: 'The id is required.'},
        user_id: {required: 'The user_id is required.'},
        foreign_key: {required: 'The foreign_key is required.'},
        //foreign_model: { required: 'The foreign_model is required.' }
      });
    }
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new FavoriteEntity({
        "id": "🌪️",
        "user_id": "🌪️",
        "foreign_key": "🌪️",
        "foreign_model": "🌈️",
        "created": "🔮",
        "modified": "👠👠"
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {format: 'The id is not a valid uuid.'},
        user_id: {format: 'The user_id is not a valid uuid.'},
        foreign_key: {format: 'The foreign_key is not a valid uuid.'},
        //foreign_model: { enum: 'The foreign_model value is not included in the supported list.'},
        created: {format: 'The created is not a valid date-time.'},
        //modified: { format: 'The modified is not a valid date-time.' }
      });
    }
  });
});
