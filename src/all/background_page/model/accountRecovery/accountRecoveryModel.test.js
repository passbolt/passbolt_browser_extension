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
 * @since         3.4.0
 */

const openpgp = require('openpgp/dist/openpgp');
const textEncoding = require('text-encoding-utf-8');
import Validator from 'validator';
import {ApiClientOptions} from '../../service/api/apiClient/apiClientOptions';
import {GpgKeyInfoService} from '../../service/crypto/gpgKeyInfoService';
import {AccountRecoveryOrganizationPolicyEntity} from '../entity/accountRecovery/accountRecoveryOrganizationPolicyEntity';
import {AccountRecoveryOrganizationPublicKeyEntity} from '../entity/accountRecovery/accountRecoveryOrganizationPublicKeyEntity';
import {PrivateGpgkeyEntity} from '../entity/gpgkey/privateGpgkeyEntity';
import {AccountRecoveryModel} from "./accountRecoveryModel";
import {AccountRecoveryUserSettingEntity} from '../entity/accountRecovery/accountRecoveryUserSettingEntity';
import {AccountRecoveryPrivateKeyEntity} from '../entity/accountRecovery/accountRecoveryPrivateKeyEntity';
import {AccountRecoveryPrivateKeyPasswordsCollection} from '../entity/accountRecovery/accountRecoveryPrivateKeyPasswordsCollection';
import keys from './accountRecoveryModel.test.data';

global.TextEncoder = textEncoding.TextEncoder;

jest.mock("../../service/api/accountRecovery/accountRecoveryOrganizationPolicyService", () => ({
  AccountRecoveryOrganizationPolicyService: jest.fn().mockImplementation(() => ({
    saveOrganizationSettings: jest.fn(object => object),
  }))
}));

jest.mock("../../service/api/accountRecovery/accountRecoveryRequestService", () => ({
  AccountRecoveryRequestService: jest.fn().mockImplementation(() => {})
}));

jest.mock("../../service/api/accountRecovery/accountRecoveryResponseService", () => ({
  AccountRecoveryResponseService: jest.fn().mockImplementation(() => {})
}));

const mockedSaveUserSetting = jest.fn();
jest.mock("../../service/api/accountRecovery/accountRecoveryUserService", () => ({
  AccountRecoveryUserService: jest.fn().mockImplementation(() => ({
    saveUserSetting: mockedSaveUserSetting
  }))
}));

const mockAdminPrivateKey = keys.adminPrivateKey;
jest.mock('../keyring', () => ({
  Keyring: jest.fn().mockImplementation(() => ({
    findPrivate: jest.fn(() => ({
      key: mockAdminPrivateKey
    }))
  }))
}));

const keyExistsInList = (keys, keyId) => {
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].keyId === keyId) {
      return true;
    }
  }
  return false;
};

const apiClientOptions = (new ApiClientOptions()).setBaseUrl('https://test.passbolt.test/');

// Reset the modules before each test.
beforeEach(() => {
  window.openpgp = openpgp;
  window.Validator = Validator;
  jest.resetModules();
});

describe("AccountRecovery model", () => {
  it("should update the organization policy signing a new ORK with the user private key", async() => {
    expect.assertions(1);
    const model = new AccountRecoveryModel(apiClientOptions);

    const accountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity({
      policy: "opt-in",
      account_recovery_organization_public_key: {
        armored_key: keys.adaPublicKey
      }
    });

    const oldAccountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity({
      policy: "disabled"
    });

    const adminPassphrase = "admin@passbolt.com";

    const resultingObject = await model.saveOrganizationSettings(
      accountRecoveryOrganizationPolicyEntity,
      oldAccountRecoveryOrganizationPolicyEntity,
      undefined,
      adminPassphrase);

    const sentOrk = (await openpgp.key.readArmored(resultingObject.armoredKey)).keys[0];
    const adminPrivateGpgKey = (await openpgp.key.readArmored(mockAdminPrivateKey)).keys[0];
    const signatures = await sentOrk.verifyAllUsers([adminPrivateGpgKey]);

    expect(keyExistsInList(signatures, adminPrivateGpgKey.keyId)).toBe(true);
  });

  it("should update the organization policy signing a new ORK with the user private key and prior ORK while revoking prior ORK", async() => {
    expect.assertions(3);
    const model = new AccountRecoveryModel(apiClientOptions);

    const accountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity({
      policy: "opt-in",
      account_recovery_organization_public_key: {
        armored_key: keys.irenePublicKey
      }
    });

    const oldAccountRecoveryOrganizationPolicyEntity = new AccountRecoveryOrganizationPolicyEntity({
      policy: "mandatory",
      account_recovery_organization_public_key: {
        armored_key: keys.adaPublicKey
      }
    });

    const oldORKprivateKeyEntity = new PrivateGpgkeyEntity({
      armored_key: keys.adaPrivateKey,
      passphrase: "ada@passbolt.com"
    });

    const adminPassphrase = "admin@passbolt.com";

    const resultingObject = await model.saveOrganizationSettings(
      accountRecoveryOrganizationPolicyEntity,
      oldAccountRecoveryOrganizationPolicyEntity,
      oldORKprivateKeyEntity,
      adminPassphrase);

    const sentOrk = (await openpgp.key.readArmored(resultingObject.armoredKey)).keys[0];
    const sentOldOrk = await GpgKeyInfoService.getKeyInfo({armoredKey: resultingObject.revokedKey});
    const adminPrivateGpgKey = (await openpgp.key.readArmored(mockAdminPrivateKey)).keys[0];
    const oldOrkPrivateGpgKey = (await openpgp.key.readArmored(keys.adaPrivateKey)).keys[0];
    const signatures = await sentOrk.verifyAllUsers([adminPrivateGpgKey, keys.adaPrivateKey]);

    expect(keyExistsInList(signatures, adminPrivateGpgKey.keyId)).toBe(true);
    expect(keyExistsInList(signatures, oldOrkPrivateGpgKey.keyId)).toBe(true);
    expect(sentOldOrk.revoked).toBe(true);
  });

  it('should update the user account recovery setting without signing keys if the user rejected the policy', async() => {
    expect.assertions(1);
    const model = new AccountRecoveryModel(apiClientOptions);
    const accountRecoveryUserSettingEntity = new AccountRecoveryUserSettingEntity({status: "rejected"});
    await model.saveUserSetting(accountRecoveryUserSettingEntity);

    expect(mockedSaveUserSetting).toHaveBeenCalledWith(accountRecoveryUserSettingEntity);
  });

  it.only('should update the user account recovery setting and sign keys if the user approveed the policy', async() => {
    expect.assertions(1);

    const model = new AccountRecoveryModel(apiClientOptions);
    const accountRecoveryUserSetting = new AccountRecoveryUserSettingEntity({status: "approved"});
    const privateKeyPassword = "admin@passbolt.com";
    const accountRecoveryOrganizationPublicKeyEntity = new AccountRecoveryOrganizationPublicKeyEntity({armored_key: keys.ORKPublicKey});
    await model.saveUserSetting(accountRecoveryUserSetting, privateKeyPassword, accountRecoveryOrganizationPublicKeyEntity);

    expect(mockedSaveUserSetting).toHaveBeenCalledWith({
      _props: {
        status: "approved",
      },
      _account_recovery_private_key: expect.any(AccountRecoveryPrivateKeyEntity),
      _account_recovery_private_key_passwords: expect.any(AccountRecoveryPrivateKeyPasswordsCollection)
    });
  });
});
