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
import SessionKeysBundleEntity from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleEntity";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {
  decryptedSessionKeysBundleDto,
  defaultSessionKeysBundleDto
} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleEntity.test.data";
import EncryptSessionKeysBundlesService from "./encryptSessionKeysBundlesService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EncryptSessionKeysBundlesService", () => {
  describe("::encryptOne", () => {
    it("encrypts a SessionKeysBundleEntity", async() => {
      expect.assertions(4);

      const account = new AccountEntity(defaultAccountDto());
      const service = new EncryptSessionKeysBundlesService(account);
      const dto = decryptedSessionKeysBundleDto();
      const sessionKeysBundle = new SessionKeysBundleEntity(dto);

      await service.encryptOne(sessionKeysBundle, pgpKeys.ada.passphrase);

      expect(sessionKeysBundle._data).toBeUndefined();
      expect(sessionKeysBundle.isDecrypted).toBeFalsy();
      expect(typeof sessionKeysBundle.data).toEqual("string");
      await expect(sessionKeysBundle.data).toDecryptAndEqualTo(pgpKeys.ada.private_decrypted, JSON.stringify(dto.data), pgpKeys.ada.private_decrypted);
    });

    it("retrieves the passphrase from the storage if not provided as parameter", async() => {
      expect.assertions(4);

      const account = new AccountEntity(defaultAccountDto());
      const service = new EncryptSessionKeysBundlesService(account);
      const dto = decryptedSessionKeysBundleDto();
      const sessionKeysBundle = new SessionKeysBundleEntity(dto);
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      await service.encryptOne(sessionKeysBundle);

      expect(sessionKeysBundle._data).toBeUndefined();
      expect(sessionKeysBundle.isDecrypted).toBeFalsy();
      expect(typeof sessionKeysBundle.data).toEqual("string");
      await expect(sessionKeysBundle.data).toDecryptAndEqualTo(pgpKeys.ada.private_decrypted, JSON.stringify(dto.data), pgpKeys.ada.private_decrypted);
    });

    it("throws if the parameters are not valid", async() => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());
      const service = new EncryptSessionKeysBundlesService(account);
      await expect(() => service.encryptOne(42)).rejects.toThrowError(new TypeError("The parameter \"sessionKeysBundle\" should be a SessionKeysBundleEntity."));
      await expect(() => service.encryptOne(new SessionKeysBundleEntity(defaultSessionKeysBundleDto()), 42)).rejects.toThrowError(new TypeError('The parameter "passphrase" should be a string.'));
    });

    it("throws if the session key bundle entity is encrypted", async() => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());
      const service = new EncryptSessionKeysBundlesService(account);
      const dto = defaultSessionKeysBundleDto();
      const sessionKeysBundle = new SessionKeysBundleEntity(dto);
      await expect(() => service.encryptOne(sessionKeysBundle)).rejects.toThrow("The session key bundle should be decrypted.");
    });

    it("throws if the passphrase is not available", async() => {
      expect.assertions(2);

      const account = new AccountEntity(defaultAccountDto());
      const service = new EncryptSessionKeysBundlesService(account);
      const dto = decryptedSessionKeysBundleDto();
      const sessionKeysBundle = new SessionKeysBundleEntity(dto);
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");

      spyOnPassphraseStorage.mockImplementation(() => null);

      await expect(() => service.encryptOne(sessionKeysBundle)).rejects.toThrowError(new UserPassphraseRequiredError());
      expect(spyOnPassphraseStorage).toHaveBeenCalledTimes(1);
    });
  });
});
