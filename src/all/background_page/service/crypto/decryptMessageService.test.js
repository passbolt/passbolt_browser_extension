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

/**
 * Unit tests on DecryptMessageService in regard of specifications
 */

import DecryptMessageService from "./decryptMessageService";
import EncryptMessageService from "./encryptMessageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import * as openpgp from "openpgp";
import GetSessionKeyService from "./getSessionKeyService";

describe("DecryptMessageService", () => {
  describe("DecryptMessageService::decryptSymmetrically", () => {
    it("should decrypt a message", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decryptSymmetrically(messageEncrypted, password);
      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify a signature", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password], [signingKey]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decryptSymmetrically(messageEncrypted, password, [verifyingKey]);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify multiple signatures", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const verifyingKeyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const verifyingKeyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password], [signingKeyUserA, signingKeyUserB]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decryptSymmetrically(messageEncrypted, password, [verifyingKeyA, verifyingKeyB]);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should throw an error if it cannot decrypt a message", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = DecryptMessageService.decryptSymmetrically(messageEncrypted, "wrong-password");

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow();
    }, 10 * 1000);

    it("should throw an error if it cannot verify a signature", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password], [signingKey]);
      const verfificationKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = DecryptMessageService.decryptSymmetrically(messageEncrypted, password, [verfificationKey]);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("Could not find signing key with key ID 1353b5b15d9b054f");
    }, 10 * 1000);

    it("should throw an error if it cannot verify one of among multiple signatures", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const verifyingKeyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password], [signingKeyUserA, signingKeyUserB]);
      const verifyingKeyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = DecryptMessageService.decryptSymmetrically(messageEncrypted, password, [verifyingKeyA, verifyingKeyB]);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("Could not find signing key with key ID d3f1fe4be61d7009");
    }, 10 * 1000);
  });

  describe("DecryptMessageService::decrypt", () => {
    it("should decrypt a message", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify a signature", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKey]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey, [verifyingKey]);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify multiple signatures", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const verifyingKeyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const verifyingKeyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey, [verifyingKeyA, verifyingKeyB]);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and return the raw result with options returnOnlyData to false", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const verifyingKeyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const verifyingKeyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey, [verifyingKeyA, verifyingKeyB], {
        returnOnlyData: false
      });

      expect.assertions(3);
      expect(resultDecrypt.signatures).toBeDefined();
      expect(resultDecrypt.data).toEqual(messageClear);
      expect(resultDecrypt.filename).toBeNull();
    }, 10 * 1000);

    it("should throw an error if it cannot decrypt a message", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = DecryptMessageService.decrypt(messageEncrypted, privateKey);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow();
    }, 10 * 1000);

    it("should throw an error if it cannot verify a signature", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKey]);
      const verfificationKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = DecryptMessageService.decrypt(messageEncrypted, privateKey, [verfificationKey]);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("Could not find signing key with key ID d3f1fe4be61d7009");
    }, 10 * 1000);

    it("should not throw an error if it cannot verify a signature and options throwOnInvalidSignaturesVerification is false", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKey]);
      const verfificationKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey, [verfificationKey], {
        throwOnInvalidSignaturesVerification: false
      });

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should not throw an error if the message is signed but no verification key is passed while decrypting", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKey]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should throw an error if it cannot verify one of among multiple signatures", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const verifyingKeyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);
      const verifyingKeyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = DecryptMessageService.decrypt(messageEncrypted, privateKey, [verifyingKeyA, verifyingKeyB]);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("Could not find signing key with key ID d3f1fe4be61d7009");
    }, 10 * 1000);
  });

  describe("DecryptMessageService::decryptWithSessionKey", () => {
    it("should decrypt a message with session key", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      // Encrypt and decrypt to get the session key
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const messageEncrypted2 = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey);
      // Create the session key from the messageEncrypted decrypted
      const sessionKey = {};
      sessionKey.data = messageEncrypted.packets[0].sessionKey;
      sessionKey.algorithm = openpgp.enums.read(openpgp.enums.symmetric, messageEncrypted.packets[0].sessionKeyAlgorithm);
      const resultDecrypt2 = await DecryptMessageService.decryptWithSessionKey(messageEncrypted2, sessionKey);

      expect.assertions(3);
      expect(resultDecrypt).toEqual(messageClear);
      expect(resultDecrypt2).toEqual(messageClear);
      expect(resultDecrypt).toEqual(resultDecrypt2);
    }, 10 * 1000);

    it("should decrypt a message with session key and verify a signature", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      // Encrypt and decrypt to get the session key
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKey]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const messageEncrypted2 = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey, [verifyingKey]);
      // Get the session key from the messageEncrypted decrypted
      const sessionKeyString = GetSessionKeyService.getFromGpgMessage(messageEncrypted);
      const sessionKey = OpenpgpAssertion.readSessionKeyOrFail(sessionKeyString);
      const resultDecrypt2 = await DecryptMessageService.decryptWithSessionKey(messageEncrypted2, sessionKey, [verifyingKey]);

      expect.assertions(3);
      expect(resultDecrypt).toEqual(messageClear);
      expect(resultDecrypt2).toEqual(messageClear);
      expect(resultDecrypt).toEqual(resultDecrypt2);
    }, 10 * 1000);

    it("should decrypt a message with session key and verify multiple signatures", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const verifyingKeyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const verifyingKeyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      // Encrypt and decrypt to get the session key
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const messageEncrypted2 = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const resultDecrypt = await DecryptMessageService.decrypt(messageEncrypted, privateKey, [verifyingKeyA, verifyingKeyB]);
      // Get the session key from the messageEncrypted decrypted
      const sessionKeyString = GetSessionKeyService.getFromGpgMessage(messageEncrypted);
      const sessionKey = OpenpgpAssertion.readSessionKeyOrFail(sessionKeyString);
      const resultDecrypt2 = await DecryptMessageService.decryptWithSessionKey(messageEncrypted2, sessionKey, [verifyingKeyA, verifyingKeyB]);

      expect.assertions(3);
      expect(resultDecrypt).toEqual(messageClear);
      expect(resultDecrypt2).toEqual(messageClear);
      expect(resultDecrypt).toEqual(resultDecrypt2);
    }, 10 * 1000);

    it("should throw an error if it cannot decrypt another message encrypted with session key", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      // Encrypt and decrypt to get the session key
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      await DecryptMessageService.decrypt(messageEncrypted, privateKey);
      // Get the session key from the messageEncrypted decrypted
      const sessionKeyString = GetSessionKeyService.getFromGpgMessage(messageEncrypted);
      const sessionKey = OpenpgpAssertion.readSessionKeyOrFail(sessionKeyString);
      // Encrypt another message
      const messageEncryptedArmored2 = await EncryptMessageService.encrypt(messageClear, publicKey);
      const messageEncrypted2 = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored2);
      const resultDecrypt2 = DecryptMessageService.decryptWithSessionKey(messageEncrypted2, sessionKey);

      expect.assertions(1);
      await expect(resultDecrypt2).rejects.toThrow();
    }, 10 * 1000);

    it("should throw an error if it cannot verify a signature", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      // Encrypt and decrypt to get the session key
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKey]);
      const verfificationKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const messageEncrypted2 = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      await DecryptMessageService.decrypt(messageEncrypted, privateKey);
      // Get the session key from the messageEncrypted decrypted
      const sessionKeyString = GetSessionKeyService.getFromGpgMessage(messageEncrypted);
      const sessionKey = OpenpgpAssertion.readSessionKeyOrFail(sessionKeyString);
      const resultDecrypt2 = DecryptMessageService.decryptWithSessionKey(messageEncrypted2, sessionKey, [verfificationKey]);
      expect.assertions(1);
      await expect(resultDecrypt2).rejects.toThrow("Could not find signing key with key ID d3f1fe4be61d7009");
    }, 10 * 1000);

    it("should throw an error if it cannot verify one of among multiple signatures", async() => {
      const messageClear = "message clear";
      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const signingKeyUserA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const signingKeyUserB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const verifyingKeyA = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      // Encrypt and decrypt to get the session key
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);
      const verifyingKeyB = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
      const messageEncrypted = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      const messageEncrypted2 = await OpenpgpAssertion.readMessageOrFail(messageEncryptedArmored);
      await DecryptMessageService.decrypt(messageEncrypted, privateKey);
      // Get the session key from the messageEncrypted decrypted
      const sessionKeyString = GetSessionKeyService.getFromGpgMessage(messageEncrypted);
      const sessionKey = OpenpgpAssertion.readSessionKeyOrFail(sessionKeyString);
      const resultDecrypt2 = DecryptMessageService.decryptWithSessionKey(messageEncrypted2, sessionKey, [verifyingKeyA, verifyingKeyB]);

      expect.assertions(1);
      await expect(resultDecrypt2).rejects.toThrow("Could not find signing key with key ID d3f1fe4be61d7009");
    }, 10 * 1000);
  });
});
