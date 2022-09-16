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

import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import DecryptMessageService from "./decryptMessageService";
import EncryptMessageService from "./encryptMessageService";
import * as openpgp from 'openpgp';

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
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const resultEncrypt = await EncryptMessageService.encryptSymmetrically(messageClear, [encryptPassword], [signingKey]);
      expect.assertions(4);
      expect(resultEncrypt).toBeTruthy();
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(resultEncrypt);
      const resultDecrypt = await openpgp.decrypt({
        message: messageEncrypted,
        passwords: [encryptPassword],
        verificationKeys: [signingKey]
      });
      expect(resultDecrypt).not.toBeNull();
      expect(resultDecrypt.data).toEqual(messageClear);
      expect(await resultDecrypt.signatures[0].verified).toBeTruthy();
    }, 10 * 1000);

    it("should encrypt symmetrically and sign with multiple keys", async() => {
      const messageClear = "message clear";
      const encryptPassword = "encrypt-password";
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const resultEncrypt = await EncryptMessageService.encryptSymmetrically(messageClear, [encryptPassword], [signingKeyUserA, signingKeyUserB]);

      expect.assertions(5);
      expect(resultEncrypt).toBeTruthy();
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(resultEncrypt);
      const resultDecrypt = await openpgp.decrypt({
        message: messageEncrypted,
        passwords: [encryptPassword],
        verificationKeys: [signingKeyUserA, signingKeyUserB]
      });
      expect(resultDecrypt).not.toBeNull();
      expect(resultDecrypt.data).toEqual(messageClear);
      expect(await resultDecrypt.signatures[0].verified).toBeTruthy();
      expect(await resultDecrypt.signatures[1].verified).toBeTruthy();
    }, 10 * 1000);

    it("should throw an error if the signing key is not a valid decrypted openpgp key", async() => {
      const messageClear = "message clear";
      const encryptPassword = "encrypt-password";
      const signKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      const resultEncryptPromise = EncryptMessageService.encryptSymmetrically(messageClear, [encryptPassword], [signKey]);

      expect.assertions(1);
      await expect(resultEncryptPromise).rejects.toThrow("The private key should be decrypted.");
    });
  });

  describe("EncryptMessageService::encrypt", () => {
    it("should encrypt asymmetrically", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);

      const resultEncrypt = await EncryptMessageService.encrypt(messageClear, publicKey);
      expect.assertions(2);
      expect(resultEncrypt).toBeTruthy();
      const privateDecryptedKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(resultEncrypt);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateDecryptedKey);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should encrypt asymmetrically and sign with one key", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);

      const resultEncrypt = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKey]);

      expect.assertions(2);
      expect(resultEncrypt).toBeTruthy();
      const verificationKeys = [await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public)];
      const privateDecryptedKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(resultEncrypt);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateDecryptedKey, verificationKeys);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should encrypt asymmetrically and sign with multiple keys", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);

      const resultEncrypt = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);

      expect.assertions(2);
      expect(resultEncrypt).toBeTruthy();
      const verificationKeys = [signingKeyUserA, signingKeyUserB];
      const privateDecryptedKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(resultEncrypt);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateDecryptedKey, verificationKeys);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should throw an error if the signing key is not a valid decrypted openpgp key", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      const resultEncrypt = EncryptMessageService.encrypt(messageClear, publicKey, [signingKey]);

      expect.assertions(1);
      await expect(resultEncrypt).rejects.toThrow("The private key should be decrypted.");
    });
  });
});
