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
import MfaWebauthnCredentialEntity from "./mfaWebauthnCredentialEntity";
import { defaultMfaWebauthnCredentialDto } from "./mfaWebauthnCredentialEntity.test.data";

describe("MfaWebauthnCredentialEntity", () => {
  describe("MfaWebauthnCredentialEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(MfaWebauthnCredentialEntity.name, MfaWebauthnCredentialEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.uuid(MfaWebauthnCredentialEntity, "id");
      assertEntityProperty.required(MfaWebauthnCredentialEntity, "id");
    });

    it("validates credential_id property", () => {
      assertEntityProperty.string(MfaWebauthnCredentialEntity, "credential_id");
      assertEntityProperty.minLength(MfaWebauthnCredentialEntity, "credential_id", 1);
      assertEntityProperty.required(MfaWebauthnCredentialEntity, "credential_id");
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
      assertEntityProperty.assert(MfaWebauthnCredentialEntity, "aaguid", successScenarios, failScenarios, "pattern");
      assertEntityProperty.nullable(MfaWebauthnCredentialEntity, "aaguid");
      assertEntityProperty.required(MfaWebauthnCredentialEntity, "aaguid");
    });

    it("validates name property", () => {
      assertEntityProperty.string(MfaWebauthnCredentialEntity, "name");
      assertEntityProperty.maxLength(MfaWebauthnCredentialEntity, "name", 255);
      assertEntityProperty.nullable(MfaWebauthnCredentialEntity, "name");
      assertEntityProperty.required(MfaWebauthnCredentialEntity, "name");
    });

    it("validates sign_count property", () => {
      assertEntityProperty.integer(MfaWebauthnCredentialEntity, "sign_count");
      assertEntityProperty.minimum(MfaWebauthnCredentialEntity, "sign_count", 0);
      assertEntityProperty.required(MfaWebauthnCredentialEntity, "sign_count");
    });

    it("validates last_used property", () => {
      assertEntityProperty.dateTime(MfaWebauthnCredentialEntity, "last_used");
      assertEntityProperty.nullable(MfaWebauthnCredentialEntity, "last_used");
      assertEntityProperty.notRequired(MfaWebauthnCredentialEntity, "last_used");
    });

    it("validates created property", () => {
      assertEntityProperty.dateTime(MfaWebauthnCredentialEntity, "created");
      assertEntityProperty.required(MfaWebauthnCredentialEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.dateTime(MfaWebauthnCredentialEntity, "modified");
      assertEntityProperty.required(MfaWebauthnCredentialEntity, "modified");
    });
  });

  describe("MfaWebauthnCredentialEntity::constructor", () => {
    it("works if valid DTO is provided", () => {
      expect.assertions(9);
      const dto = defaultMfaWebauthnCredentialDto();
      const entity = new MfaWebauthnCredentialEntity(dto);
      expect(entity.toDto()).toEqual(dto);
      expect(entity.id).toEqual(dto.id);
      expect(entity.credentialId).toEqual(dto.credential_id);
      expect(entity.aaguid).toEqual(dto.aaguid);
      expect(entity.name).toEqual(dto.name);
      expect(entity.signCount).toEqual(dto.sign_count);
      expect(entity.lastUsed).toEqual(dto.last_used);
      expect(entity.created).toEqual(dto.created);
      expect(entity.modified).toEqual(dto.modified);
    });

    it("exposes null for a never used, unnamed credential of an unknown authenticator", () => {
      expect.assertions(3);
      const dto = defaultMfaWebauthnCredentialDto({ aaguid: null, name: null, last_used: null });
      const entity = new MfaWebauthnCredentialEntity(dto);
      expect(entity.aaguid).toBeNull();
      expect(entity.name).toBeNull();
      expect(entity.lastUsed).toBeNull();
    });
  });
});
