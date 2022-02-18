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
import {DecryptPrivateKeyService} from "./decryptPrivateKeyService";
import {PrivateGpgkeyEntity} from "../../model/entity/gpgkey/privateGpgkeyEntity";
import {InvalidMasterPasswordError} from '../../error/invalidMasterPasswordError';
import {pgpKeys} from '../../../tests/fixtures/pgpKeys/keys';

describe("DecryptPrivateKey service", () => {
  it('should generate decryptPrivateGpgKeyEntity a private key with the right passphrase', () => {
    expect.assertions(1);
    const entity =  new PrivateGpgkeyEntity({
      armored_key: pgpKeys.ada.private,
      passphrase: "ada@passbolt.com"
    });

    return expect(DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(entity)).resolves.not.toBeNull();
  }, 10 * 1000);

  it('should throw an InvalidMasterPasswordError when the passphrase is not correct', () => {
    expect.assertions(1);
    const entity =  new PrivateGpgkeyEntity({
      armored_key: pgpKeys.ada.private,
      passphrase: "dada@passbolt.com"
    });

    return expect(DecryptPrivateKeyService.decryptPrivateGpgKeyEntity(entity)).rejects.toThrow(new InvalidMasterPasswordError());
  }, 10 * 1000);

  it('should throw an Error if the private key is already decrypted', async() => {
    expect.assertions(1);
    const decryptedKey = await DecryptPrivateKeyService.decrypt(pgpKeys.ada.private, "ada@passbolt.com");

    try {
      await DecryptPrivateKeyService.decrypt(decryptedKey.armor(), "ada@passbolt.com");
    } catch (e) {
      expect(e).toStrictEqual(new Error("The private key is already decrypted"));
    }
  }, 10 * 1000);
});
