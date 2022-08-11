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

import EncryptPrivateKeyService from "./encryptPrivateKeyService";
import {pgpKeys} from '../../../../../test/fixtures/pgpKeys/keys';
import DecryptPrivateKeyService from './decryptPrivateKeyService';
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

const publicKey = pgpKeys.ada.public;
const privateKey = pgpKeys.ada.private;
const decryptedPrivateKey = pgpKeys.ada.private_decrypted;

describe("EncryptPrivateKeyService service", () => {
  it('should throw an exception if the given key is not formatted properly', async() => {
    const privateKeyFormatError = new Error("The key should be a valid openpgp private key.");
    const scenarios = [
      null,
      {},
      1,
      false,
      publicKey,
      privateKey,
      [decryptedPrivateKey],
    ];

    expect.assertions(scenarios.length);
    for (let i = 0; i < scenarios.length; i++) {
      const promise = EncryptPrivateKeyService.encrypt(scenarios[i], "new-passphrase");
      await expect(promise).rejects.toThrowError(privateKeyFormatError);
    }
  });

  it('should throw an exception if the passphrase is not formatted properly', async() => {
    expect.assertions(1);
    const nonUtf8String = "\u{10000}";
    const key = await OpenpgpAssertion.readKeyOrFail(decryptedPrivateKey);
    const promise = EncryptPrivateKeyService.encrypt(key, nonUtf8String);
    await expect(promise).rejects.toThrowError(new Error("The passphrase should be a valid UTF8 string."));
  });

  it('should encrypt a given key with a passphrase', async() => {
    const passphrase = "newPassphrase";
    const key = await OpenpgpAssertion.readKeyOrFail(decryptedPrivateKey);
    const reEncryptedKey = await EncryptPrivateKeyService.encrypt(key, passphrase);

    const promise = DecryptPrivateKeyService.decrypt(reEncryptedKey, passphrase);
    return expect(promise).resolves.not.toBeNull();
  });
});
