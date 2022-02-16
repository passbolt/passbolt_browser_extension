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

import {ApiClientOptions} from '../../service/api/apiClient/apiClientOptions';
import {AccountRecoveryOrganizationPublicKeyEntity} from '../entity/accountRecovery/accountRecoveryOrganizationPublicKeyEntity';
import {AccountRecoveryModel} from "./accountRecoveryModel";
import {AccountRecoveryUserSettingEntity} from '../entity/accountRecovery/accountRecoveryUserSettingEntity';
import {AccountRecoveryPrivateKeyEntity} from '../entity/accountRecovery/accountRecoveryPrivateKeyEntity';
import {AccountRecoveryPrivateKeyPasswordsCollection} from '../entity/accountRecovery/accountRecoveryPrivateKeyPasswordsCollection';
import {ExternalGpgKeyEntity} from '../entity/gpgkey/external/externalGpgKeyEntity';
import keys from './accountRecoveryModel.test.data';

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

const mockAdminPrivateKey = new ExternalGpgKeyEntity({armored_key: keys.adminPrivateKey});
jest.mock('../keyring', () => ({
  Keyring: jest.fn().mockImplementation(() => ({
    findPrivate: jest.fn(() => mockAdminPrivateKey)
  }))
}));

const apiClientOptions = (new ApiClientOptions()).setBaseUrl('https://test.passbolt.test/');

describe("AccountRecovery model", () => {
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
