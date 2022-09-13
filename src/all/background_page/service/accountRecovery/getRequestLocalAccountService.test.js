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

import {v4 as uuidv4} from 'uuid';
import GetRequestLocalAccountService from "./getRequestLocalAccountService";
import AccountAccountRecoveryEntity from "../../model/entity/account/accountAccountRecoveryEntity";
import {initialAccountAccountRecoveryDto} from "../../model/entity/account/accountAccountRecoveryEntity.test.data";
import AccountLocalStorage from "../local_storage/accountLocalStorage";

describe("GetRequestLocalAccountService", () => {
  describe("GetRequestLocalAccountService:parse", () => {
    it("should return the account recovery matching the continue url.", async() => {
      const accountToStoreDto = initialAccountAccountRecoveryDto();
      const accountToStore = new AccountAccountRecoveryEntity(accountToStoreDto);
      await AccountLocalStorage.add(accountToStore);
      const url = `https://passbolt.local/account-recovery/continue/${accountToStore.userId}/${accountToStore.authenticationTokenToken}`;
      const account = await GetRequestLocalAccountService.getAccountMatchingContinueUrl(url);

      expect.assertions(1);
      await expect(account.toDto(AccountAccountRecoveryEntity.ALL_CONTAIN_OPTIONS)).toEqual(accountToStoreDto);
    });

    it("should not return any account if there is no account recovery in the local storage.", async() => {
      const accountToStoreDto = initialAccountAccountRecoveryDto();
      const accountToStore = new AccountAccountRecoveryEntity(accountToStoreDto);
      const url = `https://passbolt.local/account-recovery/continue/${accountToStore.userId}/${accountToStore.authenticationTokenToken}`;
      const promise = GetRequestLocalAccountService.getAccountMatchingContinueUrl(url);

      expect.assertions(1);
      await expect(promise).rejects.toThrow("No account found for the given user in the local storage.");
    });

    it("should not return any account if there is an account stored with a different domain in the local storage.", async() => {
      const accountToStoreDto = initialAccountAccountRecoveryDto({domain: "http://passbolt.local"});
      const accountToStore = new AccountAccountRecoveryEntity(accountToStoreDto);
      await AccountLocalStorage.add(accountToStore);
      const url = `https://passbolt.local/account-recovery/continue/${accountToStore.userId}/${accountToStore.authenticationTokenToken}`;
      const promise = GetRequestLocalAccountService.getAccountMatchingContinueUrl(url);

      expect.assertions(1);
      await expect(promise).rejects.toThrow("The account found in the local storage does not match the account recovery request url parameters.");
    });

    it("should not return any account if there is an account stored with a different user id in the local storage.", async() => {
      const accountToStoreDto = initialAccountAccountRecoveryDto();
      const accountToStore = new AccountAccountRecoveryEntity(accountToStoreDto);
      await AccountLocalStorage.add(accountToStore);
      const url = `https://passbolt.local/account-recovery/continue/${uuidv4()}/${accountToStore.authenticationTokenToken}`;
      const promise = GetRequestLocalAccountService.getAccountMatchingContinueUrl(url);

      expect.assertions(1);
      await expect(promise).rejects.toThrow("No account found for the given user in the local storage.");
    });

    it("should not return any account if there is an account stored with a different authentication token in the local storage.", async() => {
      const accountToStoreDto = initialAccountAccountRecoveryDto();
      const accountToStore = new AccountAccountRecoveryEntity(accountToStoreDto);
      await AccountLocalStorage.add(accountToStore);
      const url = `https://passbolt.local/account-recovery/continue/${accountToStore.userId}/${uuidv4()}`;
      const promise = GetRequestLocalAccountService.getAccountMatchingContinueUrl(url);

      expect.assertions(1);
      await expect(promise).rejects.toThrow("The account found in the local storage does not match the account recovery request url parameters.");
    });
  });
});
