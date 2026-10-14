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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import WebauthnRegistrationResponseEntity from "./webauthnRegistrationResponseEntity";
import { defaultWebauthnRegistrationResponseDto } from "./webauthnRegistrationResponseEntity.test.data";

describe("WebauthnRegistrationResponseEntity", () => {
  describe("WebauthnRegistrationResponseEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(
        WebauthnRegistrationResponseEntity.name,
        WebauthnRegistrationResponseEntity.getSchema(),
      );
    });

    it("validates id property", () => {
      assertEntityProperty.string(WebauthnRegistrationResponseEntity, "id");
      assertEntityProperty.minLength(WebauthnRegistrationResponseEntity, "id", 1);
      assertEntityProperty.required(WebauthnRegistrationResponseEntity, "id");
    });

    it("validates rawId property", () => {
      assertEntityProperty.string(WebauthnRegistrationResponseEntity, "rawId");
      assertEntityProperty.required(WebauthnRegistrationResponseEntity, "rawId");
    });

    it("validates type property", () => {
      assertEntityProperty.enumeration(WebauthnRegistrationResponseEntity, "type", ["public-key"], ["password"]);
      assertEntityProperty.required(WebauthnRegistrationResponseEntity, "type");
    });

    it("validates response property", () => {
      assertEntityProperty.required(WebauthnRegistrationResponseEntity, "response");
    });

    it("validates authenticatorAttachment property", () => {
      assertEntityProperty.string(WebauthnRegistrationResponseEntity, "authenticatorAttachment");
      assertEntityProperty.nullable(WebauthnRegistrationResponseEntity, "authenticatorAttachment");
      assertEntityProperty.notRequired(WebauthnRegistrationResponseEntity, "authenticatorAttachment");
    });
  });

  describe("WebauthnRegistrationResponseEntity::constructor", () => {
    it("works if valid DTO is provided", () => {
      expect.assertions(1);
      const dto = defaultWebauthnRegistrationResponseDto();
      const entity = new WebauthnRegistrationResponseEntity(dto);
      expect(entity.toDto()).toEqual(dto);
    });

    it.each(["clientDataJSON", "attestationObject"])("throws if response.%s is missing", (field) => {
      expect.assertions(2);
      const dto = defaultWebauthnRegistrationResponseDto();
      delete dto.response[field];
      try {
        new WebauthnRegistrationResponseEntity(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError(`response.${field}`, "required")).toBe(true);
      }
    });

    it("throws if response.clientDataJSON is empty", () => {
      expect.assertions(1);
      const dto = defaultWebauthnRegistrationResponseDto();
      dto.response.clientDataJSON = "";
      expect(() => new WebauthnRegistrationResponseEntity(dto)).toThrow(EntityValidationError);
    });
  });
});
