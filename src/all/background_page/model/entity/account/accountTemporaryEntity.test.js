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
 * @since         4.7.0
 */

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import {defaultUserPassphrasePoliciesDto} from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity.test.data";
import AccountTemporaryEntity from "./accountTemporaryEntity";
import {
  temporaryAccountRecoveryAccountDto,
  temporaryRecoverAccountDto,
  temporarySetupAccountDto
} from "./accountTemporaryEntity.test.data";
import {
  enabledAccountRecoveryOrganizationPolicyDto
} from "../accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";

describe("AccountTemporaryEntity", () => {
  describe("AccountTemporaryEntity:constructor", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(AccountTemporaryEntity.ENTITY_NAME, AccountTemporaryEntity.getSchema());
    });

    it("it should instantiate the entity with a minimal dto (setup account)", () => {
      expect.assertions(1);
      const dto = temporarySetupAccountDto();
      const entity = new AccountTemporaryEntity(dto);
      expect(entity).toBeInstanceOf(AccountTemporaryEntity);
    });

    it("it should instantiate the entity with a minimal dto (recover account)", () => {
      expect.assertions(1);
      const dto = temporaryRecoverAccountDto();
      const entity = new AccountTemporaryEntity(dto);
      expect(entity).toBeInstanceOf(AccountTemporaryEntity);
    });

    it("it should instantiate the entity with a minimal dto (account recovery account)", () => {
      expect.assertions(1);
      const dto = temporaryAccountRecoveryAccountDto();
      const entity = new AccountTemporaryEntity(dto);
      expect(entity).toBeInstanceOf(AccountTemporaryEntity);
    });

    it("it should raise an error if the account type is unkonwn (account recovery account)", () => {
      expect.assertions(1);
      const dto = temporarySetupAccountDto({account: {type: "unknown"}});
      try {
        new AccountTemporaryEntity(dto);
      } catch (error) {
        expect(error.message).toStrictEqual("The account should have a known type.");
      }
    });
  });

  describe("AccountTemporaryEntity:toDto", () => {
    it("should return the expected properties.", () => {
      expect.assertions(1);

      const dto = temporarySetupAccountDto();
      const entity = new AccountTemporaryEntity(dto);
      const resultDto = entity.toDto();
      expect(Object.keys(resultDto).length).toBe(0);
    });

    it("it should return the account and account recovery organization policy if requested", () => {
      expect.assertions(2);
      const expectedKeys = [
        'account',
        'account_recovery_organization_policy'
      ];

      const dto = temporarySetupAccountDto({account_recovery_organization_policy: enabledAccountRecoveryOrganizationPolicyDto()});
      const entity = new AccountTemporaryEntity(dto);
      const resultDto = entity.toDto({account: true, account_recovery_organization_policy: true});
      const keys = Object.keys(resultDto);
      expect(Object.keys(resultDto).length).toBe(2);
      expect(keys).toEqual(expectedKeys);
    });

    it("it should return all the options if requested", () => {
      expect.assertions(2);
      const expectedKeys = [
        'account',
        'passphrase',
        'worker_id',
        'user_passphrase_policies',
      ];

      const dto = temporaryRecoverAccountDto({passphrase: "passphrase", user_passphrase_policies: defaultUserPassphrasePoliciesDto()});
      const entity = new AccountTemporaryEntity(dto);
      const resultDto = entity.toDto(AccountTemporaryEntity.ALL_CONTAIN_OPTIONS);
      const keys = Object.keys(resultDto);
      expect(Object.keys(resultDto).length).toBe(4);
      expect(keys).toEqual(expectedKeys);
    });

    it("it should return the account and passphrase if requested", () => {
      expect.assertions(2);
      const expectedKeys = [
        'account',
        'passphrase'
      ];

      const dto = temporarySetupAccountDto({passphrase: "passphrase"});
      const entity = new AccountTemporaryEntity(dto);
      const resultDto = entity.toDto({account: true, passphrase: true});
      const keys = Object.keys(resultDto);
      expect(Object.keys(resultDto).length).toBe(2);
      expect(keys).toEqual(expectedKeys);
    });

    it("it should return all options if requested", () => {
      expect.assertions(2);
      const expectedKeys = [
        'account',
        'passphrase',
        'worker_id',
      ];

      const dto = temporarySetupAccountDto({passphrase: "passphrase"});
      const entity = new AccountTemporaryEntity(dto);
      const resultDto = entity.toDto(AccountTemporaryEntity.ALL_CONTAIN_OPTIONS);
      const keys = Object.keys(resultDto);
      expect(Object.keys(resultDto).length).toBe(3);
      expect(keys).toEqual(expectedKeys);
    });
  });
});
