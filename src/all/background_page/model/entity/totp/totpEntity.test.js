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
 * @since         3.0.0
 */
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {defaultTotpViewModelDto} from 'passbolt-styleguide/src/shared/models/totp/TotpDto.test.data';
import TotpEntity from "./totpEntity";
import each from "jest-each";

describe("Totp entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(TotpEntity.ENTITY_NAME, TotpEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = defaultTotpViewModelDto();
    const entity = new TotpEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  each([
    {scenario: 'empty dto', dto: {}},
    {scenario: 'secret key not base32', dto: defaultTotpViewModelDto({secret_key: " 871H KBKB "})},
    {scenario: 'digits is not valid', dto: defaultTotpViewModelDto({digits: 10})},
    {scenario: 'period is not valid', dto: defaultTotpViewModelDto({period: 0})},
    {scenario: 'algorithm is not valid', dto: defaultTotpViewModelDto({algorithm: "AAA"})},
  ]).describe("constructor returns validation error if dto is not valid", test => {
    it(`Should not validate: ${test.scenario}`, async() => {
      const t = () => { new TotpEntity(test.dto); };
      expect(t).toThrow(EntityValidationError);
    });
  });
});
