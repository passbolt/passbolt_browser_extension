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
 * @since         5.2.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import ShareMetadataKeyPrivateController from "./shareMetadataKeyPrivateController";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import GetOrFindMetadataKeysService from "../../service/metadata/getOrFindMetadataKeysService";
import UsersCollection from "../../model/entity/user/usersCollection";
import {metadataKeysSignedByCurrentDto, usersWithMissingMetadataKeysDto} from "../../service/metadata/shareMetadataKeyPrivateService.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import {enableFetchMocks} from "jest-fetch-mock";
import MockExtension from "../../../../../test/mocks/mockExtension";
import Keyring from "../../model/keyring";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import FindSignatureService from "../../service/crypto/findSignatureService";
import MetadataPrivateKeyApiService from "../../service/api/metadata/metadataPrivateKeyApiService";

jest.mock("../../service/passphrase/getPassphraseService");

describe("ShareMetadataKeyPrivateController", () => {
  describe("::exec", () => {
    let controller, account, apiClientOptions, keyring;

    beforeEach(async() => {
      enableFetchMocks();
      fetch.resetMocks();
      account = new AccountEntity(defaultAccountDto({
        role_name: RoleEntity.ROLE_ADMIN
      }));
      apiClientOptions = defaultApiClientOptions();
      controller = new ShareMetadataKeyPrivateController(null, null, apiClientOptions, account);
      controller.getPassphraseService.getPassphrase.mockResolvedValue(pgpKeys.ada.passphrase);
      await MockExtension.withConfiguredAccount();
      keyring = new Keyring();
      await keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
      await keyring.importPublic(pgpKeys.betty.public, pgpKeys.betty.userId);
      jest.spyOn(controller.shareMetadataKeyPrivateService.keyring, "sync").mockImplementation(jest.fn());
    });


    it("should throw if the userId parameter is not valid.", async() => {
      expect.assertions(1);
      await expect(() => controller.exec(1)).rejects.toThrow("The user id should be a valid uuid.");
    });

    it("should call verify or trust metadata key service.", async() => {
      const metadataKeys = new MetadataKeysCollection([]);
      const missingMetadataKeysIds = [];
      const users = new UsersCollection(usersWithMissingMetadataKeysDto({
        missingMetadataKeysIds
      }));

      jest.spyOn(controller.verifyOrTrustMetadataKeyService, "verifyTrustedOrTrustNewMetadataKey");
      jest.spyOn(controller.getPassphraseService, "getPassphrase");
      jest.spyOn(controller.shareMetadataKeyPrivateService.userModel, "getOrFindAll").mockImplementation(() => users);
      jest.spyOn(GetOrFindMetadataKeysService.prototype, "getOrFindAll").mockImplementation(() => metadataKeys);

      await controller.exec(pgpKeys.betty.userId);

      expect(controller.verifyOrTrustMetadataKeyService.verifyTrustedOrTrustNewMetadataKey).toHaveBeenCalled();
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalled();
    });


    it("should share and sign the missing data keys signed by the current administrator", async() => {
      expect.assertions(5);

      const decryptedPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const recipientPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const metadataKeys = new MetadataKeysCollection(metadataKeysSignedByCurrentDto());
      const missingMetadataKeysIds = [metadataKeys.items[0].id];
      const users = new UsersCollection(usersWithMissingMetadataKeysDto({
        missingMetadataKeysIds
      }));

      jest.spyOn(controller.verifyOrTrustMetadataKeyService, "verifyTrustedOrTrustNewMetadataKey");
      jest.spyOn(controller.getPassphraseService, "getPassphrase");
      jest.spyOn(controller.shareMetadataKeyPrivateService.userModel, "getOrFindAll").mockImplementation(() => users);
      jest.spyOn(controller.shareMetadataKeyPrivateService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);

      const expectedSharedMetadataPrivateKey = await metadataKeys.items[0].metadataPrivateKeys.items[0].cloneForSharing(users.items[0].id);

      jest.spyOn(MetadataPrivateKeyApiService.prototype, "create").mockImplementation(async encryptedMetadataPrivateKeys => {
        expect(encryptedMetadataPrivateKeys.items.length).toEqual(1);

        const metadataPrivateKeyEntity = encryptedMetadataPrivateKeys.items[0];
        const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKeyEntity.data);
        const decryptResult = await DecryptMessageService.decrypt(messageEncrypted, recipientPrivateKey, [decryptedPrivateKey], {returnOnlyData: false});
        const signature = await FindSignatureService.findSignatureForGpgKey(decryptResult.signatures, decryptedPrivateKey);

        expect(metadataPrivateKeyEntity.userId).toEqual(expectedSharedMetadataPrivateKey.userId);
        expect(metadataPrivateKeyEntity.metadataKeyId).toEqual(expectedSharedMetadataPrivateKey.metadataKeyId);
        expect(JSON.parse(decryptResult.data)).toEqual(expectedSharedMetadataPrivateKey.data.toDto());
        expect(signature.isVerified).toBeTruthy();
      });

      await controller.exec(pgpKeys.betty.userId);
    });
  });
});
