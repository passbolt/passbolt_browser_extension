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
      const messageEncryptedArmored = (await EncryptMessageService.encryptSymmetrically(messageClear, [password])).data;

      const resultDecrypt = await DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, [password]);

      expect.assertions(1);
      expect(resultDecrypt?.data).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify a signature", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKey = pgpKeys.ada.private_decrypted;
      const messageEncryptedArmored = (await EncryptMessageService.encryptSymmetrically(messageClear, [password], signingKey)).data;

      const resultDecrypt = await DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, [password], signingKey);

      expect.assertions(1);
      expect(resultDecrypt?.data).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify multiple signatures", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKeyUserA = pgpKeys.ada.private_decrypted;
      const signingKeyUserB = pgpKeys.betty.private_decrypted;
      const messageEncryptedArmored = (await EncryptMessageService.encryptSymmetrically(messageClear, [password], [signingKeyUserA, signingKeyUserB])).data;

      const resultDecrypt = await DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, [password], [signingKeyUserA, signingKeyUserB]);

      expect.assertions(1);
      expect(resultDecrypt?.data).toEqual(messageClear);
    }, 10 * 1000);

    it("should throw an error if it cannot decrypt a message", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const messageEncryptedArmored = (await EncryptMessageService.encryptSymmetrically(messageClear, [password])).data;

      const resultDecrypt = DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, ["wrong-password"]);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow();
    }, 10 * 1000);

    it("should throw an error if it cannot verify a signature", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKey = pgpKeys.ada.private_decrypted;
      const messageEncryptedArmored = (await EncryptMessageService.encryptSymmetrically(messageClear, [password], signingKey)).data;

      const resultDecrypt = DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, [password], pgpKeys.admin.public);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("The signature(s) cannot be verified.");
    }, 10 * 1000);

    it("should throw an error if it cannot verify one of among multiple signatures", async() => {
      const messageClear = "message clear";
      const password = "bim bam boom";
      const signingKeyUserA = pgpKeys.ada.private_decrypted;
      const signingKeyUserB = pgpKeys.betty.private_decrypted;
      const messageEncryptedArmored = (await EncryptMessageService.encryptSymmetrically(messageClear, [password], [signingKeyUserA, signingKeyUserB])).data;

      const resultDecrypt = DecryptMessageService.decryptSymmetrically(messageEncryptedArmored, [password], [signingKeyUserA, pgpKeys.admin.public]);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("The signature(s) cannot be verified.");
    }, 10 * 1000);
  });

  describe("DecryptMessageService::decrypt", () => {
    it("should decrypt a message", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.betty.private_decrypted;
      const messageEncryptedArmored = (await EncryptMessageService.encrypt(messageClear, publicKey)).data;

      const resultDecrypt = await DecryptMessageService.decrypt(messageEncryptedArmored, privateKey);

      expect.assertions(1);
      expect(resultDecrypt?.data).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify a signature", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.betty.private_decrypted;
      const signingKey = pgpKeys.ada.private_decrypted;
      const messageEncryptedArmored = (await EncryptMessageService.encrypt(messageClear, publicKey, signingKey)).data;

      const resultDecrypt = await DecryptMessageService.decrypt(messageEncryptedArmored, privateKey, signingKey);

      expect.assertions(1);
      expect(resultDecrypt?.data).toEqual(messageClear);
    }, 10 * 1000);

    it("should decrypt a message and verify multiple signatures", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.betty.private_decrypted;
      const signingKeyUserA = pgpKeys.ada.private_decrypted;
      const signingKeyUserB = pgpKeys.betty.private_decrypted;
      const messageEncryptedArmored = (await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB])).data;

      const resultDecrypt = await DecryptMessageService.decrypt(messageEncryptedArmored, privateKey, [signingKeyUserA, signingKeyUserB]);

      expect.assertions(1);
      expect(resultDecrypt?.data).toEqual(messageClear);
    }, 10 * 1000);

    it("should throw an error if it cannot decrypt a message", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.ada.private_decrypted;
      const messageEncryptedArmored = (await EncryptMessageService.encrypt(messageClear, publicKey)).data;

      const resultDecrypt = DecryptMessageService.decrypt(messageEncryptedArmored, privateKey);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow();
    }, 10 * 1000);

    it("should throw an error if it cannot verify a signature", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.betty.private_decrypted;
      const signingKey = pgpKeys.betty.private_decrypted;
      const messageEncryptedArmored = (await EncryptMessageService.encrypt(messageClear, publicKey, signingKey)).data;

      const resultDecrypt = DecryptMessageService.decrypt(messageEncryptedArmored, privateKey, pgpKeys.admin.public);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("The signature(s) cannot be verified.");
    }, 10 * 1000);

    it("should throw an error if it cannot verify one of among multiple signatures", async() => {
      const messageClear = "message clear";
      const publicKey = pgpKeys.betty.public;
      const privateKey = pgpKeys.betty.private_decrypted;
      const signingKeyUserA = pgpKeys.ada.private_decrypted;
      const signingKeyUserB = pgpKeys.betty.private_decrypted;
      const messageEncryptedArmored = (await EncryptMessageService.encrypt(messageClear, publicKey, [signingKeyUserA, signingKeyUserB])).data;

      const resultDecrypt = DecryptMessageService.decrypt(messageEncryptedArmored, privateKey, [signingKeyUserA, pgpKeys.admin.public]);

      expect.assertions(1);
      await expect(resultDecrypt).rejects.toThrow("The signature(s) cannot be verified.");
    }, 10 * 1000);
  });
});
