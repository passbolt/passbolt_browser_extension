/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.12.0
 */

import AppEmailValidatorService from "./appEmailValidatorService";
import IsEmailValidator from "passbolt-styleguide/src/shared/lib/Validator/IsEmailValidator";
import {
  customEmailValidationProOrganizationSettings, defaultProOrganizationSettings
} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import OrganizationSettingsEntity from "../../model/entity/organizationSettings/organizationSettingsEntity";
import IsRegexValidator from "passbolt-styleguide/src/shared/lib/Validator/IsRegexValidator";

describe("AppEmailValidatorService", () => {
  describe("AppEmailValidatorService.getValidator", () => {
    it("should return IsEmailValidator as default email validator.", async() => {
      expect.assertions(1);
      expect(AppEmailValidatorService.getValidator()).toBe(IsEmailValidator);
    });

    it("should return IsRegexValidator if the application settings customize the email regex validation.", async() => {
      expect.assertions(1);
      const organizationSettings = customEmailValidationProOrganizationSettings();
      OrganizationSettingsModel.set(new OrganizationSettingsEntity(organizationSettings));
      expect(AppEmailValidatorService.getValidator()).toBeInstanceOf(IsRegexValidator);
    });

    it("should fallback on IsEmailValidator if application settings did not customize the email regex validation.", async() => {
      expect.assertions(1);
      const organizationSettings = defaultProOrganizationSettings();
      OrganizationSettingsModel.set(new OrganizationSettingsEntity(organizationSettings));
      expect(AppEmailValidatorService.getValidator()).toBe(IsEmailValidator);
    });
  });

  describe("AppEmailValidatorService::validate", () => {
    it("should validate standard email if application settings did not customize the email regex validation.", async() => {
      expect.assertions(2);
      expect(AppEmailValidatorService.validate("ada@passbolt.com")).toBeTruthy();
      expect(AppEmailValidatorService.validate("ada@passbolt.c")).toBeFalsy();
    });

    it("should validate custom email if the application settings customize the email regex validation.", async() => {
      expect.assertions(2);
      const organizationSettings = customEmailValidationProOrganizationSettings();
      OrganizationSettingsModel.set(new OrganizationSettingsEntity(organizationSettings));
      expect(AppEmailValidatorService.validate("ada@passbolt.c")).toBeTruthy();
      expect(AppEmailValidatorService.validate("ada@passbolt.lu")).toBeFalsy();
    });
  });
});
