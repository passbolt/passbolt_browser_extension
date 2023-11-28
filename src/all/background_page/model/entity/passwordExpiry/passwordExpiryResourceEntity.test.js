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
 * @since 4.5.0
 */

import each from "jest-each";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import PasswordExpiryResourceEntity from "./passwordExpiryResourceEntity";
import {defaultPasswordExpiryResourceDto} from "./passwordExpiryResourceEntity.test.data";
import {v4 as uuid} from "uuid";

describe("PasswordExpiryResource entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PasswordExpiryResourceEntity.ENTITY_NAME, PasswordExpiryResourceEntity.getSchema());
  });

  it("should accept a mininal valid DTO", () => {
    expect.assertions(1);
    const minmalDto = defaultPasswordExpiryResourceDto();

    expect(() => new PasswordExpiryResourceEntity(minmalDto)).not.toThrow();
  });

  it("should build an entity with given parameters", () => {
    expect.assertions(1);
    const expectedDto = {
      id: uuid(),
      expired: "2024-11-06T10:05:46Z",
      created: "2023-05-06T10:05:46+00:00",
      created_by: uuid(),
      modified: "2023-06-06T10:05:46+00:00",
      modified_by: uuid()
    };

    const entity = new PasswordExpiryResourceEntity(expectedDto);
    expect(entity.toDto()).toStrictEqual(expectedDto);
  });

  it("should throw an exception if required fields are not present", () => {
    const requiredFieldNames = PasswordExpiryResourceEntity.getSchema().required;
    const requiredFieldCount = 2;
    expect.assertions(requiredFieldCount * 2 + 1);

    expect(requiredFieldNames.length).toStrictEqual(requiredFieldCount);

    for (let i = 0; i < requiredFieldNames.length; i++) {
      const fieldName = requiredFieldNames[i];
      const dto = defaultPasswordExpiryResourceDto();
      delete dto[fieldName];
      try {
        new PasswordExpiryResourceEntity(dto);
      } catch (e) {
        expect(e).toBeInstanceOf(EntityValidationError);
        expect(e.hasError(fieldName, "required")).toStrictEqual(true);
      }
    }
  });

  each([
    {dto: {id: "string but not uuid"}, errorType: "format"},
    {dto: {id: -1}, errorType: "type"},

    {dto: {expired: "string but not a date"}, errorType: "format"},
    {dto: {expired: -1}, errorType: "type"},

    {dto: {created: "string but not a date"}, errorType: "format"},
    {dto: {created: -1}, errorType: "type"},

    {dto: {created_by: "string but not uuid"}, errorType: "format"},
    {dto: {created_by: -1}, errorType: "type"},

    {dto: {modified: "string but not a date"}, errorType: "format"},
    {dto: {modified: -1}, errorType: "type"},

    {dto: {modified_by: "string but not uuid"}, errorType: "format"},
    {dto: {modified_by: -1}, errorType: "type"},
  ]).describe("should throw an exception if DTO contains invalid values", scenario => {
    it(`scenario: ${JSON.stringify(scenario)}`, () => {
      expect.assertions(2);
      const fieldName = Object.keys(scenario.dto)[0];
      const erroneousDto = defaultPasswordExpiryResourceDto(scenario.dto);

      try {
        new PasswordExpiryResourceEntity(erroneousDto);
      } catch (e) {
        expect(e).toBeInstanceOf(EntityValidationError);
        expect(e.hasError(fieldName, scenario.errorType)).toStrictEqual(true);
      }
    });
  });
});
