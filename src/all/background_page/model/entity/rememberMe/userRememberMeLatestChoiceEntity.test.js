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
 * @since         4.2.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import UserRememberMeLatestChoiceEntity from "./userRememberMeLatestChoiceEntity";
import {defaultRememberMeLatestChoiceDto} from "./userRememberMeLatestChoiceEntity.test.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("UserRememberMeLatestChoiceEntity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(UserRememberMeLatestChoiceEntity.ENTITY_NAME, UserRememberMeLatestChoiceEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);
    const dto = defaultRememberMeLatestChoiceDto();
    const entity = new UserRememberMeLatestChoiceEntity(dto);
    expect(entity.duration).toStrictEqual(0);
  });

  it(`Should not accept non integer duration`, async() => {
    const forbiddenCases = [
      "-1", "0", "1", NaN, "test", 3.14, -3.14, false, null, undefined,
      /* @todo add -2 like value when minimum validation is supported */
    ];
    expect.assertions(forbiddenCases.length);
    const expectedError = new EntityValidationError('Could not validate entity UserRememberMeLatestChoice.');

    for (let i = 0; i < forbiddenCases.length; i++) {
      const dto = defaultRememberMeLatestChoiceDto({duration: forbiddenCases[i]});
      expect(() => new UserRememberMeLatestChoiceEntity(dto)).toThrow(expectedError);
    }
  });
});
