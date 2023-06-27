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
 * @since         3.12.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import OrganizationSettingsEntity from "./organizationSettingsEntity";
import {
  customEmailValidationProOrganizationSettings,
  defaultProOrganizationSettings
} from "./organizationSettingsEntity.test.data";

describe("OrganizationSettingsEntity entity", () => {
  describe("OrganizationSettingsEntity::schema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(OrganizationSettingsEntity.ENTITY_NAME, OrganizationSettingsEntity.getSchema());
    });
  });

  describe("OrganizationSettingsEntity::constructor", () => {
    it.todo("Test constructor");
  });

  describe("OrganizationSettingsEntity::sanitizeEmailValidateRegex", () => {
    it("should sanitize API regex and remove starting and trailing slash", () => {
      const organizationSettings = customEmailValidationProOrganizationSettings();
      OrganizationSettingsEntity.sanitizeEmailValidateRegex(organizationSettings);
      expect(organizationSettings.passbolt.email.validate.regex).toEqual(".*@passbolt.(c|com)$");
    });
  });

  describe("OrganizationSettingsEntity::emailValidateRegex", () => {
    it("should return null if undefined", () => {
      const organizationSettings = defaultProOrganizationSettings();
      const entity = new OrganizationSettingsEntity(organizationSettings);
      expect(entity.emailValidateRegex).toBeNull();
    });
    it("should return the customized setting if any", () => {
      const organizationSettings = customEmailValidationProOrganizationSettings();
      const entity = new OrganizationSettingsEntity(organizationSettings);
      expect(entity.emailValidateRegex).toEqual(".*@passbolt.(c|com)$");
    });
  });
});
