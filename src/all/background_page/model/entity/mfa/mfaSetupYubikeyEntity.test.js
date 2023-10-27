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
 * @since         4.4.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import MfaSetupYubikeyEntity from "./mfaSetupYubikeyEntity";
import {defaultSetupYubikeyData} from "./mfaSetupYubikeyEntity.test.data";

describe("MfaSetupYubikeyEntity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(MfaSetupYubikeyEntity.ENTITY_NAME, MfaSetupYubikeyEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);
    const entity = new MfaSetupYubikeyEntity(defaultSetupYubikeyData());

    expect(entity._props).toEqual(defaultSetupYubikeyData());
  });

  it("constructor returns validation error if verified field is missing", () => {
    expect.assertions(2);

    try {
      new MfaSetupYubikeyEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('hotp', 'required')).toBe(true);
    }
  });
  it("constructor returns validation error if hotp code is not a valid format", () => {
    expect.assertions(2);

    try {
      new MfaSetupYubikeyEntity(defaultSetupYubikeyData({
        hotp: "221"
      }));
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('hotp', 'pattern')).toBe(true);
    }
  });
});
