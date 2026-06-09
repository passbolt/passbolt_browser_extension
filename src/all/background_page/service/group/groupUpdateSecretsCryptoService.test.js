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
 * @since         5.13.0
 */
import { v4 as uuidv4 } from "uuid";
import { pgpKeys } from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import { plaintextSecretPasswordAndDescriptionDto } from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import GroupUpdateSecretsCryptoService from "./groupUpdateSecretsCryptoService";
import { OpenpgpAssertion } from "../../utils/openpgp/openpgpAssertions";
import EncryptMessageService from "../crypto/encryptMessageService";
import DecryptMessageService from "../crypto/decryptMessageService";
import GroupUpdateSecretsCollection from "../../model/entity/secret/groupUpdate/groupUpdateSecretsCollection";
import NeededSecretsCollection from "../../model/entity/secret/needed/neededSecretsCollection";
import { defaultResourcesSecretsDtos } from "../../model/entity/secret/groupUpdate/groupUpdateSecretsCollection.test.data";

describe("GroupUpdateSecretsCryptoService", () => {
  describe("::decryptSecrets", () => {
    it("should decrypt the secrets and report progress for each one", async () => {
      expect.assertions(3);

      const originalDecryptedSecret = plaintextSecretPasswordAndDescriptionDto();
      const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const secretsDtos = defaultResourcesSecretsDtos(1);
      secretsDtos[0].data = await EncryptMessageService.encrypt(JSON.stringify(originalDecryptedSecret), adaPublicKey);
      const secrets = new GroupUpdateSecretsCollection(secretsDtos, { validate: false });
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const onProgress = jest.fn();

      const result = await GroupUpdateSecretsCryptoService.decryptSecrets(privateKey, secrets, onProgress);

      expect(JSON.parse(result[secretsDtos[0].resource_id])).toStrictEqual(originalDecryptedSecret);
      expect(onProgress).toHaveBeenCalledTimes(1);
      expect(onProgress).toHaveBeenCalledWith("Decrypting 1/1");
    });
  });

  describe("::encryptSecrets", () => {
    it("should encrypt the needed secrets for the recipient and report progress for each one", async () => {
      expect.assertions(4);

      const originalDecryptedSecret = plaintextSecretPasswordAndDescriptionDto();
      const userId = uuidv4();
      const resourceId = uuidv4();
      const decryptedSecrets = { [resourceId]: JSON.stringify(originalDecryptedSecret) };
      const neededSecrets = new NeededSecretsCollection([{ user_id: userId, resource_id: resourceId }], {
        validate: false,
      });
      const usersPublicKeys = { [userId]: pgpKeys.betty.public };
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const onProgress = jest.fn();

      const result = await GroupUpdateSecretsCryptoService.encryptSecrets(
        privateKey,
        usersPublicKeys,
        neededSecrets,
        decryptedSecrets,
        onProgress,
      );

      const decryptedData = await DecryptMessageService.decrypt(
        await OpenpgpAssertion.readMessageOrFail(result.items[0].data),
        await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted),
      );

      expect(JSON.parse(decryptedData)).toStrictEqual(originalDecryptedSecret);
      expect(result.items[0].userId).toEqual(userId);
      expect(onProgress).toHaveBeenCalledTimes(1);
      expect(onProgress).toHaveBeenCalledWith("Encrypting 1/1");
    });

    it("should not throw when no progress callback is provided", async () => {
      expect.assertions(1);

      const userId = uuidv4();
      const resourceId = uuidv4();
      const decryptedSecrets = { [resourceId]: JSON.stringify(plaintextSecretPasswordAndDescriptionDto()) };
      const neededSecrets = new NeededSecretsCollection([{ user_id: userId, resource_id: resourceId }], {
        validate: false,
      });
      const usersPublicKeys = { [userId]: pgpKeys.betty.public };
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);

      const result = await GroupUpdateSecretsCryptoService.encryptSecrets(
        privateKey,
        usersPublicKeys,
        neededSecrets,
        decryptedSecrets,
      );

      expect(result.items).toHaveLength(1);
    });
  });
});
