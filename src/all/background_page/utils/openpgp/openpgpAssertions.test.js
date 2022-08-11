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
import {OpenpgpAssertion} from "./openpgpAssertions";
import * as openpgp from 'openpgp';


describe("OpenPGP Assertions", () => {
  describe("OpenPGP Assertions::readKeyOrFail", () => {
    it("Should return openpgp.PublicKey or openpgp.PrivateKey for every acceptable type", async() => {
      const scenarios = [
        {key: pgpKeys.ada.public, expectedType: openpgp.PublicKey},
        {key: pgpKeys.ada.private, expectedType: openpgp.PrivateKey},
        {key: pgpKeys.ada.private_decrypted, expectedType: openpgp.PrivateKey},
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        const readKey = await OpenpgpAssertion.readKeyOrFail(scenarios[i].key);
        expect(readKey).toBeInstanceOf(scenarios[i].expectedType);
      }
    });

    it("Should throw an Error if the input key is not valid", async() => {
      const openpgpMessage = await openpgp.createMessage({text: "passbolt message", format: 'utf8'});
      const expectedError = new Error("The key should be a valid openpgp armored key string.");
      const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const scenarios = [
        adaPublicKey,
        ":D",
        openpgpMessage,
        123123
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          await OpenpgpAssertion.readKeyOrFail(scenarios[i]);
        } catch (e) {
          expect(e).toStrictEqual(expectedError);
        }
      }
    });
  });

  describe("OpenPGP Assertions::readAllKeysOrFail", () => {
    it("Should return an array containing openpgp.PublicKey or openpgp.PrivateKey from an array of acceptable key type", async() => {
      const keyList = [
        pgpKeys.ada.public,
        pgpKeys.ada.private,
        pgpKeys.ada.private_decrypted,
      ];

      expect.assertions(keyList.length + 1);
      const readKeyList = await OpenpgpAssertion.readAllKeysOrFail(keyList);
      expect(readKeyList.length).toBe(keyList.length);

      for (let i = 0; i < readKeyList.length; i++) {
        const isOfExpectedType = readKeyList[i] instanceof openpgp.PublicKey || readKeyList[i] instanceof openpgp.PrivateKey;
        expect(isOfExpectedType).toBe(true);
      }
    });

    it("Should throw an Error if at least one of the key in the list is not valid", async() => {
      const invalidKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const validKey = pgpKeys.ada.public;
      const keyList = [validKey, invalidKey];

      expect.assertions(1);
      const promise = OpenpgpAssertion.readAllKeysOrFail(keyList);
      await expect(promise).rejects.toStrictEqual(new Error("The key should be a valid openpgp armored key string."));
    });
  });

  describe("OpenPGP Assertions::createMessageOrFail", () => {
    it("Should return an openpgp.Message given a string", async() => {
      const message = "passbolt message";
      expect.assertions(1);
      const readMessage = await OpenpgpAssertion.createMessageOrFail(message);
      expect(readMessage).toBeInstanceOf(openpgp.Message);
    });

    it("Should throw an Error if the input message is not valid", async() => {
      const expectedError = new Error("The message should be of type string.");
      const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const message = await OpenpgpAssertion.createMessageOrFail("Message");
      const scenarios = [
        1234,
        true,
        adaPublicKey,
        message,
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          await OpenpgpAssertion.createMessageOrFail(scenarios[i]);
        } catch (e) {
          expect(e).toStrictEqual(expectedError);
        }
      }
    });
  });

  describe("OpenPGP Assertions::readMessageOrFail", () => {
    it("Should return an openpgp.Message given an armored message string", async() => {
      const message = await OpenpgpAssertion.createMessageOrFail("Message");
      expect.assertions(1);
      const readMessage = await OpenpgpAssertion.readMessageOrFail(message.armor());
      expect(readMessage).toBeInstanceOf(openpgp.Message);
    });

    it("Should throw an Error if the input message is not valid", async() => {
      const expectedError = new Error("The message should be of type string.");
      const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const message = await OpenpgpAssertion.createMessageOrFail("Message");
      const scenarios = [
        1234,
        true,
        adaPublicKey,
        message,
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          await OpenpgpAssertion.readMessageOrFail(scenarios[i]);
        } catch (e) {
          expect(e).toStrictEqual(expectedError);
        }
      }
    });
  });

  describe("OpenPGP Assertions::assertKey", () => {
    it("Should validate if the key is an expected key type", async() => {
      const scenarios = await OpenpgpAssertion.readAllKeysOrFail([
        pgpKeys.ada.public,
        pgpKeys.ada.private,
        pgpKeys.ada.private_decrypted
      ]);

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        expect(OpenpgpAssertion.assertKey(scenarios[i])).toBeUndefined();
      }
    });

    it("Should throw an Error if the key is an not of an expected key type", () => {
      const expectedError = new Error("The key should be a valid openpgp key.");
      const scenarios = [
        1234,
        true,
        pgpKeys.ada.public
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          OpenpgpAssertion.assertKey(scenarios[i]);
        } catch (e) {
          expect(e).toStrictEqual(expectedError);
        }
      }
    });
  });

  describe("OpenPGP Assertions::assertKeys", () => {
    it("Should validate if all the keys are of an expected key type", async() => {
      const keys = await OpenpgpAssertion.readAllKeysOrFail([
        pgpKeys.ada.public,
        pgpKeys.ada.private,
        pgpKeys.ada.private_decrypted
      ]);

      expect.assertions(1);
      expect(OpenpgpAssertion.assertKeys(keys)).toBeUndefined();
    });

    it("Should throw an Error if a key is an not of an expected key type", async() => {
      const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const adaPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      const keys = [
        adaPublicKey,
        adaPrivateKey,
        "Fake key"
      ];

      expect.assertions(1);
      try {
        OpenpgpAssertion.assertKeys(keys);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The key should be a valid openpgp key."));
      }
    });

    it("Should throw an Error if the provided argument is not an array", async() => {
      expect.assertions(1);

      try {
        OpenpgpAssertion.assertKeys("keys");
      } catch (e) {
        expect(e).toStrictEqual(new Error("The keys should be an array."));
      }
    });
  });

  describe("OpenPGP Assertions::assertPublicKey", () => {
    it("Should validate if the key is an expected key type", async() => {
      expect.assertions(1);
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      expect(OpenpgpAssertion.assertPublicKey(key)).toBeUndefined();
    });

    it("Should throw an Error if the key is an not of an expected key type", async() => {
      const expectedError = new Error("The key should be a valid openpgp public key.");
      const adaPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      const message = await OpenpgpAssertion.createMessageOrFail("Message");
      const scenarios = [
        1234,
        true,
        adaPrivateKey,
        message,
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          OpenpgpAssertion.assertPublicKey(scenarios[i]);
        } catch (e) {
          expect(e).toStrictEqual(expectedError);
        }
      }
    });
  });

  describe("OpenPGP Assertions::assertPublicKeys", () => {
    it("Should validate if all the keys are of an expected key type", async() => {
      const readKeys = await OpenpgpAssertion.readAllKeysOrFail([
        pgpKeys.ada.public,
        pgpKeys.betty.public,
        pgpKeys.ecdsa_p521.public
      ]);

      expect.assertions(1);
      expect(OpenpgpAssertion.assertPublicKeys(readKeys)).toBeUndefined();
    });

    it("Should throw an Error if a key is an not of an expected key type", async() => {
      const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      const adaPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const readKeys = [
        adaPublicKey,
        adaPrivateKey,
        pgpKeys.ecdsa_p521.public
      ];

      expect.assertions(1);
      try {
        OpenpgpAssertion.assertPublicKeys(readKeys);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The key should be a valid openpgp public key."));
      }
    });

    it("Should throw an Error if the provided argument is not an array", async() => {
      expect.assertions(1);

      try {
        OpenpgpAssertion.assertPublicKeys("I'm not array :D");
      } catch (e) {
        expect(e).toStrictEqual(new Error("The keys should be an array of valid openpgp public keys."));
      }
    });
  });

  describe("OpenPGP Assertions::assertPrivateKey", () => {
    it("Should validate if the key is an expected key type", async() => {
      expect.assertions(1);
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      expect(OpenpgpAssertion.assertPrivateKey(key)).toBeUndefined();
    });

    it("Should throw an Error if the key is an not of an expected key type", async() => {
      const expectedError = new Error("The key should be a valid openpgp private key.");
      const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const message = await OpenpgpAssertion.createMessageOrFail("Message");
      const scenarios = [
        1234,
        true,
        adaPublicKey,
        message,
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          OpenpgpAssertion.assertPrivateKey(scenarios[i]);
        } catch (e) {
          expect(e).toStrictEqual(expectedError);
        }
      }
    });
  });

  describe("OpenPGP Assertions::assertPrivateKeys", () => {
    it("Should validate if all the keys are of an expected key type", async() => {
      const readKeys = await OpenpgpAssertion.readAllKeysOrFail([
        pgpKeys.ada.private,
        pgpKeys.betty.private,
        pgpKeys.betty.private_decrypted,
        pgpKeys.ecdsa_p521.private,
      ]);

      expect.assertions(1);
      expect(OpenpgpAssertion.assertPrivateKeys(readKeys)).toBeUndefined();
    });

    it("Should throw an Error if the key is an not of an expected key type", async() => {
      const adaPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      const bettyPrivateDecryptedKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const readKeys = [
        adaPrivateKey,
        bettyPrivateDecryptedKey,
        pgpKeys.ecdsa_p521.public
      ];

      expect.assertions(1);
      try {
        OpenpgpAssertion.assertPrivateKeys(readKeys);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The key should be a valid openpgp private key."));
      }
    });

    it("Should throw an Error if the provided argument is not an array", async() => {
      expect.assertions(1);
      try {
        OpenpgpAssertion.assertPrivateKeys("I'm not array :D");
      } catch (e) {
        expect(e).toStrictEqual(new Error("The keys should be an array of valid openpgp private keys."));
      }
    });
  });

  describe("OpenPGP Assertions::assertDecryptedPrivateKey", () => {
    it("Should validate if the key is an expected key type", async() => {
      expect.assertions(1);
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      expect(OpenpgpAssertion.assertDecryptedPrivateKey(key)).toBeUndefined();
    });

    it("Should throw an Error if the key is an not of an expected key type", async() => {
      const typeError = new Error("The key should be a valid openpgp private key.");
      const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const adaPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      const message = await OpenpgpAssertion.createMessageOrFail("Message");
      const scenarios = [
        {input: 1234, expectedError: typeError},
        {input: true, expectedError: typeError},
        {input: adaPublicKey, expectedError: typeError},
        {input: message, expectedError: typeError},
        {input: adaPrivateKey, expectedError: new Error("The private key should be decrypted.")},
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          OpenpgpAssertion.assertDecryptedPrivateKey(scenarios[i].input);
        } catch (e) {
          expect(e).toStrictEqual(scenarios[i].expectedError);
        }
      }
    });
  });

  describe("OpenPGP Assertions::assertDecryptedPrivateKeys", () => {
    it("Should validate if all the keys are of an expected key type", async() => {
      const readKeys = await OpenpgpAssertion.readAllKeysOrFail([
        pgpKeys.ada.private_decrypted,
        pgpKeys.betty.private_decrypted
      ]);

      expect.assertions(1);
      expect(OpenpgpAssertion.assertDecryptedPrivateKeys(readKeys)).toBeUndefined();
    });

    it("Should throw an Error if one of the key is not decrypted", async() => {
      const readKeys = await OpenpgpAssertion.readAllKeysOrFail([
        pgpKeys.ada.private_decrypted,
        pgpKeys.betty.private_decrypted,
        pgpKeys.ecdsa_p521.private,
      ]);

      expect.assertions(1);
      try {
        OpenpgpAssertion.assertDecryptedPrivateKeys(readKeys);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The private key should be decrypted."));
      }
    });

    it("Should throw an Error if one of the key is an not of an expected key type", async() => {
      const adaPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const bettyPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
      const readKeys = [adaPrivateKey, bettyPrivateKey, pgpKeys.ecdsa_p521.public];

      expect.assertions(1);
      try {
        OpenpgpAssertion.assertDecryptedPrivateKeys(readKeys);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The key should be a valid openpgp private key."));
      }
    });

    it("Should throw an Error if the provided argument is not an array", async() => {
      expect.assertions(1);
      try {
        OpenpgpAssertion.assertDecryptedPrivateKeys("I'm not array :D");
      } catch (e) {
        expect(e).toStrictEqual(new Error("The keys should be an array of valid decrypted openpgp private keys."));
      }
    });
  });

  describe("OpenPGP Assertions::assertEncryptedPrivateKey", () => {
    it("Should validate if the key is an expected key type", async() => {
      expect.assertions(1);
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      expect(OpenpgpAssertion.assertEncryptedPrivateKey(key)).toBeUndefined();
    });

    it("Should throw an Error if the key is an not of an expected key type", async() => {
      const typeError = new Error("The key should be a valid openpgp private key.");
      const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const adaPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const message = await OpenpgpAssertion.createMessageOrFail("Message");
      const scenarios = [
        {input: 1234, expectedError: typeError},
        {input: true, expectedError: typeError},
        {input: adaPublicKey, expectedError: typeError},
        {input: message, expectedError: typeError},
        {input: adaPrivateKey, expectedError: new Error("The private key should be encrypted.")},
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          OpenpgpAssertion.assertEncryptedPrivateKey(scenarios[i].input);
        } catch (e) {
          expect(e).toStrictEqual(scenarios[i].expectedError);
        }
      }
    });
  });

  describe("OpenPGP Assertions::assertEncryptedPrivateKeys", () => {
    it("Should validate if all the keys are of an expected key type", async() => {
      const readKeys = await OpenpgpAssertion.readAllKeysOrFail([
        pgpKeys.ada.private,
        pgpKeys.betty.private
      ]);

      expect.assertions(1);
      expect(OpenpgpAssertion.assertEncryptedPrivateKeys(readKeys)).toBeUndefined();
    });

    it("Should throw an Error if one of the key is not encrypted", async() => {
      const readKeys = await OpenpgpAssertion.readAllKeysOrFail([
        pgpKeys.ada.private,
        pgpKeys.betty.private,
        pgpKeys.ada.private_decrypted,
      ]);

      expect.assertions(1);
      try {
        OpenpgpAssertion.assertEncryptedPrivateKeys(readKeys);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The private key should be encrypted."));
      }
    });

    it("Should throw an Error if one of the key is an not of an expected key type", async() => {
      const readKeys = await OpenpgpAssertion.readAllKeysOrFail([
        pgpKeys.ada.private,
        pgpKeys.betty.private,
        pgpKeys.ecdsa_p521.public
      ]);

      expect.assertions(1);
      try {
        OpenpgpAssertion.assertEncryptedPrivateKeys(readKeys);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The key should be a valid openpgp private key."));
      }
    });

    it("Should throw an Error if the provided argument is not an array", async() => {
      expect.assertions(1);
      try {
        OpenpgpAssertion.assertEncryptedPrivateKeys("I'm not array :D");
      } catch (e) {
        expect(e).toStrictEqual(new Error("The keys should be an array of valid encrypted openpgp private keys."));
      }
    });
  });

  describe("OpenPGP Assertions::assertMessage", () => {
    it("Should validate if the message is of an expected key type", async() => {
      const readMessage = await OpenpgpAssertion.createMessageOrFail("Message");
      expect.assertions(1);
      expect(readMessage).toBeInstanceOf(openpgp.Message);
    });

    it("Should throw an Error if the key is an not of an expected key type", async() => {
      const expectedError = new Error("The message should be a valid openpgp message.");
      const adaPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
      const scenarios = [
        1234,
        true,
        pgpKeys.ada.public,
        adaPrivateKey
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          OpenpgpAssertion.assertMessage(scenarios[i]);
        } catch (e) {
          expect(e).toStrictEqual(expectedError);
        }
      }
    });
  });
});
