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
 * @since         5.17.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import WebauthnSetupCeremonyEntity from "./webauthnSetupCeremonyEntity";
import {
  defaultWebauthnSetupCeremonyDto,
  expiredWebauthnSetupCeremonyDto,
  webauthnSetupCeremonyWithCredentialDto,
} from "./webauthnSetupCeremonyEntity.test.data";

describe("WebauthnSetupCeremonyEntity", () => {
  describe("WebauthnSetupCeremonyEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(WebauthnSetupCeremonyEntity.name, WebauthnSetupCeremonyEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.uuid(WebauthnSetupCeremonyEntity, "id");
      assertEntityProperty.required(WebauthnSetupCeremonyEntity, "id");
    });

    it("validates tab_id property", () => {
      assertEntityProperty.integer(WebauthnSetupCeremonyEntity, "tab_id");
      assertEntityProperty.required(WebauthnSetupCeremonyEntity, "tab_id");
    });

    it("validates handle property", () => {
      assertEntityProperty.string(WebauthnSetupCeremonyEntity, "handle");
      assertEntityProperty.minLength(WebauthnSetupCeremonyEntity, "handle", 1);
      assertEntityProperty.required(WebauthnSetupCeremonyEntity, "handle");
    });

    it("validates started_at property", () => {
      assertEntityProperty.dateTime(WebauthnSetupCeremonyEntity, "started_at");
      assertEntityProperty.required(WebauthnSetupCeremonyEntity, "started_at");
    });

    it("validates credential property", () => {
      assertEntityProperty.nullable(WebauthnSetupCeremonyEntity, "credential");
      assertEntityProperty.notRequired(WebauthnSetupCeremonyEntity, "credential");
    });

    it("validates aaguid property", () => {
      const successScenarios = [
        assertEntityProperty.SCENARIO_UUID,
        { scenario: "a non RFC 4122 aaguid", value: "adce0002-35bc-c60a-648b-0b25f1f05503" },
      ];
      const failScenarios = [
        assertEntityProperty.SCENARIO_STRING,
        { scenario: "upper case hex", value: "ADCE0002-35BC-C60A-648B-0B25F1F05503" },
      ];
      assertEntityProperty.assert(WebauthnSetupCeremonyEntity, "aaguid", successScenarios, failScenarios, "pattern");
      assertEntityProperty.nullable(WebauthnSetupCeremonyEntity, "aaguid");
      assertEntityProperty.notRequired(WebauthnSetupCeremonyEntity, "aaguid");
    });
  });

  describe("WebauthnSetupCeremonyEntity::constructor", () => {
    it("works if valid minimal DTO is provided", () => {
      expect.assertions(8);
      const dto = defaultWebauthnSetupCeremonyDto();
      const entity = new WebauthnSetupCeremonyEntity(dto);
      expect(entity.toDto()).toEqual(dto);
      expect(entity.id).toEqual(dto.id);
      expect(entity.tabId).toEqual(dto.tab_id);
      expect(entity.handle).toEqual(dto.handle);
      expect(entity.credential).toBeNull();
      expect(entity.aaguid).toBeNull();
      expect(entity.hasCredential).toBe(false);
      expect(entity.isExpired).toBe(false);
    });

    it("exposes the credential and aaguid once delivered", () => {
      expect.assertions(3);
      const dto = webauthnSetupCeremonyWithCredentialDto();
      const entity = new WebauthnSetupCeremonyEntity(dto);
      expect(entity.credential).toEqual(dto.credential);
      expect(entity.aaguid).toEqual(dto.aaguid);
      expect(entity.hasCredential).toBe(true);
    });

    it("is expired after the time to live", () => {
      expect.assertions(1);
      const entity = new WebauthnSetupCeremonyEntity(expiredWebauthnSetupCeremonyDto());
      expect(entity.isExpired).toBe(true);
    });
  });
});
