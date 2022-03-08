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

import {DecryptMessageService} from "./decryptMessageService";
import {EncryptMessageService} from "./encryptMessageService";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";

describe("DecryptMessageService", () => {
  describe("DecryptMessageService::decryptSymmetrically", () => {
    it("should decrypt a message", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password]);

      const resultDecrypt = await DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, password);
      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify a signature", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKey = pgpKeys.ada.private_decrypted;
      const verifyingKey = pgpKeys.ada.private;
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password], signingKey);

      const resultDecrypt = await DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, password, verifyingKey);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify multiple signatures", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKeyUserA = pgpKeys.ada.private_decrypted;
      const signingKeyUserB = pgpKeys.betty.private_decrypted;
      const verifyingKeyA = pgpKeys.ada.private_decrypted;
      const verifyingKeyB = pgpKeys.betty.public;
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password], [signingKeyUserA, signingKeyUserB]);

      const resultDecrypt = await DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, password, [verifyingKeyA, verifyingKeyB]);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should throw an error if it cannot decrypt a message", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password]);

      const resultDecrypt = DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, "wrong-password");

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow();
    }, 10 * 1000);

    it("should throw an error if it cannot verify a signature", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKey = pgpKeys.ada.private_decrypted;
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password], signingKey);

      const resultDecrypt = DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, password, pgpKeys.admin.public);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("Could not find signing key with key ID 1353b5b15d9b054f");
    }, 10 * 1000);

    it("should throw an error if it cannot verify one of among multiple signatures", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKeyUserA = pgpKeys.ada.private_decrypted;
      const signingKeyUserB = pgpKeys.betty.private_decrypted;
      const verifyingKeyA = pgpKeys.ada.private_decrypted;
      const messageEncryptedArmored = await EncryptMessageService.encryptSymmetrically(messageClear, [password], [signingKeyUserA, signingKeyUserB]);

      const resultDecrypt = DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, password, [verifyingKeyA, pgpKeys.admin.public]);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("Could not find signing key with key ID d3f1fe4be61d7009");
    }, 10 * 1000);
  });

  describe("DecryptMessageService::decrypt", () => {
    it("should decrypt a message", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.betty.private_decrypted;
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey);

      const resultDecrypt = await DecryptMessageService.decrypt(messageEncryptedArmored, privateKey);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify a signature", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.betty.private_decrypted;
      const signingKey = pgpKeys.ada.private_decrypted;
      const verifyingKey = pgpKeys.ada.public;
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, signingKey);

      const resultDecrypt = await DecryptMessageService.decrypt(messageEncryptedArmored, privateKey, verifyingKey);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify multiple signatures", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.betty.private_decrypted;
      const signingKeyUserA = pgpKeys.ada.private_decrypted;
      const signingKeyUserB = pgpKeys.betty.private_decrypted;
      const verifyingKeyA = pgpKeys.ada.public;
      const verifyingKeyB = pgpKeys.betty.public;
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);

      const resultDecrypt = await DecryptMessageService.decrypt(messageEncryptedArmored, privateKey, [verifyingKeyA, verifyingKeyB]);

      expect.assertions(1);
      expect(resultDecrypt).toEqual(messageClear);
    }, 10 * 1000);

    it("should throw an error if it cannot decrypt a message", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.ada.private_decrypted;
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey);

      const resultDecrypt = DecryptMessageService.decrypt(messageEncryptedArmored, privateKey);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow();
    }, 10 * 1000);

    it("should throw an error if it cannot verify a signature", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.betty.private_decrypted;
      const signingKey = pgpKeys.betty.private_decrypted;
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, signingKey);

      const resultDecrypt = DecryptMessageService.decrypt(messageEncryptedArmored, privateKey, pgpKeys.admin.public);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("Could not find signing key with key ID d3f1fe4be61d7009");
    }, 10 * 1000);

    it("should throw an error if it cannot verify one of among multiple signatures", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.betty.private_decrypted;
      const signingKeyUserA = pgpKeys.ada.private_decrypted;
      const signingKeyUserB = pgpKeys.betty.private_decrypted;
      const verifyingKeyA = pgpKeys.ada.private_decrypted;
      const messageEncryptedArmored = await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB]);

      const resultDecrypt = DecryptMessageService.decrypt(messageEncryptedArmored, privateKey, [verifyingKeyA, pgpKeys.admin.public]);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("Could not find signing key with key ID d3f1fe4be61d7009");
    }, 10 * 1000);
  });
});
