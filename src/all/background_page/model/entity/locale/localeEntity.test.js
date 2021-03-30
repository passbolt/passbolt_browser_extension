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
import {LocaleEntity} from "./localeEntity";

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Locale entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(LocaleEntity.ENTITY_NAME, LocaleEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "language": "en-US",
    };

    const entity = new LocaleEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new LocaleEntity({});
    } catch(error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect(typeof error.details).toEqual("object");
      expect(error.details.language).not.toBeUndefined();
    }
  });

  it("constructor returns validation error if dto required fields are invalid", () => {
    try {
      new LocaleEntity({
        "language": "🏆‍️"
      });
      expect(false).toBe(true);
    } catch(error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        language: { pattern: 'The language is not valid.' },
      });
    }
  });
});

