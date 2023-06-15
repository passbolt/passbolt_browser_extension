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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import ThemeEntity from "./themeEntity";

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
        "preview": "url-without-tld",
      });
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {format: 'The id is not a valid uuid.'},
        name: {pattern: 'The name is not valid.'},
      });
    }
  });

  it("constructor works if valid minimal DTO is provided on localhost", () => {
    const dto = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "name": "default",
      "preview": "https://localhost:8443/img/themes/default.png",
    };
    const entity = new ThemeEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });
});
