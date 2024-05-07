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

import each from "jest-each";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import AccountRecoveryOrganizationPolicyEntity from "./accountRecoveryOrganizationPolicyEntity";
import {
  createDisabledAccountRecoveryOrganizationPolicyDto,
  createDisabledPreviouslyEnabledAccountRecoveryOrganizationPolicyDto,
  createEnabledAccountRecoveryOrganizationPolicyDto,
  createRotateKeyAccountRecoveryOrganizationPolicyDto,
  disabledAccountRecoveryOrganizationPolicyDto,
  disabledPreviouslyEnabledAccountRecoveryOrganizationPolicyDto,
  enabledAccountRecoveryOrganizationPolicyDto, rotateKeyAccountRecoveryOrganizationPolicyDto
} from "./accountRecoveryOrganizationPolicyEntity.test.data";
import {users} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import * as assertEntityProperty from "passbolt-styleguide/test/assert/assertEntityProperty";

describe("AccountRecoveryOrganizationPolicy entity", () => {
  describe("AccountRecoveryOrganizationPolicyEntity::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(AccountRecoveryOrganizationPolicyEntity.ENTITY_NAME, AccountRecoveryOrganizationPolicyEntity.getSchema());
    });

    it("validates id property", () => {
      assertEntityProperty.string(AccountRecoveryOrganizationPolicyEntity, "id");
      assertEntityProperty.uuid(AccountRecoveryOrganizationPolicyEntity, "id");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPolicyEntity, "id");
    });

    it("validates policy property", () => {
      const expectedValues = [
        "disabled",
        "mandatory",
        "opt-in",
        "opt-out"
      ];
      const unexpectedValues = ["1", "false", "test"];
      assertEntityProperty.enumeration(AccountRecoveryOrganizationPolicyEntity, "policy", expectedValues, unexpectedValues);
      assertEntityProperty.required(AccountRecoveryOrganizationPolicyEntity, "policy");
    });

    it("validates public_key_id property", () => {
      const uuidSuccessScenarios = [assertEntityProperty.SCENARIO_UUID];
      const uuidFailingScenarios = [assertEntityProperty.SCENARIO_STRING];
      assertEntityProperty.assert(AccountRecoveryOrganizationPolicyEntity, "public_key_id", uuidSuccessScenarios, uuidFailingScenarios, "type");

      assertEntityProperty.nullable(AccountRecoveryOrganizationPolicyEntity, "public_key_id");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPolicyEntity, "public_key_id");
    });

    it("validates created property", () => {
      assertEntityProperty.string(AccountRecoveryOrganizationPolicyEntity, "created");
      assertEntityProperty.dateTime(AccountRecoveryOrganizationPolicyEntity, "created");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPolicyEntity, "created");
    });

    it("validates modified property", () => {
      assertEntityProperty.string(AccountRecoveryOrganizationPolicyEntity, "modified");
      assertEntityProperty.dateTime(AccountRecoveryOrganizationPolicyEntity, "modified");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPolicyEntity, "modified");
    });

    it("validates created_by property", () => {
      assertEntityProperty.uuid(AccountRecoveryOrganizationPolicyEntity, "created_by");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPolicyEntity, "created_by");
    });

    it("validates modified_by property", () => {
      assertEntityProperty.uuid(AccountRecoveryOrganizationPolicyEntity, "modified_by");
      assertEntityProperty.notRequired(AccountRecoveryOrganizationPolicyEntity, "modified_by");
    });
  });

  each([
    {scenario: "Create disabled policy", dto: createDisabledAccountRecoveryOrganizationPolicyDto()},
    {scenario: "Read disabled policy", dto: disabledAccountRecoveryOrganizationPolicyDto()},
    {scenario: "Create enabled policy", dto: createEnabledAccountRecoveryOrganizationPolicyDto()},
    {scenario: "Read enabled policy", dto: enabledAccountRecoveryOrganizationPolicyDto()},
    {scenario: "Create disabled policy previously enabled", dto: createDisabledPreviouslyEnabledAccountRecoveryOrganizationPolicyDto()},
    {scenario: "Read disabled policy previously enabled", dto: disabledPreviouslyEnabledAccountRecoveryOrganizationPolicyDto()},
    {scenario: "Create rotate key policy", dto: createRotateKeyAccountRecoveryOrganizationPolicyDto()},
    {scenario: "Read rotate key policy", dto: rotateKeyAccountRecoveryOrganizationPolicyDto()},
  ]).describe("constructor works with data", _props => {
    it(`it supports scenario ${_props.scenario}`, () => {
      expect.assertions(1);
      let entity;

      try {
        entity = new AccountRecoveryOrganizationPolicyEntity(_props.dto);
      } catch (error) {
        expect(error.details).toBe({});
      }
      expect(entity.toJSON()).toEqual(_props.dto);
    });
  });

  describe("AccountRecoveryOrganizationPolicy assertValidCreatorGpgkey", () => {
    it("should not validate the entity if creator is missing", async() => {
      const dto = disabledAccountRecoveryOrganizationPolicyDto({creator: null});
      const entity = new AccountRecoveryOrganizationPolicyEntity(dto);
      expect.assertions(1);
      try {
        await AccountRecoveryOrganizationPolicyEntity.assertValidCreatorGpgkey(entity);
      } catch (e) {
        expect(e).toStrictEqual(new EntityValidationError('AccountRecoveryOrganizationPolicyEntity assertValidCreatorGpgkey expects a creator to be defined.'));
      }
    });

    it("should not validate the entity if gpgkey is missing", async() => {
      const dto = disabledAccountRecoveryOrganizationPolicyDto();
      delete dto.creator.gpgkey;
      const entity = new AccountRecoveryOrganizationPolicyEntity(dto);
      expect.assertions(1);
      try {
        await AccountRecoveryOrganizationPolicyEntity.assertValidCreatorGpgkey(entity);
      } catch (e) {
        expect(e).toStrictEqual(new EntityValidationError('AccountRecoveryOrganizationPolicyEntity assertValidCreatorGpgkey expects a creator.gpgkey to be defined.'));
      }
    });

    it("should not validate the entity if creator id and gpgkey.user_id are not matching", async() => {
      const dto = disabledAccountRecoveryOrganizationPolicyDto();
      dto.creator.id = users.ada.id;
      dto.creator.gpgkey.user_id = users.admin.id;
      const entity = new AccountRecoveryOrganizationPolicyEntity(dto);
      expect.assertions(1);
      try {
        await AccountRecoveryOrganizationPolicyEntity.assertValidCreatorGpgkey(entity);
      } catch (e) {
        expect(e).toStrictEqual(new EntityValidationError("AccountRecoveryOrganizationPolicyEntity assertValidCreatorGpgkey expects the creator's id to match the gpgkey.user_id."));
      }
    });

    it("should not validate the entity if fingerprint is not matching the gpgkey fingerprint", async() => {
      const dto = disabledAccountRecoveryOrganizationPolicyDto();
      dto.creator.gpgkey.fingerprint = pgpKeys.account_recovery_organization.fingerprint;
      dto.creator.gpgkey.armored_key = pgpKeys.ada.public;
      const entity = new AccountRecoveryOrganizationPolicyEntity(dto);
      expect.assertions(1);
      try {
        await AccountRecoveryOrganizationPolicyEntity.assertValidCreatorGpgkey(entity);
      } catch (e) {
        expect(e).toStrictEqual(new EntityValidationError("AccountRecoveryOrganizationPolicyEntity assertValidCreatorGpgkey expects the gpgkey armoredKey's fingerprint to match the given fingerprint."));
      }
    });

    it("should validate the entity if user_ids are mathching and if fingerprints are matching", async() => {
      const dto = disabledAccountRecoveryOrganizationPolicyDto();
      const entity = new AccountRecoveryOrganizationPolicyEntity(dto);
      expect.assertions(1);
      const promise = AccountRecoveryOrganizationPolicyEntity.assertValidCreatorGpgkey(entity);
      await expect(promise).resolves.toBeUndefined();
    });
  });
});
