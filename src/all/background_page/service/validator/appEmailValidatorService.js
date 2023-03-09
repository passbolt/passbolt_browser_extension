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
import OrganizationSettingsModel from "../../model/organizationSettings/organizationSettingsModel";
import OrganizationSettingsEntity from "../../model/entity/organizationSettings/organizationSettingsEntity";
import IsRegexValidator from "passbolt-styleguide/src/shared/lib/Validator/IsRegexValidator";
import IsEmailValidator from "passbolt-styleguide/src/shared/lib/Validator/IsEmailValidator";

/**
 * This service provides email validation and allow API administrator to customize email validation regex as per
 * their requirements.
 *
 * This service is used in a synchronous context (Entity) and should remain as it.
 *
 * This service relies on the application settings to be loaded and stored in the application settings model cache.
 * Ensure the settings are loaded before using the service.
 */
export default class AppEmailValidatorService {
  /**
   * Validate an email.
   *
   * @param {string} value The value to validate.
   * @returns {boolean}
   */
  static validate(value) {
    return AppEmailValidatorService.getValidator()
      .validate(value);
  }

  /**
   * Get the application validator.
   *
   * Note 1: This method is used in a non asynchronous context (Entity).
   * Note 2: This method requires the application settings to be loaded and stored in the app settings model cache.
   *
   * @returns {IsRegexValidator|IsEmailValidator}
   */
  static getValidator() {
    const appSettings = OrganizationSettingsModel.get();

    if (appSettings
      && appSettings instanceof OrganizationSettingsEntity
      && appSettings.emailValidateRegex) {
      return new IsRegexValidator(appSettings.emailValidateRegex);
    }

    return IsEmailValidator;
  }

  /**
   * Check if a custom validator defined.
   * @returns {boolean}
   */
  static hasCustomValidator() {
    return AppEmailValidatorService.getValidator !== IsEmailValidator;
  }
}
