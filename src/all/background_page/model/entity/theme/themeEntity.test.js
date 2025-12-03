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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import ThemeEntity from "./themeEntity";
import {defaultThemeDto} from "./themeEntity.test.data";

describe("Theme entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(ThemeEntity.ENTITY_NAME, ThemeEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);

    const dto = defaultThemeDto();
    const entity = new ThemeEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    expect.assertions(4);

    try {
      new ThemeEntity({});
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(typeof error.details).toEqual("object");
      expect(error.details.id).not.toBeUndefined();
      expect(error.details.name).not.toBeUndefined();
    }
  });

  it("constructor returns validation error if dto required fields are invalid", () => {
    expect.assertions(2);
    try {
      new ThemeEntity({
        "id": "🏆‍️",
        "name": "🏆‍",
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {format: 'The id is not a valid uuid.'},
        name: {pattern: 'The name is not valid.'},
      });
    }
  });
});
