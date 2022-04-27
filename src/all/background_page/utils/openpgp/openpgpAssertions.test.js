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
import {
  assertKeys,
  assertPrivateKeys,
  assertDecryptedPrivateKeys,
  assertEncryptedPrivateKeys,
  assertPublicKeys,
  assertMessageToEncrypt,
  assertEncryptedMessage
} from "./openpgpAssertions";

describe("OpenPGP Assertions", () => {
  describe("OpenPGP Assertions::assertPublicKeys", () => {
    it("Should return openpgp.PublicKey or openpgp.PrivateKey for every acceptable type", async() => {
      const publicOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.public});
      const privateOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private});
      const privateDecryptedOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private_decrypted});

      const scenarios = [
        {key: publicOpenpgpKey, expectedType: openpgp.PublicKey},
        {key: privateOpenpgpKey, expectedType: openpgp.PrivateKey},
        {key: privateDecryptedOpenpgpKey, expectedType: openpgp.PrivateKey},

        {key: pgpKeys.ada.public, expectedType: openpgp.PublicKey},
        {key: pgpKeys.ada.private, expectedType: openpgp.PrivateKey},
        {key: pgpKeys.ada.private_decrypted, expectedType: openpgp.PrivateKey},
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        const readKey = await assertKeys(scenarios[i].key);
        expect(readKey).toBeInstanceOf(scenarios[i].expectedType);
      }
    });

    it("Should return an array containing openpgp.PublicKey and openpgp.PrivateKey from an array of acceptable key type", async() => {
      const publicOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.public});
      const privateOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private});
      const privateDecryptedOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private_decrypted});

      const keyList = [
        publicOpenpgpKey,
        privateOpenpgpKey,
        privateDecryptedOpenpgpKey,
        pgpKeys.ada.public,
        pgpKeys.ada.private,
        pgpKeys.ada.private_decrypted,
      ];

      expect.assertions(keyList.length + 1);
      const readKeyList = await assertKeys(keyList);

      expect(readKeyList.length).toBe(keyList.length);
      for (let i = 0; i < readKeyList.length; i++) {
        const isOfExpectedType = readKeyList[i] instanceof openpgp.PublicKey || readKeyList[i] instanceof openpgp.PrivateKey;
        expect(isOfExpectedType).toBe(true);
      }
    });

    it("Should throw an Error if the input key is not valid", async() => {
      const openpgpMessage = await openpgp.createMessage({text: "passbolt message", format: 'utf8'});
      const scenarios = [
        {input: ":D", expectedError: new Error("The key should be a valid armored key or a valid openpgp key.")},
        {input: openpgpMessage, expectedError: new Error("The key should be a valid armored key or a valid openpgp key.")},
        {input: 123123, expectedError: new Error("The key should be a valid armored key or a valid openpgp key.")}
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          await assertKeys(scenarios[i].input);
        } catch (e) {
          expect(e).toStrictEqual(scenarios[i].expectedError);
        }
      }
    });

    it("Should throw an Error if at least one of the key in the list is not valid", async() => {
      const invalidKey = await openpgp.createMessage({text: "passbolt message", format: 'utf8'});
      const validKey = pgpKeys.ada.public;
      const keyList = [validKey, invalidKey];

      expect.assertions(1);
      try {
        await assertKeys(keyList);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The key should be a valid armored key or a valid openpgp key."));
      }
    });
  });

  describe("OpenPGP Assertions::assertPublicKeys", () => {
    it("Should return openpgp.PublicKey for every acceptable type", async() => {
      const openpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.public});
      const scenarios = [pgpKeys.ada.public, openpgpKey];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        const readKey = await assertPublicKeys(scenarios[i]);
        expect(readKey).toBeInstanceOf(openpgp.PublicKey);
      }
    });

    it("Should return an array of openpgp.PublicKey from an array of acceptable publicKey type", async() => {
      const openpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.public});
      const publicKeys = [pgpKeys.ada.public, openpgpKey];

      expect.assertions(publicKeys.length + 1);
      const readKeys = await assertPublicKeys(publicKeys);

      expect(readKeys.length).toBe(publicKeys.length);
      for (let i = 0; i < readKeys.length; i++) {
        expect(readKeys[i]).toBeInstanceOf(openpgp.PublicKey);
      }
    });

    it("Should throw an Error if the input public key is not valid", async() => {
      const privateOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private});

      const scenarios = [
        {input: ":D", expectedError: new Error("The key should be a valid armored key or a valid openpgp key.")},
        {input: privateOpenpgpKey, expectedError: new Error("The key should be public.")},
        {input: pgpKeys.ada.private, expectedError: new Error("The key should be public.")}
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          await assertPublicKeys(scenarios[i].input);
        } catch (e) {
          expect(e).toStrictEqual(scenarios[i].expectedError);
        }
      }
    });

    it("Should throw an Error if at least one of the key in the list is not a valid public key", async() => {
      const invalidPublicKey = pgpKeys.ada.private;
      const validPublicKey = pgpKeys.ada.public;
      const keyList = [validPublicKey, invalidPublicKey];

      expect.assertions(1);
      try {
        await assertPublicKeys(keyList);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The key should be public."));
      }
    });
  });

  describe("OpenPGP Assertions::assertPrivateKeys", () => {
    it("Should return openpgp.PrivateKey for every acceptable type", async() => {
      const openpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private});
      const openpgpDecryptedKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private_decrypted});
      const scenarios = [
        pgpKeys.ada.private,
        openpgpKey,
        pgpKeys.ada.private_decrypted,
        openpgpDecryptedKey
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        const readKey = await assertPrivateKeys(scenarios[i]);
        expect(readKey).toBeInstanceOf(openpgp.PrivateKey);
      }
    });

    it("Should return an array of openpgp.PrivateKey from an array of acceptable privateKey type", async() => {
      const openpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private});
      const privateKeys = [pgpKeys.ada.private, openpgpKey];

      expect.assertions(privateKeys.length + 1);
      const readKeys = await assertPrivateKeys(privateKeys);

      expect(readKeys.length).toBe(privateKeys.length);
      for (let i = 0; i < readKeys.length; i++) {
        expect(readKeys[i]).toBeInstanceOf(openpgp.PrivateKey);
      }
    });

    it("Should throw an Error if the input private key is not valid", async() => {
      const publicOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.public});

      const scenarios = [
        {input: ":D", expectedError: new Error("The key should be a valid armored key or a valid openpgp key.")},
        {input: publicOpenpgpKey, expectedError: new Error("The key should be private.")},
        {input: pgpKeys.ada.public, expectedError: new Error("The key should be private.")}
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          await assertPrivateKeys(scenarios[i].input);
        } catch (e) {
          expect(e).toStrictEqual(scenarios[i].expectedError);
        }
      }
    });

    it("Should throw an Error if at least one of the key in the list is not a valid private key", async() => {
      const invalidPublicKey = pgpKeys.ada.public;
      const validPublicKey = pgpKeys.ada.private;
      const keyList = [validPublicKey, invalidPublicKey];

      expect.assertions(1);
      try {
        await assertPrivateKeys(keyList);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The key should be private."));
      }
    });
  });

  describe("OpenPGP Assertions::assertDecryptedPrivateKeys", () => {
    it("Should return openpgp.PrivateKey for every acceptable type", async() => {
      const openpgpDecryptedKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private_decrypted});
      const scenarios = [
        pgpKeys.ada.private_decrypted,
        openpgpDecryptedKey
      ];

      expect.assertions(scenarios.length * 2);
      for (let i = 0; i < scenarios.length; i++) {
        const readKey = await assertDecryptedPrivateKeys(scenarios[i]);
        expect(readKey).toBeInstanceOf(openpgp.PrivateKey);
        expect(readKey.isDecrypted()).toBe(true);
      }
    });

    it("Should return an array of openpgp.PrivateKey from an array of acceptable privateKey type", async() => {
      const openpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private_decrypted});
      const privateKeys = [pgpKeys.ada.private_decrypted, openpgpKey];

      expect.assertions((privateKeys.length * 2) + 1);
      const readKeys = await assertDecryptedPrivateKeys(privateKeys);

      expect(readKeys.length).toBe(privateKeys.length);
      for (let i = 0; i < readKeys.length; i++) {
        expect(readKeys[i]).toBeInstanceOf(openpgp.PrivateKey);
        expect(readKeys[i].isDecrypted()).toBe(true);
      }
    });

    it("Should throw an Error if the input private key is not valid", async() => {
      const publicOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.public});
      const privateEncryptedOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private});

      const scenarios = [
        {input: ":D", expectedError: new Error("The key should be a valid armored key or a valid openpgp key.")},
        {input: publicOpenpgpKey, expectedError: new Error("The key should be private.")},
        {input: pgpKeys.ada.public, expectedError: new Error("The key should be private.")},
        {input: pgpKeys.ada.private, expectedError: new Error("The private key should be decrypted.")},
        {input: privateEncryptedOpenpgpKey, expectedError: new Error("The private key should be decrypted.")}
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          await assertDecryptedPrivateKeys(scenarios[i].input);
        } catch (e) {
          expect(e).toStrictEqual(scenarios[i].expectedError);
        }
      }
    });

    it("Should throw an Error if at least one of the key in the list is not a valid private key", async() => {
      const invalidPublicKey = pgpKeys.ada.private;
      const validPublicKey = pgpKeys.ada.private_decrypted;
      const keyList = [validPublicKey, invalidPublicKey];

      expect.assertions(1);
      try {
        await assertDecryptedPrivateKeys(keyList);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The private key should be decrypted."));
      }
    });
  });

  describe("OpenPGP Assertions::assertEncryptedPrivateKeys", () => {
    it("Should return openpgp.PrivateKey for every acceptable type", async() => {
      const openpgpDecryptedKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private});
      const scenarios = [
        pgpKeys.ada.private,
        openpgpDecryptedKey
      ];

      expect.assertions(scenarios.length * 2);
      for (let i = 0; i < scenarios.length; i++) {
        const readKey = await assertEncryptedPrivateKeys(scenarios[i]);
        expect(readKey).toBeInstanceOf(openpgp.PrivateKey);
        expect(readKey.isDecrypted()).toBe(false);
      }
    });

    it("Should return an array of openpgp.PrivateKey from an array of acceptable privateKey type", async() => {
      const openpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private});
      const privateKeys = [pgpKeys.ada.private, openpgpKey];

      expect.assertions((privateKeys.length * 2) + 1);
      const readKeys = await assertEncryptedPrivateKeys(privateKeys);

      expect(readKeys.length).toBe(privateKeys.length);
      for (let i = 0; i < readKeys.length; i++) {
        expect(readKeys[i]).toBeInstanceOf(openpgp.PrivateKey);
        expect(readKeys[i].isDecrypted()).toBe(false);
      }
    });

    it("Should throw an Error if the input private key is not valid", async() => {
      const publicOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.public});
      const privateDecryptedOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private_decrypted});

      const scenarios = [
        {input: ":D", expectedError: new Error("The key should be a valid armored key or a valid openpgp key.")},
        {input: publicOpenpgpKey, expectedError: new Error("The key should be private.")},
        {input: pgpKeys.ada.public, expectedError: new Error("The key should be private.")},
        {input: pgpKeys.ada.private_decrypted, expectedError: new Error("The private key should not be decrypted.")},
        {input: privateDecryptedOpenpgpKey, expectedError: new Error("The private key should not be decrypted.")}
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          await assertEncryptedPrivateKeys(scenarios[i].input);
        } catch (e) {
          expect(e).toStrictEqual(scenarios[i].expectedError);
        }
      }
    });

    it("Should throw an Error if at least one of the key in the list is not a valid private key", async() => {
      const invalidPublicKey = pgpKeys.ada.private_decrypted;
      const validPublicKey = pgpKeys.ada.private;
      const keyList = [validPublicKey, invalidPublicKey];

      expect.assertions(1);
      try {
        await assertEncryptedPrivateKeys(keyList);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The private key should not be decrypted."));
      }
    });
  });

  describe("OpenPGP Assertions::assertMessageToEncrypt", () => {
    it("Should return openpgp.Message for every acceptable type", async() => {
      const message = "passbolt message";
      const scenarios = [
        message,
        await openpgp.createMessage({text: message, format: 'utf8'})
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        const readMessage = await assertMessageToEncrypt(scenarios[i]);
        expect(readMessage).toBeInstanceOf(openpgp.Message);
      }
    });

    it("Should throw an Error if the input message is not valid", async() => {
      const privateEncryptedOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private});

      const scenarios = [
        {input: 1234, expectedError: new Error("The message should be of type string or openpgp.Message")},
        {input: true, expectedError: new Error("The message should be of type string or openpgp.Message")},
        {input: privateEncryptedOpenpgpKey, expectedError: new Error("The message should be of type string or openpgp.Message")}
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          await assertMessageToEncrypt(scenarios[i].input);
        } catch (e) {
          expect(e).toStrictEqual(scenarios[i].expectedError);
        }
      }
    });
  });

  describe("OpenPGP Assertions::assertEncryptedMessage", () => {
    it("Should return openpgp.Message for every acceptable type", async() => {
      const armoredMessage = "-----BEGIN PGP MESSAGE-----\n\nhF4DEf0kni1RvUwSAQdAPWDyJPNezJ2K+VbIvAzuTa9Lr9Zs4/ghU1ly9wfxSz8w\nfjqRC+YcoTLSCbZhTEz51YK4kj6CjYFD+C+v1PdshF2Dgp8m1PLikHx0grjoy5el\n0j8B9uXBY29RefdfGotg07U/wy4DqzUQGXt9rzzN0vnAnh28Qh+z4rJT7E/it8KD\nW4tGrzf7VFnd5SGaPUmzykg=\n=mh4W\n-----END PGP MESSAGE-----";
      const scenarios = [
        armoredMessage,
        await openpgp.readMessage({armoredMessage: armoredMessage})
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        const readMessage = await assertEncryptedMessage(scenarios[i]);
        expect(readMessage).toBeInstanceOf(openpgp.Message);
      }
    });

    it("Should throw an Error if the input message is not valid", async() => {
      const privateEncryptedOpenpgpKey = await openpgp.readKey({armoredKey: pgpKeys.ada.private});

      const scenarios = [
        {input: "1234", expectedError: new Error("The message is not a valid openpgp message")},
        {input: 1234, expectedError: new Error("The message should be of type string or openpgp.Message")},
        {input: true, expectedError: new Error("The message should be of type string or openpgp.Message")},
        {input: privateEncryptedOpenpgpKey, expectedError: new Error("The message should be of type string or openpgp.Message")}
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        try {
          await assertEncryptedMessage(scenarios[i].input);
        } catch (e) {
          expect(e).toStrictEqual(scenarios[i].expectedError);
        }
      }
    });
  });
});
