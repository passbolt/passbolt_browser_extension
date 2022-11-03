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
import AccountLocalStorage from "./accountLocalStorage";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import browser from "../../sdk/polyfill/browserPolyfill";

describe("AccountLocalStorage", () => {
  describe("AccountLocalStorage::get", () => {
    it("Should return undefined if nothing stored in the storage", async() => {
      expect.assertions(1);
      const result = await AccountLocalStorage.get();
      expect(result).toEqual([]);
    });

    it("Should return content stored in the local storage", async() => {
      const accounts = [defaultAccountDto()];
      browser.storage.local.set({[AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]: accounts});
      expect.assertions(1);
      const result = await AccountLocalStorage.get();
      expect(result).toEqual(accounts);
    });
  });

  describe("AccountLocalStorage::getAccountByUserIdAndType", () => {
    it("Should return nothing if the target account is not found in the local storage", async() => {
      const targetAccount = defaultAccountDto();
      const accountWithSameUserId = defaultAccountDto({type: AccountEntity.TYPE_ACCOUNT_RECOVERY});
      const accountWithSameType = defaultAccountDto({user_id: "7f077753-0835-4054-92ee-556660ea04f0"});
      const accounts = [targetAccount, accountWithSameUserId, accountWithSameType];
      browser.storage.local.set({[AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]: accounts});

      expect.assertions(1);
      const result = await AccountLocalStorage.getAccountByUserIdAndType(targetAccount.user_id, targetAccount.type);
      expect(result).toEqual(targetAccount);
    });

    it("Should return the target account stored in the local storage", async() => {
      const targetAccount = defaultAccountDto();
      const accountWithSameUserId = defaultAccountDto({type: AccountEntity.TYPE_ACCOUNT_RECOVERY});
      const accountWithSameType = defaultAccountDto({user_id: "7f077753-0835-4054-92ee-556660ea04f0"});
      const accounts = [targetAccount, accountWithSameUserId, accountWithSameType];
      browser.storage.local.set({[AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]: accounts});

      expect.assertions(1);
      const result = await AccountLocalStorage.getAccountByUserIdAndType(uuidv4(), uuidv4());
      expect(result).toBeUndefined();
    });
  });

  describe("AccountLocalStorage::add", () => {
    it("Should add an account in the local storage", async() => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());
      await AccountLocalStorage.add(account);
      const {accounts} = await browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]);
      expect(accounts).toHaveLength(1);
      expect(accounts[0]).toEqual(account.toDto(AccountEntity.ALL_CONTAIN_OPTIONS));
    });

    /**
     * Async test function to add an account in the local storage.
     * It will be useful to test concurrency access/
     * @param {AccountEntity} account The account to add.
     * @returns {Promise<void>}
     */
    const addFn = async account => {
      let resolver;
      const promise = new Promise(resolve => resolver = resolve);
      await AccountLocalStorage.add(account);
      resolver();
      return promise;
    };

    it("Should run in sequence", async() => {
      const sampleSize = 500;
      const accountsToAdd = [];

      expect.assertions(2);
      for (let i = 0; i < sampleSize; i++) {
        const account = new AccountEntity(defaultAccountDto());
        accountsToAdd.push(account.toDto(AccountEntity.ALL_CONTAIN_OPTIONS));
        await addFn(account);
      }
      const {accounts} = await browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]);
      expect(accountsToAdd).toHaveLength(sampleSize);
      expect(accounts).toEqual(accountsToAdd);
    });

    it("Should run in concurrency", async() => {
      const sampleSize = 500;
      const promises = [];
      const accountsToAdd = [];

      expect.assertions(2);
      await browser.storage.local.set({[AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]: []});
      for (let i = 0; i < sampleSize; i++) {
        const account = new AccountEntity(defaultAccountDto());
        accountsToAdd.push(account.toDto(AccountEntity.ALL_CONTAIN_OPTIONS));
        promises.push(addFn(account));
      }

      await Promise.all(promises);
      const {accounts} = await browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]);
      expect(accounts).toHaveLength(sampleSize);
      expect(accounts).toEqual(accountsToAdd);
    });
  });

  describe("AccountLocalStorage::deleteByUserIdAndType", () => {
    /**
     * Async test function to delete an account in the local storage.
     * It will be useful to test concurrency access/
     * @param {AccountEntity} account The account to delete.
     * @returns {Promise<void>}
     */
    const deleteFn = async account => {
      let resolver;
      const promise = new Promise(resolve => resolver = resolve);
      await AccountLocalStorage.deleteByUserIdAndType(account.userId, account.type);
      resolver();
      return promise;
    };

    it("Should delete all the account having the given user_id and type from the local storage", async() => {
      expect.assertions(1);
      await AccountLocalStorage.deleteByUserIdAndType(uuidv4(), AccountEntity.TYPE_ACCOUNT);
      const {accounts} = await browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]);
      expect(accounts).toEqual([]);
    });

    it("Should run against a not yet defined local storage", async() => {
      expect.assertions(1);

      // Not yet defined local storage
      await AccountLocalStorage.deleteByUserIdAndType(uuidv4(), AccountEntity.TYPE_ACCOUNT);
      const {accounts} = await browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]);
      expect(accounts).toEqual([]);
    });

    it("Should run against an empty local storage", async() => {
      expect.assertions(1);

      // Empty local storage.
      await browser.storage.local.set({[AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]: []});
      await AccountLocalStorage.deleteByUserIdAndType(uuidv4(), AccountEntity.TYPE_ACCOUNT);
      const {accounts} = await browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]);
      expect(accounts).toHaveLength(0);
    });

    it("Should run in sequence", async() => {
      const sampleSize = 500;
      const accountsToDelete = [];

      // Initialize the local storage with X accounts;
      for (let i = 0; i < sampleSize; i++) {
        const account = new AccountEntity(defaultAccountDto());
        accountsToDelete.push(account);
        await AccountLocalStorage.add(account);
      }

      // expect.assertions(3 + sampleSize);
      expect(accountsToDelete).toHaveLength(sampleSize);
      let {accounts} = browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]);
      expect(accounts).toHaveLength(sampleSize);

      for (let i = 0; i < sampleSize; i++) {
        await deleteFn(accountsToDelete[i]);
        ({accounts} = await browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]));
        const expectedAccountDeleted = accounts.find(accountLocalStorage => accountLocalStorage.user_id === accountsToDelete[i].userId);
        expect(expectedAccountDeleted).toBeUndefined();
        expect(accounts).toHaveLength(sampleSize - i - 1);
      }

      ({accounts} = await browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]));
      expect(accounts).toHaveLength(0);
    });

    it("Should run in concurrency", async() => {
      const sampleSize = 500;
      const promises = [];
      const accountsToDelete = [];

      // Initialize the local storage with X accounts;
      for (let i = 0; i < sampleSize; i++) {
        const account = new AccountEntity(defaultAccountDto());
        accountsToDelete.push(account);
        await AccountLocalStorage.add(account);
      }

      // expect.assertions(3 + sampleSize);
      expect(accountsToDelete).toHaveLength(sampleSize);
      let {accounts} = browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]);
      expect(accounts).toHaveLength(sampleSize);

      for (let i = 0; i < sampleSize; i++) {
        promises.push(deleteFn(accountsToDelete[i]));
      }

      await Promise.all(promises);
      ({accounts} = await browser.storage.local.get([AccountLocalStorage.ACCOUNTS_LOCAL_STORAGE_KEY]));
      expect(accounts).toHaveLength(0);
    });
  });
});
