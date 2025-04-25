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
import DecryptSsoPassphraseService from "./decryptSsoPassphraseService";
import OutdatedSsoKitError from "../../error/outdatedSsoKitError";
import {buildMockedCryptoKey} from "../../utils/assertions.test.data";
import GenerateSsoIvService from "./generateSsoIvService";
import EncryptSsoPassphraseService from "./encryptSsoPassphraseService";

describe("DecryptSsoPassphrase service", () => {
  const key1Promise = buildMockedCryptoKey({algoName: "AES-GCM", extractable: false});
  const key2Promise = buildMockedCryptoKey({algoName: "AES-GCM"});
  const iv1 = GenerateSsoIvService.generateIv();
  const iv2 = GenerateSsoIvService.generateIv();
  const buffer1 = Buffer.from("This is a buffer").toString('base64');

  it('should decrypt the passphrase if all data are correct', async() => {
    expect.assertions(1);
    const key1 = await key1Promise;
    const key2 = await key2Promise;

    const expectedDecryptedPassphrase = "passphrase";

    const encrypted = await EncryptSsoPassphraseService.encrypt(expectedDecryptedPassphrase, key1, key2, iv1, iv2);
    const decrypted = await DecryptSsoPassphraseService.decrypt(encrypted, key1, key2, iv1, iv2);
    expect(decrypted).toStrictEqual(expectedDecryptedPassphrase);
  });

  it("should throw an OutdatedSsoKitError if the server SSO kit doesn't match the local SSO kit", async() => {
    expect.assertions(1);
    const key1 = await key1Promise;
    const key2 = await key2Promise;

    try {
      await DecryptSsoPassphraseService.decrypt(buffer1, key1, key2, iv1, iv2);
    } catch (e) {
      expect(e).toBeInstanceOf(OutdatedSsoKitError);
    }
  });

  it("should throw an Error if the local SSO kit has been modified somehow", async() => {
    expect.assertions(1);
    const key1 = await key1Promise;
    const key2 = await key2Promise;

    try {
      await DecryptSsoPassphraseService.decrypt(buffer1, key1, key2, iv1, iv2);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
