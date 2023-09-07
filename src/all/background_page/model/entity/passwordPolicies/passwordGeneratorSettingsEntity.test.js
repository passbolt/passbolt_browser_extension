/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.3.0
 */

import each from "jest-each";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import PasswordGeneratorSettingsEntity from "./passwordGeneratorSettingsEntity";
import {defaultPasswordGeneratorSettings} from "./passwordGeneratorSettingsEntity.test.data";

describe("PasswordGeneratorSettings entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PasswordGeneratorSettingsEntity.ENTITY_NAME, PasswordGeneratorSettingsEntity.getSchema());
  });

  it("should accept a mininal valid DTO", () => {
    expect.assertions(1);
    const minmalDto = defaultPasswordGeneratorSettings();

    expect(() => new PasswordGeneratorSettingsEntity(minmalDto)).not.toThrow();
  });

  it("should throw an exception if required fields are not present", () => {
    const requiredFieldNames = PasswordGeneratorSettingsEntity.getSchema().required;
    const requiredFieldCount = 14;
    expect.assertions(requiredFieldCount * 2 + 1);

    expect(requiredFieldNames.length).toStrictEqual(requiredFieldCount);

    for (let i = 0; i < requiredFieldNames.length; i++) {
      const fieldName = requiredFieldNames[i];
      const dto = defaultPasswordGeneratorSettings();
      delete dto[fieldName];
      try {
        new PasswordGeneratorSettingsEntity(dto);
      } catch (e) {
        expect(e).toBeInstanceOf(EntityValidationError);
        expect(e.hasError(fieldName, "required")).toStrictEqual(true);
      }
    }
  });

  each([
    /*
     * @todo: to put when minimum and maximum will be validated
     *
     * {dto: {length: -1}, errorType: "minimum"},
     * {dto: {length: 2000}, errorType: "maximum"},
     */
    {dto: {length: ""}, errorType: "type"},
    {dto: {mask_upper: -1}, errorType: "type"},
    {dto: {mask_lower: -1}, errorType: "type"},
    {dto: {mask_digit: -1}, errorType: "type"},
    {dto: {mask_parenthesis: -1}, errorType: "type"},
    {dto: {mask_emoji: -1}, errorType: "type"},
    {dto: {mask_char1: -1}, errorType: "type"},
    {dto: {mask_char2: -1}, errorType: "type"},
    {dto: {mask_char3: -1}, errorType: "type"},
    {dto: {mask_char4: -1}, errorType: "type"},
    {dto: {mask_char5: -1}, errorType: "type"},
    {dto: {exclude_look_alike_chars: -1}, errorType: "type"},
    {dto: {min_length: ""}, errorType: "type"},
    {dto: {max_length: ""}, errorType: "type"},
  ]).describe("should throw an exception if DTO contains invalid values", scenario => {
    it(`scenario: ${JSON.stringify(scenario)}`, () => {
      expect.assertions(2);
      const fieldName = Object.keys(scenario.dto)[0];
      const erroneousDto = defaultPasswordGeneratorSettings(scenario.dto);

      try {
        new PasswordGeneratorSettingsEntity(erroneousDto);
      } catch (e) {
        expect(e).toBeInstanceOf(EntityValidationError);
        expect(e.hasError(fieldName, scenario.errorType)).toStrictEqual(true);
      }
    });
  });
});
