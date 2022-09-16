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
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

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
});
