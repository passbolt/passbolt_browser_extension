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
import {buildMockedCryptoKey} from "../../utils/assertions.test.data";
import DecryptSsoPassphraseService from "./decryptSsoPassphraseService";
import EncryptSsoPassphraseService from "./encryptSsoPassphraseService";
import GenerateSsoIvService from "./generateSsoIvService";

describe("EncryptSsoPassphrase service", () => {
  it('should encrypt the passphrase', async() => {
    expect.assertions(2);
    const key1 = await buildMockedCryptoKey({algoName: "AES-GCM", extractable: false});
    const key2 = await buildMockedCryptoKey({algoName: "AES-GCM"});
    const iv1 = GenerateSsoIvService.generateIv();
    const iv2 = GenerateSsoIvService.generateIv();
    const passphraseToEncrypt = "passphrase";

    const encrypted = await EncryptSsoPassphraseService.encrypt(passphraseToEncrypt, key1, key2, iv1, iv2);
    expect(encrypted).not.toBe(passphraseToEncrypt);

    const decrypted = await DecryptSsoPassphraseService.decrypt(encrypted, key1, key2, iv1, iv2);
    expect(decrypted).toStrictEqual(passphraseToEncrypt);
  });
});
