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
import {User} from "../../model/user";
import {MockExtension} from "../../../tests/mocks/mockExtension";
import {AccountRecoverySaveUserSettingsController} from "./accountRecoverySaveUserSettingController";
import PassphraseController from "../passphrase/passphraseController";
import {AccountRecoveryUserSettingEntity} from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity";
import {
  createAcceptedAccountRecoveryUserSettingDto,
  createRejectedAccountRecoveryUserSettingDto
} from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity.test.data";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import {defaultAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {mockApiResponse} from "../../../tests/mocks/mockApiResponse";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";

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

      // Mock API account recovery user settings post. Return data such as the API will.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryUserSettingDto = createRejectedAccountRecoveryUserSettingDto({user_id: User.getInstance().get().id});
      const savedAccountRecoveryUserSetting = await controller.exec(accountRecoveryUserSettingDto);

      expect.assertions(1);
      const savedAccountRecoveryUserSettingDto = savedAccountRecoveryUserSetting.toDto(AccountRecoveryUserSettingEntity.ALL_CONTAIN_OPTIONS);
      await expect(savedAccountRecoveryUserSettingDto).toEqual(accountRecoveryUserSettingDto);
    });

    it("Should save an approved account recovery user setting.", async() => {
      const controller = new AccountRecoverySaveUserSettingsController(null, null, defaultApiClientOptions());

      // Mock user passphrase capture.
      PassphraseController.request.mockResolvedValue(pgpKeys.ada.passphrase);
      // Mock API account recovery organization policy fetch.
      fetch.doMockOnce(() => mockApiResponse(defaultAccountRecoveryOrganizationPolicyDto()));
      // Mock API account recovery user settings post. Return data such as the API will.
      fetch.doMockOnce(async req => mockApiResponse(JSON.parse(await req.text())));

      const accountRecoveryUserSettingDto = createAcceptedAccountRecoveryUserSettingDto({user_id: User.getInstance().get().id});
      const savedAccountRecoveryUserSetting = await controller.exec(accountRecoveryUserSettingDto);

      expect.assertions(5);
      await expect(savedAccountRecoveryUserSetting).toBeInstanceOf(AccountRecoveryUserSettingEntity);
      await expect(savedAccountRecoveryUserSetting.status).toEqual(AccountRecoveryUserSettingEntity.STATUS_APPROVED);
      await expect(savedAccountRecoveryUserSetting.accountRecoveryPrivateKey).not.toBeUndefined();
      await expect(savedAccountRecoveryUserSetting.accountRecoveryPrivateKeyPasswords).not.toBeUndefined();
      await expect(savedAccountRecoveryUserSetting.accountRecoveryPrivateKeyPasswords).toHaveLength(1);
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
  });
});
