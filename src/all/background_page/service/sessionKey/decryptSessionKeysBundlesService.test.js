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
 * @since         4.10.1
 */

import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import DecryptSessionKeysBundlesService from "./decryptSessionKeysBundlesService";
import SessionKeysBundleEntity from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleEntity";
import SessionKeysBundleDataEntity from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleDataEntity";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultSessionKeysBundleDto} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleEntity.test.data";
import {defaultSessionKeysBundlesDtos} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection.test.data";
import SessionKeysBundlesCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DecryptSessionKeysBundlesService", () => {
  describe("::decryptOne", () => {
    it("should decrypt a SessionKeysBundleEntity", async() => {
      expect.assertions(2);

      const account = new AccountEntity(defaultAccountDto());

      const dto = defaultSessionKeysBundleDto();

      const sessionKeysBundleEntity = new SessionKeysBundleEntity(dto);
      const service = new DecryptSessionKeysBundlesService(account);

      await service.decryptOne(sessionKeysBundleEntity, pgpKeys.ada.passphrase);

      expect(sessionKeysBundleEntity._props.data).toBeUndefined();
      expect(sessionKeysBundleEntity.data).toBeInstanceOf(SessionKeysBundleDataEntity);
    });

    it("should retrieve the passphrase from the storage", async() => {
      expect.assertions(1);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const dto = defaultSessionKeysBundleDto();

      const sessionKeysBundleEntity = new SessionKeysBundleEntity(dto);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptSessionKeysBundlesService(account);
      await service.decryptOne(sessionKeysBundleEntity);

      expect(sessionKeysBundleEntity.data).toBeInstanceOf(SessionKeysBundleDataEntity);
    });

    it("should ensure sessionKeysBundleEntity is of a valid type", async() => {
      expect.assertions(1);
      const expectedError = new TypeError("The given entity is not a SessionKeysBundleEntity");
      const account = new AccountEntity(defaultAccountDto());

      const service = new DecryptSessionKeysBundlesService(account);
      await expect(() => service.decryptOne("test")).rejects.toThrowError(expectedError);
    });

    it("should ensure sessionKeysBundleEntity is not decrypted already", async() => {
      expect.assertions(1);
      const dto = defaultSessionKeysBundleDto({}, {withDecryptedSessionKeysBundle: true});
      const sessionKeysBundleEntity = new SessionKeysBundleEntity(dto);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptSessionKeysBundlesService(account);
      await expect(() => service.decryptOne(sessionKeysBundleEntity)).not.toThrow();
    });

    it("should ensure sessionKeysBundleEntity data is a valid PGP message", async() => {
      expect.assertions(1);
      const dto = defaultSessionKeysBundleDto();
      const sessionKeysBundleEntity = new SessionKeysBundleEntity(dto);

      //bypassing entity checks for the unit test
      sessionKeysBundleEntity._props.data = "Test";

      const expectedCauseError = new Error("The message should be a valid openpgp message.");
      const expectedError = new Error(`Unable to decrypt the metadata session key bundle (${sessionKeysBundleEntity.id}) using the user key.`, {cause: expectedCauseError});

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptSessionKeysBundlesService(account);
      await expect(() => service.decryptOne(sessionKeysBundleEntity, pgpKeys.ada.passphrase)).rejects.toThrowError(expectedError);
    });

    it("should throw an error if the passphrase is not available", async() => {
      expect.assertions(2);
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const dto = defaultSessionKeysBundleDto();
      const sessionKeysBundleEntity = new SessionKeysBundleEntity(dto);

      const expectedError = new UserPassphraseRequiredError();

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptSessionKeysBundlesService(account);
      await expect(() => service.decryptOne(sessionKeysBundleEntity)).rejects.toThrowError(expectedError);
      expect(spyOnPassphraseStorage).toHaveBeenCalledTimes(1);
    });
  });

  describe("::decryptAll", () => {
    it("should decrypt a SessionKeysBundlesCollection", async() => {
      expect.assertions(3);

      const dtos = defaultSessionKeysBundlesDtos({}, {count: 2});

      const collection = new SessionKeysBundlesCollection(dtos);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptSessionKeysBundlesService(account);
      await service.decryptAll(collection, pgpKeys.ada.passphrase);

      expect(collection).toHaveLength(2);
      expect(collection._items[0].data).toBeInstanceOf(SessionKeysBundleDataEntity);
      expect(collection._items[1].data).toBeInstanceOf(SessionKeysBundleDataEntity);
    });

    it("should retrieve the passphrase from the storage", async() => {
      expect.assertions(3);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const dtos = defaultSessionKeysBundlesDtos({}, {count: 2});

      const collection = new SessionKeysBundlesCollection(dtos);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptSessionKeysBundlesService(account);
      await service.decryptAll(collection);

      expect(collection).toHaveLength(2);
      expect(collection._items[0].data).toBeInstanceOf(SessionKeysBundleDataEntity);
      expect(collection._items[1].data).toBeInstanceOf(SessionKeysBundleDataEntity);
    });

    it("should ensure sessionKeysBundlesCollection is of a valid type", async() => {
      expect.assertions(1);

      const expectedError = new TypeError("The given collection is not of the type SessionKeysBundlesCollection");

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptSessionKeysBundlesService(account);
      await expect(() => service.decryptAll("test")).rejects.toThrowError(expectedError);
    });

    it("should ensure sessionKeysBundleEntity data is a valid PGP message", async() => {
      expect.assertions(1);
      const dto = defaultSessionKeysBundleDto();
      const collection = new SessionKeysBundlesCollection([dto]);

      //bypassing entity checks for the unit test
      collection._items[0]._props.data = "Test";

      const expectedErrorMessage = `Unable to decrypt the metadata session key bundle (${dto?.id}) using the user key.`;
      const expectedCauseError = new Error("The message should be a valid openpgp message.");
      const expectedError = new Error(expectedErrorMessage, {cause: expectedCauseError});

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptSessionKeysBundlesService(account);
      await expect(() => service.decryptAll(collection, pgpKeys.ada.passphrase)).rejects.toThrowError(expectedError);
    });

    it("should throw an error if the passphrase is not available", async() => {
      expect.assertions(2);
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const dtos = defaultSessionKeysBundlesDtos({}, {count: 2});
      const collection = new SessionKeysBundlesCollection(dtos);

      const expectedError = new UserPassphraseRequiredError();

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptSessionKeysBundlesService(account);
      await expect(() => service.decryptAll(collection)).rejects.toThrowError(expectedError);
      expect(spyOnPassphraseStorage).toHaveBeenCalledTimes(1);
    });
  });
});
