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
 * @since         4.9.3
 */

import {
  plaintextSecretPasswordAndDescriptionDto,
  plaintextSecretPasswordAndDescriptionSchema,
  plaintextSecretPasswordDescriptionAndTotpSchema,
  plaintextSecretPasswordDescriptionTotpDto,
  plaintextSecretPasswordStringDto,
  plaintextSecretStandaloneTotpSchema,
  plaintextSecretStringSchema,
  plaintextSecretTotpDto,
} from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import PlaintextEntity from "./plaintextEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("PlaintextEntity", () => {
  describe("::getSchema", () => {
    it("should throw an error", () => {
      expect.assertions(1);

      expect(() => PlaintextEntity.getSchema()).toThrow(
        "Plaintext only support dynamic schemas, defined from resource type.",
      );
    });
  });

  describe("::constructor", () => {
    it("constructor should validate the data based on the given schema: legacy password", () => {
      expect.assertions(1);

      const dto = plaintextSecretPasswordStringDto();
      const schema = plaintextSecretStringSchema();
      const entity = new PlaintextEntity(dto, { schema });

      expect(entity.toDto()).toStrictEqual(dto);
    });

    it("constructor should validate the data based on the given schema: password and description", () => {
      expect.assertions(1);

      const dto = plaintextSecretPasswordAndDescriptionDto();
      const schema = plaintextSecretPasswordAndDescriptionSchema();
      const entity = new PlaintextEntity(dto, { schema });

      expect(entity.toDto()).toStrictEqual(dto);
    });

    it("constructor should validate the data based on the given schema: password, description and TOTP", () => {
      expect.assertions(1);

      const dto = plaintextSecretPasswordDescriptionTotpDto();
      const schema = plaintextSecretPasswordDescriptionAndTotpSchema();
      const entity = new PlaintextEntity(dto, { schema });

      expect(entity.toDto()).toStrictEqual(dto);
    });

    it("constructor should validate the data based on the given schema: standalone TOTP", () => {
      expect.assertions(1);

      const dto = plaintextSecretTotpDto();
      const schema = plaintextSecretStandaloneTotpSchema();
      const entity = new PlaintextEntity(dto, { schema });

      expect(entity.toDto()).toStrictEqual(dto);
    });

    it("constructor should throw an error if the data does not validate the given schema", () => {
      expect.assertions(1);

      const dto = plaintextSecretTotpDto({ totp: "test" });
      const schema = plaintextSecretStandaloneTotpSchema();

      expect(() => new PlaintextEntity(dto, { schema })).toThrow(EntityValidationError);
    });

    it("constructor should not validate if the options state not to validate the data", () => {
      expect.assertions(1);

      const dto = plaintextSecretTotpDto({ totp: "test" });
      const schema = plaintextSecretStandaloneTotpSchema();

      expect(() => new PlaintextEntity(dto, { schema: schema, validate: false })).not.toThrow();
    });
  });

  describe("::createFromLegacyPlaintextSecret", () => {
    it("should build a PlaintextEntity in a legacy version", () => {
      expect.assertions(1);

      const dto = plaintextSecretPasswordStringDto();
      const entity = PlaintextEntity.createFromLegacyPlaintextSecret(dto.password);

      expect(entity.toDto()).toStrictEqual(dto);
    });
  });

  describe("::getters", () => {
    it("should return the expected value set", () => {
      expect.assertions(3);

      const dto = plaintextSecretPasswordDescriptionTotpDto();
      const schema = plaintextSecretPasswordDescriptionAndTotpSchema();
      const entity = new PlaintextEntity(dto, { schema });

      expect(entity.password).toStrictEqual(dto.password);
      expect(entity.description).toStrictEqual(dto.description);
      expect(entity.totp).toStrictEqual(dto.totp);
    });

    it("should return the expected pin code value", () => {
      expect.assertions(1);

      const dto = { object_type: "PASSBOLT_SECRET_DATA", pin_code: "1234" };
      const schema = {
        type: "object",
        required: ["pin_code", "object_type"],
        properties: {
          object_type: {
            type: "string",
            enum: ["PASSBOLT_SECRET_DATA"],
          },
          pin_code: {
            type: "string",
            minLength: 4,
            maxLength: 12,
            pattern: "^\\d+$",
          },
          description: {
            type: "string",
            maxLength: 50000,
            nullable: true,
          },
        },
      };
      const entity = new PlaintextEntity(dto, { schema });

      expect(entity.pinCode).toStrictEqual("1234");
    });

    it("should return null if the data does not exist", () => {
      expect.assertions(4);

      const dto = { test: "test" };
      const schema = {
        type: "object",
        required: [],
        properties: {
          test: {
            type: "string",
          },
        },
      };
      const entity = new PlaintextEntity(dto, { schema });

      expect(entity.password).toBeNull();
      expect(entity.description).toBeNull();
      expect(entity.totp).toBeNull();
      expect(entity.pinCode).toBeNull();
    });
  });
});
