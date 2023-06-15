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
import SecurityTokenEntity from "./securityTokenEntity";

describe("SecurityToken entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(SecurityTokenEntity.ENTITY_NAME, SecurityTokenEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "code": "PB1",
      "color": "#FFF",
      "textcolor": "#000",
    };

    const entity = new SecurityTokenEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new SecurityTokenEntity({});
      expect(true).toBeFalsy();
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('code', 'required')).toBe(true);
      expect(error.hasError('color', 'required')).toBe(true);
      expect(error.hasError('textcolor', 'required')).toBe(true);
    }
  });

  it("constructor returns validation error if dto required fields are invalid", () => {
    try {
      new SecurityTokenEntity({
        "code": "🏆‍️",
        "color": "🏆‍️",
        "textcolor": "true"
      });
      expect(false).toBe(true);
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        code: {pattern: 'The code is not valid.'},
        color: {format: 'The color is not a valid x-hex-color.'},
        textcolor: {format: 'The textcolor is not a valid x-hex-color.'}
      });
    }
  });
});
