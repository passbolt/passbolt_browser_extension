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
import PassphraseGeneratorSettingsEntity from "./passphraseGeneratorSettingsEntity";
import {defaultPassphraseGeneratorSettings} from "./passphraseGeneratorSettingsEntity.test.data";

describe("PassphraseGeneratorSettings entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(PassphraseGeneratorSettingsEntity.ENTITY_NAME, PassphraseGeneratorSettingsEntity.getSchema());
  });

  it("should accept a mininal valid DTO", () => {
    expect.assertions(1);
    const minmalDto = defaultPassphraseGeneratorSettings();

    expect(() => new PassphraseGeneratorSettingsEntity(minmalDto)).not.toThrow();
  });

  it("should throw an exception if required fields are not present", () => {
    const requiredFieldNames = PassphraseGeneratorSettingsEntity.getSchema().required;
    const requiredFieldCount = 5;
    expect.assertions(requiredFieldCount * 2 + 1);

    expect(requiredFieldNames.length).toStrictEqual(requiredFieldCount);

    for (let i = 0; i < requiredFieldNames.length; i++) {
      const fieldName = requiredFieldNames[i];
      const dto = defaultPassphraseGeneratorSettings();
      delete dto[fieldName];
      try {
        new PassphraseGeneratorSettingsEntity(dto);
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
     * {dto: {words: -1}, errorType: "minimum"},
     * {dto: {words: 2000}, errorType: "maximum"},
     */
    {dto: {word_separator: -1}, errorType: "type"},
    {dto: {word_separator: " ".padEnd(11)}, errorType: "maxLength"},
    {dto: {word_case: -1}, errorType: "type"},
    {dto: {word_case: "Something wrong"}, errorType: "enum"},
    {dto: {min_words: "Something wrong"}, errorType: "type"},
    {dto: {max_words: "Something wrong"}, errorType: "type"},
  ]).describe("should throw an exception if DTO contains invalid values", scenario => {
    it(`scenario: ${JSON.stringify(scenario)}`, () => {
      expect.assertions(2);
      const fieldName = Object.keys(scenario.dto)[0];
      const erroneousDto = defaultPassphraseGeneratorSettings(scenario.dto);

      try {
        new PassphraseGeneratorSettingsEntity(erroneousDto);
      } catch (e) {
        expect(e).toBeInstanceOf(EntityValidationError);
        expect(e.hasError(fieldName, scenario.errorType)).toStrictEqual(true);
      }
    });
  });
});
