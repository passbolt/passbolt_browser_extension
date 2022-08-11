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

import ReEncryptPrivateKeyService from './reEncryptPrivateKeyService';
import {pgpKeys} from '../../../../../test/fixtures/pgpKeys/keys';
import DecryptPrivateKeyService from './decryptPrivateKeyService';
import InvalidMasterPasswordError from '../../error/invalidMasterPasswordError';
import {OpenpgpAssertion} from '../../utils/openpgp/openpgpAssertions';

const publicKey = pgpKeys.ada.public;
const privateKey = pgpKeys.ada.private;

describe("ReEncryptPrivateKeyService service", () => {
  it('should throw an exception if the given key is not formatted properly', async() => {
    const privateKeyFormatError = new Error("The key should be a valid openpgp private key.");
    const scenarios = [
      null,
      {},
      1,
      false,
      privateKey,
      [privateKey],
    ];

    expect.assertions(scenarios.length);
    for (let i = 0; i < scenarios.length; i++) {
      const promise = ReEncryptPrivateKeyService.reEncrypt(scenarios[i], "old", "new");
      await expect(promise).rejects.toThrowError(privateKeyFormatError);
    }
  });

  it('should throw an exception if the given key is not a private key', async() => {
    expect.assertions(1);
    const key = await OpenpgpAssertion.readKeyOrFail(publicKey);
    const promise = ReEncryptPrivateKeyService.reEncrypt(key, "old", "new");
    return expect(promise).rejects.toThrowError(new Error("The key should be a valid openpgp private key."));
  });

  it('should throw an exception if the passphrase are formatted properly', async() => {
    expect.assertions(2);
    const nonUtf8String = "\u{10000}";
    const utf8String = "hello";

    //Old passphrase is non UTF8
    const key = await OpenpgpAssertion.readKeyOrFail(privateKey);
    let promise = ReEncryptPrivateKeyService.reEncrypt(key, nonUtf8String, utf8String);
    await expect(promise).rejects.toThrowError(new Error("The passphrase should be a valid UTF8 string."));

    // New passphrase is non UTF8
    promise = ReEncryptPrivateKeyService.reEncrypt(key, utf8String, nonUtf8String);
    await expect(promise).rejects.toThrowError(new Error("The passphrase should be a valid UTF8 string."));
  });

  it("should throw an exception if the private key can't be decrypted with the old passphrase", async() => {
    expect.assertions(1);
    const key = await OpenpgpAssertion.readKeyOrFail(privateKey);
    const promise = ReEncryptPrivateKeyService.reEncrypt(key, "wrong old passphrase", "");
    return expect(promise).rejects.toThrowError(new InvalidMasterPasswordError());
  });

  it('should re-encrypt a given key with a new passphrase', async() => {
    const newPassphrase = "newPassphrase";
    const key = await OpenpgpAssertion.readKeyOrFail(privateKey);
    const reEncryptedKey = await ReEncryptPrivateKeyService.reEncrypt(key, "ada@passbolt.com", newPassphrase);

    const promise = DecryptPrivateKeyService.decrypt(reEncryptedKey, newPassphrase);
    return expect(promise).resolves.not.toBeNull();
  });
});
