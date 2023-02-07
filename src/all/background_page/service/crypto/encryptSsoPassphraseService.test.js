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
import {buildMockedCryptoKey} from "../../utils/assertions.test.data";
import EncryptSsoPassphraseService from "./encryptSsoPassphraseService";
import GenerateSsoIvService from "./generateSsoIvService";

describe("EncryptSsoPassphrase service", () => {
  it('should encrypt the passphrase', async() => {
    expect.assertions(7);
    const key1 = await buildMockedCryptoKey({algoName: "AES-GCM", extractable: false});
    const key2 = await buildMockedCryptoKey({algoName: "AES-GCM"});
    const iv1 = GenerateSsoIvService.generateIv();
    const iv2 = GenerateSsoIvService.generateIv();
    const passphraseToEncrypt = "passphrase";
    const buffer1 = Buffer.from("This is the first encryption result buffer");
    const buffer2 = "passphrase but encrypted ^^";

    let step = 0;
    const expectedEncryptedPassphrase = Buffer.from("passphrase but encrypted ^^").toString('base64');

    const firstDecryptCallExpectation = (algo, key, buffer) => {
      expect(algo).toStrictEqual({
        name: "AES-GCM",
        iv: iv1
      });
      expect(key).toBe(key1);
      expect(buffer).toStrictEqual(Buffer.from(passphraseToEncrypt));
      return buffer1;
    };

    const secondDecryptCallExpectation = (algo, key, buffer) => {
      expect(algo).toStrictEqual({
        name: "AES-GCM",
        iv: iv2
      });
      expect(key).toBe(key2);
      expect(buffer).toBe(buffer1);
      return buffer2;
    };

    crypto.subtle.encrypt.mockImplementation(async(algo, key, buffer) => {
      step++;
      return step === 1
        ? firstDecryptCallExpectation(algo, key, buffer)
        : secondDecryptCallExpectation(algo, key, buffer);
    });

    const encrypted = await EncryptSsoPassphraseService.encrypt(passphraseToEncrypt, key1, key2, iv1, iv2);
    expect(encrypted).toStrictEqual(expectedEncryptedPassphrase);
  });
});
