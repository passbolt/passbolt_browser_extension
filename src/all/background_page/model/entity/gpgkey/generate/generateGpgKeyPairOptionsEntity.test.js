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
 * @since         3.6.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";
import OrganizationSettingsModel from "../../../organizationSettings/organizationSettingsModel";
import OrganizationSettingsEntity from "../../organizationSettings/organizationSettingsEntity";
import {
  customEmailValidationProOrganizationSettings
} from "../../organizationSettings/organizationSettingsEntity.test.data";
import GenerateGpgKeyPairOptionsEntity from "./generateGpgKeyPairOptionsEntity";
import {defaultDto, minimalDto} from "./generateGpgKeyPairOptionsEntity.test.data";
import {defaultUserKeyPoliciesSettingsDto, rsaUserKeyPoliciesSettingsDto} from "passbolt-styleguide/src/shared/models/entity/userKeyPolicies/UserKeyPoliciesSettingsEntity.test.data";
import UserKeyPoliciesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/userKeyPolicies/UserKeyPoliciesSettingsEntity";

beforeEach(() => {
  jest.useFakeTimers(); //avoid slight nano seconds shift in test when comparing dates that makes test failing while they shouldn't
});

describe("GenerateGpgKeyPairOptionsEntity", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(GenerateGpgKeyPairOptionsEntity.ENTITY_NAME, GenerateGpgKeyPairOptionsEntity.getSchema());
    });

    it("validates name property", () => {
      assertEntityProperty.string(GenerateGpgKeyPairOptionsEntity, "name");
      assertEntityProperty.required(GenerateGpgKeyPairOptionsEntity, "name");
    });

    it("validates email property", () => {
      assertEntityProperty.string(GenerateGpgKeyPairOptionsEntity, "email");
      assertEntityProperty.required(GenerateGpgKeyPairOptionsEntity, "email");
    });

    it("validates passphrase property", () => {
      assertEntityProperty.string(GenerateGpgKeyPairOptionsEntity, "passphrase");
      assertEntityProperty.required(GenerateGpgKeyPairOptionsEntity, "passphrase");
    });

    it("validates type property", () => {
      assertEntityProperty.string(GenerateGpgKeyPairOptionsEntity, "type");
      assertEntityProperty.enumeration(
        GenerateGpgKeyPairOptionsEntity,
        "type",
        [
          GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA,
          GenerateGpgKeyPairOptionsEntity.KEY_TYPE_ECC,
        ]
      );
    });

    it("validates keySize property", () => {
      assertEntityProperty.integer(GenerateGpgKeyPairOptionsEntity, "keySize");
      assertEntityProperty.notRequired(GenerateGpgKeyPairOptionsEntity, "keySize");
    });

    it("validates curve property", () => {
      assertEntityProperty.string(GenerateGpgKeyPairOptionsEntity, "curve");
      assertEntityProperty.enumeration(GenerateGpgKeyPairOptionsEntity, "curve", [GenerateGpgKeyPairOptionsEntity.KEY_CURVE_ED25519]);
      assertEntityProperty.notRequired(GenerateGpgKeyPairOptionsEntity, "curve");
    });
  });

  describe("::constructor", () => {
    it("works with minimal DTO", () => {
      expect.assertions(1);
      const dto = minimalDto();
      const entity = new GenerateGpgKeyPairOptionsEntity(dto);
      expect(entity.toDto()).toStrictEqual({
        ...dto,
        type: GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA,
        keySize: GenerateGpgKeyPairOptionsEntity.DEFAULT_RSA_KEY_SIZE,
      });
    });

    it("works with full valid DTO", () => {
      expect.assertions(1);
      const dto = defaultDto();
      const entity = new GenerateGpgKeyPairOptionsEntity(dto);
      expect(entity.toDto()).toStrictEqual(dto);
    });

    it("throws validation errors with an invalid DTO", () => {
      expect.assertions(7);
      try {
        const dto = {
          name: "", // invalid min length
          email: "@passbolt.com", // invalid email
          passphrase: "1234567", // minLength = 8
          keySize: "super strong key size", // not integer
          type: "RSB", // not in enum
        };
        new GenerateGpgKeyPairOptionsEntity(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect(error.hasError("name", "minLength")).toBe(true);
        expect(error.hasError("email", "custom")).toBe(true);
        expect(error.hasError("passphrase", "minLength")).toBe(true);
        expect(error.hasError("keySize", "type")).toBe(true);
        expect(error.hasError("type", "enum")).toBe(true);
        expect(error.hasError("curve", "enum")).toBe(false);
      }
    });

    it("throws validation error if the type is 'rsa' and the curve is set", () => {
      expect.assertions(1);
      const dto = defaultDto({
        type: GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA,
        curve: GenerateGpgKeyPairOptionsEntity.KEY_CURVE_ED25519,
      });

      const expectedError = new EntityValidationError();
      expectedError.addError("curve", "unwanted_curve", "The curve should not be set when the type is set to 'rsa'");
      expect(() => new GenerateGpgKeyPairOptionsEntity(dto)).toThrow(expectedError);
    });

    it("throws validation error if the type is 'ecc' and the keySize is set", () => {
      expect.assertions(1);
      const dto = defaultDto({
        type: GenerateGpgKeyPairOptionsEntity.KEY_TYPE_ECC,
        keySize: GenerateGpgKeyPairOptionsEntity.DEFAULT_RSA_KEY_SIZE,
      });

      const expectedError = new EntityValidationError();
      expectedError.addError("keySize", "unwanted_keySize", "The keySize should not be set with the type is set to 'ecc'");
      expect(() => new GenerateGpgKeyPairOptionsEntity(dto)).toThrow(expectedError);
    });

    it("allows non-standard email if custom validation is configured", () => {
      expect.assertions(1);
      const organizationSettings = customEmailValidationProOrganizationSettings();
      OrganizationSettingsModel.set(new OrganizationSettingsEntity(organizationSettings));
      const dto = defaultDto({email: "ada@passbolt.c"});
      const entity = new GenerateGpgKeyPairOptionsEntity(dto);
      expect(entity.email).toEqual("ada@passbolt.c");
    });
  });

  describe("::createForUserKeyGeneration", () => {
    it("creates ECC entity when api type is eddsa", () => {
      expect.assertions(3);
      const dto = minimalDto();
      const userKeyPolicies = new UserKeyPoliciesSettingsEntity(defaultUserKeyPoliciesSettingsDto());
      const entity = GenerateGpgKeyPairOptionsEntity.createForUserKeyGeneration(userKeyPolicies, dto);

      expect(entity.type).toBe(GenerateGpgKeyPairOptionsEntity.KEY_TYPE_ECC);
      expect(entity.curve).toBe(GenerateGpgKeyPairOptionsEntity.DEFAULT_ECC_KEY_CURVE);
      expect(entity.rsaBits).toBeNull();
    });

    it("creates RSA entity when api type is rsa (default)", () => {
      expect.assertions(3);
      const dto = minimalDto();
      const userKeyPolicies = new UserKeyPoliciesSettingsEntity(rsaUserKeyPoliciesSettingsDto());
      const entity = GenerateGpgKeyPairOptionsEntity.createForUserKeyGeneration(userKeyPolicies, dto);

      expect(entity.type).toBe(GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA);
      expect(entity.rsaBits).toBe(userKeyPolicies.preferredKeySize);
      expect(entity.curve).toBeNull();
    });
  });

  describe("::createForOrkKeyGeneration", () => {
    it("creates RSA entity with 4096 bits", () => {
      expect.assertions(2);
      const dto = minimalDto();
      const entity = GenerateGpgKeyPairOptionsEntity.createForOrkKeyGeneration(dto);
      expect(entity.type).toBe(GenerateGpgKeyPairOptionsEntity.KEY_TYPE_RSA);
      expect(entity.rsaBits).toBe(4096);
    });
  });

  describe("dynamic getters", () => {
    const dto = defaultDto();
    const entity = new GenerateGpgKeyPairOptionsEntity(dto);

    it("::userId returns {name, email}", () => {
      expect.assertions(1);
      expect(entity.userId).toStrictEqual({name: dto.name, email: dto.email});
    });

    it("::name returns name", () => {
      expect.assertions(1);
      expect(entity.name).toBe(dto.name);
    });

    it("::email returns email", () => {
      expect.assertions(1);
      expect(entity.email).toBe(dto.email);
    });

    it("::rsaBits returns keySize", () => {
      expect.assertions(1);
      expect(entity.rsaBits).toBe(dto.keySize);
    });

    it("::date returns provided date if set", () => {
      expect.assertions(1);
      const now = Date.now();
      const e = new GenerateGpgKeyPairOptionsEntity(defaultDto({date: now}));
      expect(e.date.getTime()).toBe(now);
    });

    it("::toGenerateOpenpgpKeyDto returns formatted dto with rsa key", () => {
      expect.assertions(1);
      const dto = minimalDto();
      const e = new GenerateGpgKeyPairOptionsEntity(dto);
      const result = e.toGenerateOpenpgpKeyDto();

      expect(result).toStrictEqual({
        userIDs: [{name: dto.name, email: dto.email}],
        rsaBits: e.rsaBits,
        passphrase: dto.passphrase,
        type: e.type,
        date: e.date,
      });
    });

    it("::toGenerateOpenpgpKeyDto returns formatted dto with ecc key", () => {
      expect.assertions(1);
      const dto = minimalDto({
        type: "ecc",
      });
      const e = new GenerateGpgKeyPairOptionsEntity(dto);
      const result = e.toGenerateOpenpgpKeyDto();

      expect(result).toStrictEqual({
        userIDs: [{name: dto.name, email: dto.email}],
        curve: "ed25519",
        passphrase: dto.passphrase,
        type: e.type,
        date: e.date,
      });
    });
  });
});
