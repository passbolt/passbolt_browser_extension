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
 * @since         4.5.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import MfaTotpSetupInfoEntity from "./mfaTotpSetupInfoEntity";
import {defaultTotpQrCodeData} from "./mfaTotpSetupInfoEntity.test.data";

describe("MfaTotpSetupInfoEntity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(MfaTotpSetupInfoEntity.ENTITY_NAME, MfaTotpSetupInfoEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);

    const entity = new MfaTotpSetupInfoEntity(defaultTotpQrCodeData());

    expect(entity._props).toEqual(defaultTotpQrCodeData());
  });

  it("constructor returns validation error if verified field is missing", () => {
    expect.assertions(2);

    try {
      new MfaTotpSetupInfoEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('otpProvisioningUri', 'required')).toBe(true);
    }
  });
  it("constructor returns validation error if properties is not a valid type", () => {
    expect.assertions(2);

    try {
      new MfaTotpSetupInfoEntity(defaultTotpQrCodeData({
        otpProvisioningUri: null,
      }));
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('otpProvisioningUri', 'type')).toBe(true);
    }
  });
  it("constructor returns validation error if uri does not match the pattern", () => {
    expect.assertions(2);

    try {
      new MfaTotpSetupInfoEntity(defaultTotpQrCodeData({
        otpProvisioningUri: "test",
      }));
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('otpProvisioningUri', 'pattern')).toBe(true);
    }
  });
});
