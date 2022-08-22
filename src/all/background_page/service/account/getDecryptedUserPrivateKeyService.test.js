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
import GetDecryptedUserPrivateKeyService from "./getDecryptedUserPrivateKeyService";
import ExternalGpgKeyEntity from "../../model/entity/gpgkey/external/externalGpgKeyEntity";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import Keyring from "../../model/keyring";

const mockedFindPrivate = jest.spyOn(Keyring.prototype, "findPrivate");

describe("GetDecryptedUserPrivateKey service", () => {
  const key = pgpKeys.ada;

  it("should return the current users' private key decrypted", async() => {
    expect.assertions(3);
    mockedFindPrivate.mockImplementation(() => new ExternalGpgKeyEntity({armored_key: key.private}));

    const decryptedKey = await GetDecryptedUserPrivateKeyService.getKey(key.passphrase);
    expect(decryptedKey.isPrivate()).toBe(true);
    expect(decryptedKey.isDecrypted()).toBe(true);
    expect(decryptedKey.getFingerprint().toUpperCase()).toBe(key.fingerprint);
  }, 10 * 1000);

  it("should throw an Error if the private key can't be find", async() => {
    expect.assertions(1);
    mockedFindPrivate.mockImplementation(() => null);

    try {
      await GetDecryptedUserPrivateKeyService.getKey(key.passphrase);
    } catch (e) {
      expect(e).toStrictEqual(new Error("Can't find current user's private key."));
    }
  });
});
