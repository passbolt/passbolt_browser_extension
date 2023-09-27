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
 * @since         4.3.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {defaultVerifyProviderData} from "./mfaVerifyProviderEntity.test.data";
import MfaSetupTotpEntity from "./mfaSetupTotpEntity";
import {defaultSetupTotpData} from "./mfaSetupTotpEntity.test.data";

describe("MfaSetupTotpEntity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(MfaSetupTotpEntity.ENTITY_NAME, MfaSetupTotpEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const entity = new MfaSetupTotpEntity(defaultSetupTotpData());

    expect(entity._props).toEqual(defaultSetupTotpData());
  });

  it("constructor returns validation error if verified field is missing", () => {
    try {
      new MfaSetupTotpEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('totp', 'required')).toBe(true);
      expect(error.hasError('otpProvisioningUri', 'required')).toBe(true);
    }
  });
  it("constructor returns validation error if totp code is not a valid format", () => {
    try {
      new MfaSetupTotpEntity(defaultVerifyProviderData({
        totp: "221"
      }));
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('totp', 'pattern')).toBe(true);
    }
  });
});
