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
 */
import {EntitySchema} from "../abstract/entitySchema";
import {EntityValidationError} from "../abstract/entityValidationError";
import Validator from 'validator';
import {ThemeEntity} from "./themeEntity";

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Theme entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ThemeEntity.ENTITY_NAME, ThemeEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "name": "default",
      "preview": "http://passbolt.local/img/themes/default.png",
    };

    const entity = new ThemeEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new ThemeEntity({});
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(typeof error.details).toEqual("object");
      expect(error.details.id).not.toBeUndefined();
      expect(error.details.name).not.toBeUndefined();
      expect(error.details.preview).not.toBeUndefined();
    }
  });

  it("constructor returns validation error if dto required fields are invalid", () => {
    try {
      new ThemeEntity({
        "id": "🏆‍️",
        "name": "🏆‍",
        "preview": "not-an-url",
      });
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {format: 'The id is not a valid uuid.'},
        name: {pattern: 'The name is not valid.'},
        preview: {format: 'The preview is not a valid x-url.'}
      });
    }
  });
});

