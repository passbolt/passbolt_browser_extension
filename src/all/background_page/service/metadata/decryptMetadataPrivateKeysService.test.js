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
 * @since         4.10.0
 */

import EncryptMessageService from "../crypto/encryptMessageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {defaultMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import DecryptMetadataPrivateKeysService from "./decryptMetadataPrivateKeysService";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import MetadataPrivateKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeysCollection";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DecryptMetadataPrivateKeysService", () => {
  describe("::decryptOne", () => {
    it("should decrypt a MetadataPrivateKeyEntity", async() => {
      expect.assertions(3);

      const account = new AccountEntity(defaultAccountDto());

      const dto = defaultMetadataPrivateKeyDto();
      dto.data = pgpKeys.metadataKey.encryptedArmoredPrivateKeyMessage;

      const metadataPrivateKeyEntity = new MetadataPrivateKeyEntity(dto);
      const service = new DecryptMetadataPrivateKeysService(account);

      await service.decryptOne(metadataPrivateKeyEntity, pgpKeys.ada.passphrase);

      expect(metadataPrivateKeyEntity.data).toBeNull();
      expect(typeof metadataPrivateKeyEntity.armoredKey === "string").toBeTruthy();

      const openPgpPrivateKey = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKeyEntity.armoredKey);
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey)).not.toThrow();
    }, 10 * 1000);

    it("should retrieve the passphrase from the storage", async() => {
      expect.assertions(3);

      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => pgpKeys.ada.passphrase);

      const dto = defaultMetadataPrivateKeyDto();
      dto.data = pgpKeys.metadataKey.encryptedArmoredPrivateKeyMessage;

      const metadataPrivateKeyEntity = new MetadataPrivateKeyEntity(dto);

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await service.decryptOne(metadataPrivateKeyEntity);

      expect(metadataPrivateKeyEntity.data).toBeNull();
      expect(typeof metadataPrivateKeyEntity.armoredKey === "string").toBeTruthy();

      const openPgpPrivateKey = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKeyEntity.armoredKey);
      await expect(() => OpenpgpAssertion.assertDecryptedPrivateKey(openPgpPrivateKey)).not.toThrow();
    }, 10 * 1000);

    it("should ensure metadataPrivateKeyEntity is of a valid type", async() => {
      expect.assertions(1);
      const expectedError = new TypeError("The given entity is not a MetadataPrivateKeyEntity");
      const account = new AccountEntity(defaultAccountDto());

      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptOne("test")).rejects.toThrowError(expectedError);
    });

    it("should ensure metadataPrivateKeyEntity is not decrypted already", async() => {
      expect.assertions(1);
      const dto = defaultMetadataPrivateKeyDto({}, {withArmoredKey: true});
      const metadataPrivateKeyEntity = new MetadataPrivateKeyEntity(dto);

      const expectedError = new Error("The metadata private key should not be already decrypted.");

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptOne(metadataPrivateKeyEntity)).rejects.toThrowError(expectedError);
    });

    it("should ensure metadataPrivateKeyEntity data is a valid PGP message", async() => {
      expect.assertions(1);
      const dto = defaultMetadataPrivateKeyDto({}, {withData: true});
      const metadataPrivateKeyEntity = new MetadataPrivateKeyEntity(dto);

      //bypassing entity checks for the unit test
      metadataPrivateKeyEntity._props.data = "Test";

      const expectedError = new Error("The message should be a valid openpgp message.");

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptOne(metadataPrivateKeyEntity, "test")).rejects.toThrowError(expectedError);
    });

    it("should throw an error if the passphrase is not available", async() => {
      expect.assertions(2);
      const spyOnPassphraseStorage = jest.spyOn(PassphraseStorageService, "get");
      spyOnPassphraseStorage.mockImplementation(() => null);

      const dto = defaultMetadataPrivateKeyDto();
      dto.data = pgpKeys.metadataKey.encryptedArmoredPrivateKeyMessage;
      const metadataPrivateKeyEntity = new MetadataPrivateKeyEntity(dto);

      const expectedError = new UserPassphraseRequiredError();

      const account = new AccountEntity(defaultAccountDto());
      const service = new DecryptMetadataPrivateKeysService(account);
      await expect(() => service.decryptOne(metadataPrivateKeyEntity)).rejects.toThrowError(expectedError);
      expect(spyOnPassphraseStorage).toHaveBeenCalledTimes(1);
    });
  });
});
