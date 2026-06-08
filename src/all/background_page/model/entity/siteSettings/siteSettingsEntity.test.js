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
import SiteSettingsEntity from "./siteSettingsEntity";
import { customEmailValidationProSiteSettings, defaultProSiteSettings } from "./siteSettingsEntity.test.data";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("SiteSettingsEntity entity", () => {
  describe("SiteSettingsEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(SiteSettingsEntity.ENTITY_NAME, SiteSettingsEntity.getSchema());
    });

    it("validates status property", () => {
      const successValues = ["enabled", "disabled", "not found"];
      const failValues = ["string"];

      assertEntityProperty.enumeration(SiteSettingsEntity, "status", successValues, failValues);
      assertEntityProperty.notRequired(SiteSettingsEntity, "status");
    });

    it("validates app property", () => {
      const successScenarios = [assertEntityProperty.SCENARIO_OBJECT];
      /*
       * @todo: //add failing scenarios when nested object will be checked
       * const failingScenarios = [assertEntityProperty.SCENARIO_ARRAY, assertEntityProperty.SCENARIO_INTEGER, assertEntityProperty.SCENARIO_STRING];
       */
      const failingScenarios = [];

      assertEntityProperty.assert(SiteSettingsEntity, "app", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(SiteSettingsEntity, "app");
    });

    it("validates passbolt property", () => {
      const successScenarios = [assertEntityProperty.SCENARIO_OBJECT];
      /*
       * @todo: //add failing scenarios when nested object will be checked
       * const failingScenarios = [assertEntityProperty.SCENARIO_ARRAY, assertEntityProperty.SCENARIO_INTEGER, assertEntityProperty.SCENARIO_STRING];
       */
      const failingScenarios = [];

      assertEntityProperty.assert(SiteSettingsEntity, "passbolt", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(SiteSettingsEntity, "passbolt");
    });

    it("validates serverTimeDiff property", () => {
      const successScenarios = [assertEntityProperty.SCENARIO_INTEGER, assertEntityProperty.SCENARIO_NULL];
      const failingScenarios = [
        assertEntityProperty.SCENARIO_STRING,
        assertEntityProperty.SCENARIO_FLOAT,
        assertEntityProperty.SCENARIO_OBJECT,
      ];

      assertEntityProperty.assert(SiteSettingsEntity, "serverTimeDiff", successScenarios, failingScenarios, "type");
      assertEntityProperty.notRequired(SiteSettingsEntity, "serverTimeDiff");
    });
  });

  describe("SiteSettingsEntity::constructor", () => {
    it("Should instantiate an SiteSettingsEntity with a minimal DTO", () => {
      expect.assertions(2);
      const dto = {};
      expect(() => new SiteSettingsEntity(dto)).not.toThrow();
      expect(new SiteSettingsEntity(dto).toDto()).toStrictEqual({
        status: "enabled",
      });
    });

    it("Should instantiate an SiteSettingsEntity with full DTO", () => {
      expect.assertions(2);
      const dto = defaultProSiteSettings();
      expect(() => new SiteSettingsEntity(dto)).not.toThrow();
      expect(new SiteSettingsEntity(dto).toDto()).toStrictEqual(dto);
    });
  });

  describe("SiteSettingsEntity::sanitizeEmailValidateRegex", () => {
    it("should sanitize API regex and remove starting and trailing slash", () => {
      const siteSettings = customEmailValidationProSiteSettings();
      SiteSettingsEntity.sanitizeEmailValidateRegex(siteSettings);
      expect(siteSettings.passbolt.email.validate.regex).toEqual(".*@passbolt.(c|com)$");
    });
  });

  describe("SiteSettingsEntity::emailValidateRegex", () => {
    it("should return null if undefined", () => {
      const siteSettings = defaultProSiteSettings();
      const entity = new SiteSettingsEntity(siteSettings);
      expect(entity.emailValidateRegex).toBeNull();
    });
    it("should return the customized setting if any", () => {
      const siteSettings = customEmailValidationProSiteSettings();
      const entity = new SiteSettingsEntity(siteSettings);
      expect(entity.emailValidateRegex).toEqual(".*@passbolt.(c|com)$");
    });
  });
});
