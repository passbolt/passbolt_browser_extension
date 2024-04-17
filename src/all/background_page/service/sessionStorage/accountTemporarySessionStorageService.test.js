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
import {
  temporaryAccountRecoveryAccountDto,
  temporaryRecoverAccountDto,
  temporarySetupAccountDto
} from "../../model/entity/account/accountTemporaryEntity.test.data";
import AccountTemporarySessionStorageService from "./accountTemporarySessionStorageService";
import AccountTemporaryEntity from "../../model/entity/account/accountTemporaryEntity";

describe("AccountTemporarySessionStorage", () => {
  beforeEach(async() => {
    await browser.storage.session.clear();
  });

  describe("AccountTemporarySessionStorage::set", () => {
    it("Should set AccountTemporary in storage session", async() => {
      expect.assertions(1);
      // data mocked
      const accountTemporaryEntity = new AccountTemporaryEntity(temporarySetupAccountDto());
      // process
      await AccountTemporarySessionStorageService.set(accountTemporaryEntity);
      // expectations
      expect(await AccountTemporarySessionStorageService.get(accountTemporaryEntity.workerId)).toEqual(accountTemporaryEntity);
    });

    it("Should set AccountTemporary and keep only the last one in storage session", async() => {
      expect.assertions(3);
      // data mocked
      const accountTemporaryEntity = new AccountTemporaryEntity(temporarySetupAccountDto());
      const accountTemporaryEntity2 = new AccountTemporaryEntity(temporaryRecoverAccountDto());
      const accountTemporaryEntity3 = new AccountTemporaryEntity(temporaryAccountRecoveryAccountDto());
      // process
      await AccountTemporarySessionStorageService.set(accountTemporaryEntity);
      await AccountTemporarySessionStorageService.set(accountTemporaryEntity2);
      await AccountTemporarySessionStorageService.set(accountTemporaryEntity3);
      // expectations
      expect(await AccountTemporarySessionStorageService.get(accountTemporaryEntity.workerId)).toEqual(null);
      expect(await AccountTemporarySessionStorageService.get(accountTemporaryEntity2.workerId)).toEqual(null);
      expect(await AccountTemporarySessionStorageService.get(accountTemporaryEntity3.workerId)).toEqual(accountTemporaryEntity3);
    });

    it("Should not set the session storage if the account is not an AccountTemporaryEntity", async() => {
      expect.assertions(3);
      // data mocked
      const accountTemporaryEntity = new AccountTemporaryEntity(temporarySetupAccountDto());
      const accountTemporaryEntity2 = "test";
      // process
      await AccountTemporarySessionStorageService.set(accountTemporaryEntity);
      try {
        await AccountTemporarySessionStorageService.set(accountTemporaryEntity2);
      } catch (error) {
        // expectations
        expect(await AccountTemporarySessionStorageService.get(accountTemporaryEntity.workerId)).toEqual(accountTemporaryEntity);
        expect(await AccountTemporarySessionStorageService.get(accountTemporaryEntity2)).toEqual(null);
        expect(error.message).toEqual("The account is not an AccountTemporaryEntity, storage has not been set");
      }
    });
  });

  describe("AccountTemporarySessionStorage::get", () => {
    it("Should get an AccountTemporary if present", async() => {
      expect.assertions(1);
      // data mocked
      const accountTemporaryEntity = new AccountTemporaryEntity(temporarySetupAccountDto());
      // process
      await AccountTemporarySessionStorageService.set(accountTemporaryEntity);
      const accountTemporaryEntityStored = await AccountTemporarySessionStorageService.get(accountTemporaryEntity.workerId);
      // expectations
      expect(accountTemporaryEntity.toDto(AccountTemporaryEntity.ALL_CONTAIN_OPTIONS)).toStrictEqual(accountTemporaryEntityStored.toDto(AccountTemporaryEntity.ALL_CONTAIN_OPTIONS));
    });

    it("Should return null if the AccountTemporary doesn't exist", async() => {
      expect.assertions(1);
      // data mocked
      const accountTemporaryEntity = new AccountTemporaryEntity(temporarySetupAccountDto());
      // process
      await AccountTemporarySessionStorageService.set(accountTemporaryEntity);
      const accountTemporaryEntityStored = await AccountTemporarySessionStorageService.get("test");
      // expectations
      expect(accountTemporaryEntityStored).toEqual(null);
    });
  });

  describe("AccountTemporarysSessionStorage::remove", () => {
    it("Should remove AccountTemporary", async() => {
      expect.assertions(1);
      // data mocked
      const accountTemporaryEntity = new AccountTemporaryEntity(temporarySetupAccountDto());
      await AccountTemporarySessionStorageService.set(accountTemporaryEntity);
      // process
      await AccountTemporarySessionStorageService.remove();
      const accountTemporaryEntityStored = await AccountTemporarySessionStorageService.get(accountTemporaryEntity.workerId);
      // expectations
      expect(accountTemporaryEntityStored).toEqual(null);
    });
  });
});
