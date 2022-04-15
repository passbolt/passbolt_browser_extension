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

import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import {DecryptMessageService} from "./decryptMessageService";
import {EncryptMessageService} from "./encryptMessageService";

/**
 * Unit tests on ConfirmSaveAccountRecoverySettings in regard of specifications
 */

describe("EncryptMessageService", () => {
  describe("EncryptMessageService::encryptSymmetrically", () => {
    it("should encrypt symmetrically", async() => {
      const messageClear = "message clear";
      const encryptPassword = "encrypt-password";
      const resultEncrypt = await EncryptMessageService.encryptSymmetrically(messageClear, [encryptPassword]);
      expect.assertions(3);

      expect(resultEncrypt).toBeTruthy();
      const resultDecrypt = await openpgp.decrypt({
        message: await openpgp.readMessage({armoredMessage: resultEncrypt}),
        passwords: [encryptPassword]
      });
      expect(resultDecrypt).not.toBeNull();
      expect(resultDecrypt.data).toEqual(messageClear);
    }, 10 * 1000);

    it("should encrypt symmetrically and sign with one key", async() => {
      const messageClear = "message clear";
      const encryptPassword = "encrypt-password";
      const signingKey = pgpKeys.ada.private_decrypted;
      const resultEncrypt = await EncryptMessageService.encryptSymmetrically(messageClear, [encryptPassword], signingKey);
      expect.assertions(4);
      expect(resultEncrypt).toBeTruthy();
      const resultDecrypt = await openpgp.decrypt({
        message: await openpgp.readMessage({armoredMessage: resultEncrypt}),
        passwords: [encryptPassword],
        verificationKeys: await openpgp.readKey({armoredKey: signingKey})
      });
      expect(resultDecrypt).not.toBeNull();
      expect(resultDecrypt.data).toEqual(messageClear);
      expect(await resultDecrypt.signatures[0].verified).toBeTruthy();
    }, 10 * 1000);

    it("should encrypt symmetrically and sign with multiple keys", async() => {
      const messageClear = "message clear";
      const encryptPassword = "encrypt-password";
      const signingKeyUserA = pgpKeys.ada.private_decrypted;
      const signingKeyUserB = pgpKeys.betty.private_decrypted;
      const resultEncrypt = await EncryptMessageService.encryptSymmetrically(messageClear, [encryptPassword], [signingKeyUserA, signingKeyUserB]);

      expect.assertions(5);
      expect(resultEncrypt).toBeTruthy();
      const resultDecrypt = await openpgp.decrypt({
        message: await openpgp.readMessage({armoredMessage: resultEncrypt}),
        passwords: [encryptPassword],
        verificationKeys: [await openpgp.readKey({armoredKey: signingKeyUserA}), await openpgp.readKey({armoredKey: signingKeyUserB})]
      });
      expect(resultDecrypt).not.toBeNull();
      expect(resultDecrypt.data).toEqual(messageClear);
      expect(await resultDecrypt.signatures[0].verified).toBeTruthy();
      expect(await resultDecrypt.signatures[1].verified).toBeTruthy();
    }, 10 * 1000);

    it("should throw an error if the signing key is not a valid decrypted openpgp key", async() => {
      const messageClear = "message clear";
      const encryptPassword = "encrypt-password";
      const signKey = pgpKeys.ada.private;
      const resultEncryptPromise = EncryptMessageService.encryptSymmetrically(messageClear, [encryptPassword], signKey);

      expect.assertions(1);
      await expect(resultEncryptPromise).rejects.toThrow("The private key should be decrypted.");
    });
  });

  describe("EncryptMessageService::encrypt", () => {
    it("should encrypt asymmetrically", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.ada.public;

      const resultEncrypt = await EncryptMessageService.encrypt(messageClear, publicKey);
      expect.assertions(2);
      expect(resultEncrypt).toBeTruthy();
      const resultDecrypt = await DecryptMessageService.decrypt(resultEncrypt, pgpKeys.ada.private_decrypted);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should encrypt asymmetrically and sign with one key", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.ada.public;
      const signingKey = pgpKeys.betty.private_decrypted;

      const resultEncrypt = await EncryptMessageService.encrypt(messageClear, publicKey, signingKey);

      expect.assertions(2);
      expect(resultEncrypt).toBeTruthy();
      const verificationKeys = [pgpKeys.betty.public];
      const resultDecrypt = await DecryptMessageService.decrypt(resultEncrypt, pgpKeys.ada.private_decrypted, verificationKeys);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should encrypt asymmetrically and sign with multiple keys", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.ada.public;
      const signingKeyUserA = pgpKeys.ada.private_decrypted;
      const signingKeyUserB = pgpKeys.betty.private_decrypted;

      const resultEncrypt = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);

      expect.assertions(2);
      expect(resultEncrypt).toBeTruthy();
      const verificationKeys = [signingKeyUserA, signingKeyUserB];
      const resultDecrypt = await DecryptMessageService.decrypt(resultEncrypt, pgpKeys.ada.private_decrypted, verificationKeys);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should throw an error if the signing key is not a valid decrypted openpgp key", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.ada.public;
      const signingKey = pgpKeys.ada.private;
      const resultEncrypt = EncryptMessageService.encrypt(messageClear, publicKey, signingKey);

      expect.assertions(1);
      await expect(resultEncrypt).rejects.toThrow("The private key should be decrypted.");
    });
  });
});
