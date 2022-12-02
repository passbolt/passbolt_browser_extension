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
import EncryptSsoPassphraseService from "./encryptSsoPassphraseService";

const mockedEncrypt = jest.fn();
global.self.crypto = {
  subtle: {
    encrypt: mockedEncrypt
  }
};

describe("EncryptSsoPassphrase service", () => {
  it('should encrypt the passphrase', async() => {
    expect.assertions(7);
    const key1 = {algorithm: {name: "AES-GCM"}};
    const key2 = {algorithm: {name: "AES-GCM"}};
    const iv1 = new Uint8Array([1]);
    const iv2 = new Uint8Array([2]);
    const passphraseToEncrypt = "passphrase";
    const buffer1 = Buffer.from("This is the first encryption result buffer");
    const buffer2 = "passphrase but encrypted ^^";

    let step = 0;
    const expectedEncryptedPassphrase = Buffer.from("passphrase but encrypted ^^").toString('base64');

    const firstDecrypyCallExpectation = (algo, key, buffer) => {
      expect(algo).toStrictEqual({
        name: "AES-GCM",
        iv: iv1
      });
      expect(key).toBe(key1);
      expect(buffer).toStrictEqual(Buffer.from(passphraseToEncrypt));
      return buffer1;
    };

    const secondDecrypyCallExpectation = (algo, key, buffer) => {
      expect(algo).toStrictEqual({
        name: "AES-GCM",
        iv: iv2
      });
      expect(key).toBe(key2);
      expect(buffer).toBe(buffer1);
      return buffer2;
    };

    mockedEncrypt.mockImplementation(async(algo, key, buffer) => {
      step++;
      return step === 1
        ? firstDecrypyCallExpectation(algo, key, buffer)
        : secondDecrypyCallExpectation(algo, key, buffer);
    });

    const encrypted = await EncryptSsoPassphraseService.encrypt(passphraseToEncrypt, key1, key2, iv1, iv2);
    expect(encrypted).toStrictEqual(expectedEncryptedPassphrase);
  });
});
