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

import {enableFetchMocks} from "jest-fetch-mock";
import User from "../../model/user";
import AccountRecoverySaveUserSettingsController from "./accountRecoverySaveUserSettingController";
import {PassphraseController} from "../passphrase/passphraseController";
import AccountRecoveryUserSettingEntity from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity";
import {
  createAcceptedAccountRecoveryUserSettingDto,
  createRejectedAccountRecoveryUserSettingDto
} from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity.test.data";
import {enabledAccountRecoveryOrganizationPolicyDto, disabledAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";

jest.mock("../passphrase/passphraseController.js");

beforeEach(async() => {
  jest.resetModules();
  enableFetchMocks();
  fetch.resetMocks();
  await MockExtension.withConfiguredAccount();
});

describe("AccountRecoverySaveUserSettingsController", () => {
  describe("AccountRecoverySaveUserSettingsController::exec", () => {
    it("Should save a rejected account recovery user setting.", async() => {
      const controller = new AccountRecoverySaveUserSettingsController(null, null, defaultApiClientOptions());

      // Mock API account recovery organization policy fetch.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));
      // Mock API account recovery user settings post. Return data such as the API will.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryUserSettingDto = createRejectedAccountRecoveryUserSettingDto({user_id: User.getInstance().get().id});
      const savedAccountRecoveryUserSetting = await controller.exec(accountRecoveryUserSettingDto);

      expect.assertions(1);
      const savedAccountRecoveryUserSettingDto = savedAccountRecoveryUserSetting.toDto(AccountRecoveryUserSettingEntity.ALL_CONTAIN_OPTIONS);
      expect(savedAccountRecoveryUserSettingDto).toEqual(accountRecoveryUserSettingDto);
    });

    it("Should save an approved account recovery user setting.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const controller = new AccountRecoverySaveUserSettingsController(null, null, defaultApiClientOptions(), account);

      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.ada.passphrase);
      // Mock API account recovery organization policy fetch.
      fetch.doMockOnce(() => mockApiResponse(enabledAccountRecoveryOrganizationPolicyDto()));
      // Mock API account recovery user settings post. Return data such as the API will.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryUserSettingDto = createAcceptedAccountRecoveryUserSettingDto({user_id: User.getInstance().get().id});
      const savedAccountRecoveryUserSetting = await controller.exec(accountRecoveryUserSettingDto);

      expect.assertions(5);
      expect(savedAccountRecoveryUserSetting).toBeInstanceOf(AccountRecoveryUserSettingEntity);
      expect(savedAccountRecoveryUserSetting.status).toEqual(AccountRecoveryUserSettingEntity.STATUS_APPROVED);
      expect(savedAccountRecoveryUserSetting.accountRecoveryPrivateKey).not.toBeUndefined();
      expect(savedAccountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords).not.toBeUndefined();
      expect(savedAccountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords).toHaveLength(1);
    });

    it("Should throw an error if no account recovery organization policy is found.", async() => {
      const controller = new AccountRecoverySaveUserSettingsController(null, null, defaultApiClientOptions());

      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.ada.passphrase);
      // Mock API account recovery organization policy fetch.
      fetch.doMockOnce(() => mockApiResponse(null));

      const accountRecoveryUserSettingDto = createAcceptedAccountRecoveryUserSettingDto({user_id: User.getInstance().get().id});
      const result = controller.exec(accountRecoveryUserSettingDto);

      expect.assertions(1);
      await expect(result).rejects.toThrowError("Account recovery organization policy not found.");
    });

    it("Should throw an error if the account recovery organization policy is disabled.", async() => {
      const controller = new AccountRecoverySaveUserSettingsController(null, null, defaultApiClientOptions());

      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.ada.passphrase);
      // Mock API account recovery organization policy fetch.
      fetch.doMockOnce(() => mockApiResponse(disabledAccountRecoveryOrganizationPolicyDto()));

      const accountRecoveryUserSettingDto = createAcceptedAccountRecoveryUserSettingDto({user_id: User.getInstance().get().id});
      const result = controller.exec(accountRecoveryUserSettingDto);

      expect.assertions(1);
      await expect(result).rejects.toThrowError("The Account recovery organization policy should be enabled.");
    });
  });
});
