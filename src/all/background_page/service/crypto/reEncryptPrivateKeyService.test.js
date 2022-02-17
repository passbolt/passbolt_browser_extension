/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import {ReEncryptPrivateKeyService} from './reEncryptPrivateKeyService';
import {pgpKeys} from '../../../tests/fixtures/pgpKeys/keys';
import {DecryptPrivateKeyService} from './decryptPrivateKeyService';
import {InvalidMasterPasswordError} from '../../error/invalidMasterPasswordError';

const publicKey = pgpKeys.ada.public;
const privateKey = pgpKeys.ada.private;

describe("ReEncryptPrivateKeyService service", () => {
  it('should throw an exception if the given key is not formatted properly', async() => {
    const privateKeyFormatError = new Error("The private keys must be of type string or openpgp.key.Key");
    const scenarios = [
      {key: null, expectedError: privateKeyFormatError},
      {key: {}, expectedError: privateKeyFormatError},
      {key: 1, expectedError: privateKeyFormatError},
      {key: false, expectedError: privateKeyFormatError},
      {key: [privateKey], expectedError: new Error('Only a single private key is allowed to be reencrypted.')}
    ];

    expect.assertions(scenarios.length);
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      try {
        await ReEncryptPrivateKeyService.reEncrypt(scenario.key, "old", "new");
      } catch (e) {
        expect(e).toStrictEqual(scenario.expectedError);
      }
    }
  });

  it('should throw an exception if the given key is not a private key', () => {
    expect.assertions(1);
    const promise = ReEncryptPrivateKeyService.reEncrypt(publicKey, "old", "new");
    return expect(promise).rejects.toThrowError(new Error("The private key is not a valid private key."));
  });

  it('should throw an exception if the passphrase are formatted properly', async() => {
    expect.assertions(2);
    const nonUtf8String = "\u{10000}";
    const utf8String = "hello";

    try {
      //Old passphrase is non UTF8
      await ReEncryptPrivateKeyService.reEncrypt(privateKey, nonUtf8String, utf8String);
    } catch (e) {
      expect(e).toStrictEqual(new Error("The passphrase should be a valid UTF8 string."));
    }

    try {
      //New passphrase is non UTF8
      await ReEncryptPrivateKeyService.reEncrypt(privateKey, utf8String, nonUtf8String);
    } catch (e) {
      expect(e).toStrictEqual(new Error("The passphrase should be a valid UTF8 string."));
    }
  });

  it("should throw an exception if the private key can't be decrypted with the old passphrase", () => {
    expect.assertions(1);
    const promise = ReEncryptPrivateKeyService.reEncrypt(privateKey, "wrong old passphrase", "");
    return expect(promise).rejects.toThrowError(new InvalidMasterPasswordError());
  });

  it('should reencrypt a given key with a new passphrase', async() => {
    const newPassphrase = "newPassphrase";
    const reEncryptedKey = await ReEncryptPrivateKeyService.reEncrypt(privateKey, "ada@passbolt.com", newPassphrase);

    const promise = DecryptPrivateKeyService.decrypt(reEncryptedKey.armoredKey, newPassphrase);
    return expect(promise).resolves.not.toBeNull();
  });
});
