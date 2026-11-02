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
import MfaWebauthnSettingsEntity from "./mfaWebauthnSettingsEntity";
import { defaultMfaWebauthnSettingsDto } from "./mfaWebauthnSettingsEntity.test.data";

describe("MfaWebauthnSettingsEntity", () => {
  describe("MfaWebauthnSettingsEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(MfaWebauthnSettingsEntity.name, MfaWebauthnSettingsEntity.getSchema());
    });

    it("validates max_credentials_per_user property", () => {
      assertEntityProperty.integer(MfaWebauthnSettingsEntity, "max_credentials_per_user");
      assertEntityProperty.minimum(MfaWebauthnSettingsEntity, "max_credentials_per_user", 1);
      assertEntityProperty.required(MfaWebauthnSettingsEntity, "max_credentials_per_user");
    });
  });

  describe("MfaWebauthnSettingsEntity::constructor", () => {
    it("works if valid DTO is provided", () => {
      expect.assertions(2);
      const dto = defaultMfaWebauthnSettingsDto();
      const entity = new MfaWebauthnSettingsEntity(dto);
      expect(entity.toDto()).toEqual(dto);
      expect(entity.maxCredentialsPerUser).toEqual(10);
    });

    it("drops the API fields that are not modelled", () => {
      expect.assertions(1);
      const dto = defaultMfaWebauthnSettingsDto({ timeout_ms: 60000, attestation: "none" });
      const entity = new MfaWebauthnSettingsEntity(dto);
      expect(entity.toDto()).toEqual(defaultMfaWebauthnSettingsDto());
    });
  });
});
