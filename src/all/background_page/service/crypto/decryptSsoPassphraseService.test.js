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
 * @since         3.9.0
 */
import "../../../../../test/mocks/mockCryptoKey";
import DecryptSsoPassphraseService from "./decryptSsoPassphraseService";
import OutdatedSsoKitError from "../../error/outdatedSsoKitError";
import {buildMockedCryptoKey} from "../../utils/assertions.test.data";
import GenerateSsoIvService from "./generateSsoIvService";

describe("DecryptSsoPassphrase service", () => {
  const key1Promise = buildMockedCryptoKey({algoName: "AES-GCM", extractable: false});
  const key2Promise = buildMockedCryptoKey({algoName: "AES-GCM"});
  const iv1 = GenerateSsoIvService.generateIv();
  const iv2 = GenerateSsoIvService.generateIv();
  const buffer1 = Buffer.from("This is a buffer").toString('base64');
  const buffer2 = Buffer.from("This is a second buffer");

  it('should decrypt the passphrase if all data are correct', async() => {
    expect.assertions(7);
    const key1 = await key1Promise;
    const key2 = await key2Promise;

    let step = 0;
    const expectedDecryptedPassphrase = "passphrase";

    const firstDecrypyCallExpectation = (algo, key, buffer) => {
      expect(algo).toStrictEqual({
        name: "AES-GCM",
        iv: iv2
      });
      expect(key).toBe(key2);
      expect(buffer).toStrictEqual(Buffer.from(buffer1, 'base64'));
      return buffer2;
    };

    const secondDecrypyCallExpectation = (algo, key, buffer) => {
      expect(algo).toStrictEqual({
        name: "AES-GCM",
        iv: iv1
      });
      expect(key).toBe(key1);
      expect(buffer).toBe(buffer2);
      return expectedDecryptedPassphrase;
    };

    crypto.subtle.decrypt.mockImplementation(async(algo, key, buffer) => {
      step++;
      return step === 1
        ? firstDecrypyCallExpectation(algo, key, buffer)
        : secondDecrypyCallExpectation(algo, key, buffer);
    });

    const decrypted = await DecryptSsoPassphraseService.decrypt(buffer1, key1, key2, iv1, iv2);
    expect(decrypted).toStrictEqual(expectedDecryptedPassphrase);
  });

  it("should throw an OutdatedSsoKitError if the server SSO kit doesn't match the local SSO kit", async() => {
    expect.assertions(1);
    const key1 = await key1Promise;
    const key2 = await key2Promise;

    crypto.subtle.decrypt.mockImplementation(async() => {
      throw new Error("Unable to decrypt somehow");
    });

    try {
      await DecryptSsoPassphraseService.decrypt(buffer1, key1, key2, iv1, iv2);
    } catch (e) {
      expect(e).toBeInstanceOf(OutdatedSsoKitError);
    }
  });

  it("should throw an Error if the local SSO kit has been modified somehow", async() => {
    expect.assertions(1);
    const key1 = await key1Promise;
    const key2 = await key2Promise;

    let step = 0;
    const firstDecrypyCallExpectation = async() => buffer2;
    const secondDecrypyCallExpectation =  async() => { throw new Error("Unable to decrypt somehow"); };

    crypto.subtle.decrypt.mockImplementation(async(algo, key, buffer) => {
      step++;
      return step === 1
        ? firstDecrypyCallExpectation(algo, key, buffer)
        : secondDecrypyCallExpectation(algo, key, buffer);
    });

    try {
      await DecryptSsoPassphraseService.decrypt(buffer1, key1, key2, iv1, iv2);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
