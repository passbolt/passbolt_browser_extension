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
 * @since         3.11.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import MfaCombinedEnabledProvidersEntity from './mfaCombinedEnabledProvidersEntity';
import {defaultMfaSettings} from "./mfaCombinedEnabledProvidersEntity.data";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("Mfa settings entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(MfaCombinedEnabledProvidersEntity.ENTITY_NAME, MfaCombinedEnabledProvidersEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = defaultMfaSettings();
    const entity = new MfaCombinedEnabledProvidersEntity(dto);
    expect(entity.MfaOrganizationSettings.toJSON()).toEqual(dto.MfaOrganizationSettings);
    expect(entity.MfaAccountSettings.toJSON()).toEqual(dto.MfaAccountSettings);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new MfaCombinedEnabledProvidersEntity({});
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('MfaOrganizationSettings', 'required')).toBe(true);
      expect(error.hasError('MfaAccountSettings', 'required')).toBe(true);
    }
  });

  it("constructor returns validation error if the associated mfa organization settings entity does not validate.", () => {
    try {
      new MfaCombinedEnabledProvidersEntity({MfaOrganizationSettings: {totp: true, yubikey: "43", duo: false}, MfaAccountSettings: {totp: true, yubikey: true, duo: false}});
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('yubikey', 'type')).toBe(true);
      expect(error.hasError('totp')).toBe(false);
      expect(error.hasError('duo')).toBe(false);
    }
  });

  it("constructor returns validation error if the associated mfa account settings entity does not validate.", () => {
    try {
      new MfaCombinedEnabledProvidersEntity({MfaOrganizationSettings: {totp: true, yubikey: true, duo: false}, MfaAccountSettings: {totp: "43", yubikey: true, duo: false}});
      expect(true).toBeFalsy();
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.hasError('totp', 'type')).toBe(true);
      expect(error.hasError('yubikey')).toBe(false);
      expect(error.hasError('duo')).toBe(false);
    }
  });
});
