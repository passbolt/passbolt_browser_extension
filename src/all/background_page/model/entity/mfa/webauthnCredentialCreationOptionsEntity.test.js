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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import WebauthnCredentialCreationOptionsEntity from "./webauthnCredentialCreationOptionsEntity";
import { defaultWebauthnCredentialCreationOptionsDto } from "./webauthnCredentialCreationOptionsEntity.test.data";

describe("WebauthnCredentialCreationOptionsEntity", () => {
  describe("WebauthnCredentialCreationOptionsEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(
        WebauthnCredentialCreationOptionsEntity.name,
        WebauthnCredentialCreationOptionsEntity.getSchema(),
      );
    });

    it("validates rp property", () => {
      assertEntityProperty.required(WebauthnCredentialCreationOptionsEntity, "rp");
    });

    it("validates user property", () => {
      assertEntityProperty.required(WebauthnCredentialCreationOptionsEntity, "user");
    });

    it("validates challenge property", () => {
      assertEntityProperty.string(WebauthnCredentialCreationOptionsEntity, "challenge");
      assertEntityProperty.minLength(WebauthnCredentialCreationOptionsEntity, "challenge", 1);
      assertEntityProperty.required(WebauthnCredentialCreationOptionsEntity, "challenge");
    });

    it("validates pubKeyCredParams property", () => {
      assertEntityProperty.array(WebauthnCredentialCreationOptionsEntity, "pubKeyCredParams");
      assertEntityProperty.required(WebauthnCredentialCreationOptionsEntity, "pubKeyCredParams");
    });

    it("validates timeout property", () => {
      assertEntityProperty.integer(WebauthnCredentialCreationOptionsEntity, "timeout");
      assertEntityProperty.notRequired(WebauthnCredentialCreationOptionsEntity, "timeout");
    });

    it("validates attestation property", () => {
      assertEntityProperty.enumeration(WebauthnCredentialCreationOptionsEntity, "attestation", ["none"], ["direct"]);
      assertEntityProperty.required(WebauthnCredentialCreationOptionsEntity, "attestation");
    });
  });

  describe("WebauthnCredentialCreationOptionsEntity::constructor", () => {
    it("works if valid DTO is provided", () => {
      expect.assertions(4);
      const dto = defaultWebauthnCredentialCreationOptionsDto();
      const entity = new WebauthnCredentialCreationOptionsEntity(dto);
      expect(entity.toDto()).toEqual(dto);
      expect(entity.rp).toEqual(dto.rp);
      expect(entity.user).toEqual(dto.user);
      expect(entity.pubKeyCredParams).toEqual(dto.pubKeyCredParams);
    });

    it.each([
      ["rp", "id"],
      ["rp", "name"],
      ["user", "id"],
      ["user", "name"],
      ["user", "displayName"],
    ])("throws if %s.%s is not a non empty string", (prop, field) => {
      expect.assertions(2);
      const dto = defaultWebauthnCredentialCreationOptionsDto();
      dto[prop][field] = "";
      try {
        new WebauthnCredentialCreationOptionsEntity(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError(`${prop}.${field}`, "required")).toBe(true);
      }
    });

    it.each([
      [[]],
      [[{ type: "password", alg: -7 }]],
      [[{ type: "public-key", alg: -8 }]],
      [
        [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -8 },
        ],
      ],
    ])("throws on unsupported public key credential parameters %j", (pubKeyCredParams) => {
      expect.assertions(2);
      try {
        new WebauthnCredentialCreationOptionsEntity(defaultWebauthnCredentialCreationOptionsDto({ pubKeyCredParams }));
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError("pubKeyCredParams", "unsupported_alg")).toBe(true);
      }
    });

    it("throws if user.id is not base64url", () => {
      expect.assertions(2);
      const user = { ...defaultWebauthnCredentialCreationOptionsDto().user, id: "%%%" };
      try {
        new WebauthnCredentialCreationOptionsEntity(defaultWebauthnCredentialCreationOptionsDto({ user }));
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError("user.id", "base64url")).toBe(true);
      }
    });

    it("throws if the challenge is not base64url", () => {
      expect.assertions(2);
      try {
        new WebauthnCredentialCreationOptionsEntity(defaultWebauthnCredentialCreationOptionsDto({ challenge: "%%%" }));
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError("challenge", "base64url")).toBe(true);
      }
    });

    it("throws if the challenge is shorter than 16 bytes", () => {
      expect.assertions(2);
      const challenge = "dGhpcy1pcy1zaG9ydA";
      try {
        new WebauthnCredentialCreationOptionsEntity(defaultWebauthnCredentialCreationOptionsDto({ challenge }));
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError("challenge", "min_bytes")).toBe(true);
      }
    });
  });

  describe("WebauthnCredentialCreationOptionsEntity::decodeBase64Url", () => {
    it("decodes a base64url string without padding", () => {
      expect.assertions(1);
      expect(WebauthnCredentialCreationOptionsEntity.decodeBase64Url("YWRhLT4_Xz4")).toBe("ada->?_>");
    });

    it("throws when the string is not decodable", () => {
      expect.assertions(1);
      expect(() => WebauthnCredentialCreationOptionsEntity.decodeBase64Url("%%%")).toThrow(DOMException);
    });
  });
});
