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
 * @since         3.6.0
 */
window.Validator = require('validator');
window.openpgp = require('openpgp/dist/openpgp');
const textEncoding = require('text-encoding-utf-8');
import {AccountRecoveryOrganizationPolicyEntity} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import {SaveAccountRecoveryOrganizationSettingsScenario} from "./saveAccountRecoveryOrganizationSettingsScenario";
import {PrivateGpgkeyEntity} from "../../model/entity/gpgkey/privateGpgkeyEntity";
import {AccountRecoveryPrivateKeyPasswordsCollection} from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordsCollection";
import {mockedData} from './saveAccountRecoveryOrganizationSettingsScenario.test.data';

global.TextEncoder = textEncoding.TextEncoder;

//This avoids an error to be displayed in the console when the progress manager is starting
jest.mock('../../sdk/i18n', () => ({
  i18n: {
    t: a => a
  }
}));

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
});

describe("SaveAccountRecoveryOrganizationSettings scenarios", () => {
  const mockedProgressService = {
    start: jest.fn(),
    finishStep: jest.fn(),
    close: jest.fn()
  };

  const mockedAccountRecoveryModel = {
    saveOrganizationSettings: jest.fn(),
    findAccountRecoveryPrivateKeyPasswords: jest.fn(() => (
      new AccountRecoveryPrivateKeyPasswordsCollection(mockedData.privateKeyPasswordCollectionDto)
    ))
  };

  const mockedAdministratorPrivateKeyEntity = new PrivateGpgkeyEntity(mockedData.privateKeyDtos.admin);
  const currentPrivateOrk = new PrivateGpgkeyEntity(mockedData.privateKeyDtos.ada);

  const scenario = new SaveAccountRecoveryOrganizationSettingsScenario(mockedProgressService, mockedAccountRecoveryModel);

  it(": the current policy is disabled and the new one is enabled", async() => {
    expect.assertions(5);
    mockedAccountRecoveryModel.saveOrganizationSettings.mockImplementation(accountRecoveryOrganizationPolicyEntity => {
      const dto = accountRecoveryOrganizationPolicyEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
      expect(dto.policy).toEqual(newPolicyEntity.policy);
      expect(dto.account_recovery_organization_public_key.armored_key).toMatch(/^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
      //Keys can't be equal as the key is now signed at this stage
      expect(dto.account_recovery_organization_public_key.armored_key).not.toEqual(newPolicyEntity.armoredKey);
      expect(dto.account_recovery_organization_revoked_key).toBeUndefined();
      expect(dto.account_recovery_private_key_passwords).toBeUndefined();
    });

    const newPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(mockedData.policyDtos.optIn);
    const currentPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(mockedData.policyDtos.disabled);
    await scenario.run(newPolicyEntity, currentPolicyEntity, mockedAdministratorPrivateKeyEntity, null);
  });

  it(": the current policy is enabled and the new one is disabled", async() => {
    expect.assertions(5);
    mockedAccountRecoveryModel.saveOrganizationSettings.mockImplementation(accountRecoveryOrganizationPolicyEntity => {
      const dto = accountRecoveryOrganizationPolicyEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
      expect(dto.policy).toEqual(newPolicyEntity.policy);
      expect(dto.account_recovery_organization_revoked_key.armored_key).toMatch(/^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
      //Keys can't be equal as the key is now revoked at this stage
      expect(dto.account_recovery_organization_revoked_key.armored_key).not.toEqual(newPolicyEntity.armoredKey);
      expect(dto.account_recovery_organization_public_key).toBeUndefined();
      expect(dto.account_recovery_private_key_passwords).toBeUndefined();
    });

    const newPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(mockedData.policyDtos.disabled);
    const currentPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(mockedData.policyDtos.optIn);
    await scenario.run(newPolicyEntity, currentPolicyEntity, mockedAdministratorPrivateKeyEntity, currentPrivateOrk);
  });

  it(": the current policy is enabled and the new one is enabled but the ORK didn't change", async() => {
    expect.assertions(4);
    mockedAccountRecoveryModel.saveOrganizationSettings.mockImplementation(accountRecoveryOrganizationPolicyEntity => {
      const dto = accountRecoveryOrganizationPolicyEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
      expect(dto.policy).toEqual(newPolicyEntity.policy);
      //Keys must be equal as the didn't change in this scenario
      expect(dto.account_recovery_organization_public_key.armored_key).toEqual(newPolicyEntity.armoredKey);
      expect(dto.account_recovery_organization_revoked_key).toBeUndefined();
      expect(dto.account_recovery_private_key_passwords).toBeUndefined();
    });

    const newPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(mockedData.policyDtos.optOut);
    const currentPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(mockedData.policyDtos.optIn);
    await scenario.run(newPolicyEntity, currentPolicyEntity, mockedAdministratorPrivateKeyEntity, currentPrivateOrk);
  });

  it(": the current policy is enabled and the new one is enabled and the ORK changed", async() => {
    expect.assertions(10);
    mockedAccountRecoveryModel.saveOrganizationSettings.mockImplementation(accountRecoveryOrganizationPolicyEntity => {
      const dto = accountRecoveryOrganizationPolicyEntity.toDto(AccountRecoveryOrganizationPolicyEntity.ALL_CONTAIN_OPTIONS);
      expect(dto.policy).toEqual(newPolicyEntity.policy);
      //Keys can't be equal as the key is now revoked at this stage
      expect(dto.account_recovery_organization_revoked_key.armored_key).toMatch(/^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
      expect(dto.account_recovery_organization_revoked_key.armored_key).not.toEqual(newPolicyEntity.armoredKey);
      //Keys can't be equal as the key is now signed at this stage
      expect(dto.account_recovery_organization_public_key.armored_key).toMatch(/^-----BEGIN PGP PUBLIC KEY BLOCK-----/);
      expect(dto.account_recovery_organization_public_key.armored_key).not.toEqual(newPolicyEntity.armoredKey);
      expect(dto.account_recovery_private_key_passwords).toBeDefined();
    });

    const newPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(mockedData.policyDtos.optOutWithAnotherORK);
    const currentPolicyEntity = new AccountRecoveryOrganizationPolicyEntity(mockedData.policyDtos.optIn);
    await scenario.run(newPolicyEntity, currentPolicyEntity, mockedAdministratorPrivateKeyEntity, currentPrivateOrk);

    expect(mockedAccountRecoveryModel.findAccountRecoveryPrivateKeyPasswords).toHaveBeenCalledTimes(1);
    expect(mockedProgressService.start).toHaveBeenCalledTimes(1);
    expect(mockedProgressService.finishStep).toHaveBeenCalledTimes(mockedData.privateKeyPasswordCollectionDto.length);
    expect(mockedProgressService.close).toHaveBeenCalledTimes(1);
  });
});
