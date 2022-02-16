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
import {AccountModel} from './accountModel';
import {pgpKeys} from '../../../tests/fixtures/pgpKeys/keys';
import {InvalidMasterPasswordError} from '../../error/invalidMasterPasswordError';
import {ExternalGpgKeyEntity} from '../entity/gpgkey/external/externalGpgKeyEntity';
import {GetGpgKeyInfoService} from '../../service/crypto/getGpgKeyInfoService';
import {DecryptPrivateKeyService} from '../../service/crypto/decryptPrivateKeyService';

const mockedPrivateKey = new ExternalGpgKeyEntity({armored_key: pgpKeys.ada.private});
const mockedImportPrivate = jest.fn();
jest.mock('../keyring.js', () => ({
  Keyring: jest.fn().mockImplementation(() => ({
    findPrivate: () => mockedPrivateKey,
    importPrivate: mockedImportPrivate
  }))
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Account model", () => {
  it('should register the new private key once passphrase is rotated', async() => {
    expect.assertions(2);
    const oldPassphrase = "ada@passbolt.com";
    const newPassphrase = "moc.tlobssap@ada";

    mockedImportPrivate.mockImplementation(async newPrivateArmoredKey => {
      const keyInfo = await GetGpgKeyInfoService.getKeyInfo(newPrivateArmoredKey);
      expect(keyInfo.private).toBe(true);

      const decryptedKey = await DecryptPrivateKeyService.decrypt(newPrivateArmoredKey, newPassphrase);
      expect(decryptedKey).not.toBeNull();
    });

    const model = new AccountModel();
    await model.updatePrivateKey(oldPassphrase, newPassphrase);
  });

  it("should throw an exception the re-encryption couldn't have been done", async() => {
    expect.assertions(2);
    const model = new AccountModel();
    try {
      await model.updatePrivateKey("wrong passphrase", "moc.tlobssap@ada");
    } catch (e) {
      expect(e).toStrictEqual(new InvalidMasterPasswordError());
      expect(mockedImportPrivate).not.toHaveBeenCalled();
    }
  });
});
