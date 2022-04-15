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

import {EncryptPrivateKeyService} from "./encryptPrivateKeyService";
import {pgpKeys} from '../../../tests/fixtures/pgpKeys/keys';
import {DecryptPrivateKeyService} from './decryptPrivateKeyService';

const publicKey = pgpKeys.ada.public;
const privateKey = pgpKeys.ada.private;
const decryptedPrivateKey = pgpKeys.ada.private_decrypted;

describe("EncryptPrivateKeyService service", () => {
  it('should throw an exception if the given key is not formatted properly', async() => {
    const privateKeyFormatError = new Error("The key should be a valid armored key or a valid openpgp key.");
    const scenarios = [
      {key: null, expectedError: privateKeyFormatError},
      {key: {}, expectedError: privateKeyFormatError},
      {key: 1, expectedError: privateKeyFormatError},
      {key: false, expectedError: privateKeyFormatError},
      {key: publicKey, expectedError: new Error('The key should be private.')},
      {key: privateKey, expectedError: new Error('The private key should be decrypted.')},
      {key: [decryptedPrivateKey], expectedError: new Error('Only a single private key is allowed to be encrypted.')}
    ];

    expect.assertions(scenarios.length);
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      const promise = EncryptPrivateKeyService.encrypt(scenario.key, "new-passphrase");
      await expect(promise).rejects.toThrowError(scenario.expectedError);
    }
  });

  it('should throw an exception if the passphrase is not formatted properly', async() => {
    expect.assertions(1);
    const nonUtf8String = "\u{10000}";
    const promise = EncryptPrivateKeyService.encrypt(decryptedPrivateKey, nonUtf8String);
    await expect(promise).rejects.toThrowError(new Error("The passphrase should be a valid UTF8 string."));
  });

  it('should encrypt a given key with a passphrase', async() => {
    const passphrase = "newPassphrase";
    const reEncryptedKey = await EncryptPrivateKeyService.encrypt(decryptedPrivateKey, passphrase);

    const promise = DecryptPrivateKeyService.decrypt(reEncryptedKey, passphrase);
    return expect(promise).resolves.not.toBeNull();
  });
});
