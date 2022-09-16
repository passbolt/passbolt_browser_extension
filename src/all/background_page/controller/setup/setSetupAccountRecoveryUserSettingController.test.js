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
import SetSetupAccountRecoveryUserSettingController from "./setSetupAccountRecoveryUserSettingController";
import AccountRecoveryUserSettingEntity from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity";
import {createRejectedAccountRecoveryUserSettingDto} from "../../model/entity/accountRecovery/accountRecoveryUserSettingEntity.test.data";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {enabledAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import AccountRecoveryOrganizationPolicyEntity from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import {withUserKeyAccountSetupDto} from "../../model/entity/account/accountSetupEntity.test.data";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";

jest.mock("../passphrase/passphraseController.js");

beforeEach(async() => {
  enableFetchMocks();
  fetch.resetMocks();
});

describe("SetSetupAccountRecoveryUserSettingController", () => {
  describe("SetSetupAccountRecoveryUserSettingController::exec", () => {
    it("Should save a rejected account recovery user setting.", async() => {
      const account = new AccountSetupEntity(withUserKeyAccountSetupDto());
      const controller = new SetSetupAccountRecoveryUserSettingController(null, null, account);
      const accountRecoveryUserSettingDto = createRejectedAccountRecoveryUserSettingDto({user_id: account.userId});
      await controller.exec(AccountRecoveryUserSettingEntity.STATUS_REJECTED);

      expect.assertions(1);
      const savedAccountRecoveryUserSettingDto = account.accountRecoveryUserSetting.toDto(AccountRecoveryUserSettingEntity.ALL_CONTAIN_OPTIONS);
      await expect(savedAccountRecoveryUserSettingDto).toEqual(accountRecoveryUserSettingDto);
    });

    it("Should save an approved account recovery user setting.", async() => {
      const account = new AccountSetupEntity(withUserKeyAccountSetupDto());
      const runtimeMemory = {
        accountRecoveryOrganizationPolicy: new AccountRecoveryOrganizationPolicyEntity(enabledAccountRecoveryOrganizationPolicyDto()),
        passphrase: pgpKeys.ada.passphrase
      };
      const controller = new SetSetupAccountRecoveryUserSettingController(null, null, account, runtimeMemory);
      await controller.exec(AccountRecoveryUserSettingEntity.STATUS_APPROVED);

      expect.assertions(5);
      expect(account.accountRecoveryUserSetting).toBeInstanceOf(AccountRecoveryUserSettingEntity);
      expect(account.accountRecoveryUserSetting.status).toEqual(AccountRecoveryUserSettingEntity.STATUS_APPROVED);
      expect(account.accountRecoveryUserSetting.accountRecoveryPrivateKey).not.toBeUndefined();
      expect(account.accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords).not.toBeUndefined();
      expect(account.accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords).toHaveLength(1);
    });

    it.todo("Should throw an error if an attempt to save an approved account recovery user setting without organization policy retrieved.");

    it("Should throw an error if an attempt to save an approved account recovery user setting without passphrase.", async() => {
      const account = new AccountSetupEntity(withUserKeyAccountSetupDto());
      const controller = new SetSetupAccountRecoveryUserSettingController(null, null, account);
      const promise = controller.exec(AccountRecoveryUserSettingEntity.STATUS_APPROVED);

      expect.assertions(1);
      await expect(promise).rejects.toThrowError("A passphrase is required.");
    });
  });
});
