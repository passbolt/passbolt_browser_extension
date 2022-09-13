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
import DecryptPrivateKeyService from "./decryptPrivateKeyService";
import InvalidMasterPasswordError from '../../error/invalidMasterPasswordError';
import {pgpKeys} from '../../../../../test/fixtures/pgpKeys/keys';
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

describe("DecryptPrivateKey service", () => {
  it('should validate a private key with the right passphrase', async() => {
    expect.assertions(1);
    const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
    await expect(DecryptPrivateKeyService.decrypt(key, "ada@passbolt.com")).resolves.not.toBeNull();
  }, 10 * 1000);

  it('should throw an InvalidMasterPasswordError when the passphrase is not correct', async() => {
    expect.assertions(1);
    const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
    await expect(DecryptPrivateKeyService.decrypt(key, "wrong passphrase")).rejects.toThrow(new InvalidMasterPasswordError());
  }, 10 * 1000);

  it('should throw an Error if the private key is already decrypted', async() => {
    expect.assertions(1);
    try {
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      await DecryptPrivateKeyService.decrypt(key, "");
    } catch (e) {
      expect(e).toStrictEqual(new Error("The private key should be encrypted."));
    }
  }, 10 * 1000);
});
