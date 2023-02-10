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

import SsoKitClientPartEntity from "../../model/entity/sso/ssoKitClientPartEntity";
import SsoKitServerPartEntity from "../../model/entity/sso/ssoKitServerPartEntity";
import EncryptSsoPassphraseService from "../crypto/encryptSsoPassphraseService";
import GenerateSsoIvService from "../crypto/generateSsoIvService";
import GenerateSsoKeyService from "../crypto/generateSsoKeyService";
import SsoDataStorage from "../indexedDB_storage/ssoDataStorage";
import SsoKitTemporaryStorageService from "../session_storage/ssoKitTemporaryStorageService";
import {Buffer} from 'buffer';

class GenerateSsoKitService {
  /**
   * Generates and stores a new SSO kit.
   *
   * @param {string} passphrase The passphrase to encrypt for SSO
   * @param {string} provider The SSO provider identifier
   * @return {Promise<void>}
   */
  static async generate(passphrase, provider) {
    try {
      const kits = await this.generateSsoKits(passphrase, provider);
      await SsoDataStorage.save(kits.clientPart);
      await SsoKitTemporaryStorageService.set(kits.serverPart);
    } catch (error) {
      await SsoDataStorage.flush();
      await SsoKitTemporaryStorageService.flush();
      throw error;
    }
  }

  /**
   * Generates the SSO kits without storing them.
   *
   * @param {string} passphrase The passphrase to encrypt for SSO
   * @param {string} provider The SSO provider identifier
   * @return {Promise<object>} the couple SSO kits
   */
  static async generateSsoKits(passphrase, provider) {
    const nek = await GenerateSsoKeyService.generateSsoKey();
    const extractableKey = await GenerateSsoKeyService.generateSsoKey(true);
    const iv1 = GenerateSsoIvService.generateIv();
    const iv2 = GenerateSsoIvService.generateIv();

    const secret = await EncryptSsoPassphraseService.encrypt(passphrase, nek, extractableKey, iv1, iv2);
    const ssoKitClientPartEntity = new SsoKitClientPartEntity({nek, iv1, iv2, secret, provider});

    const exportedKey = await crypto.subtle.exportKey("jwk", extractableKey);
    const serializedKey = Buffer.from(JSON.stringify(exportedKey)).toString("base64");
    const ssoKitServerPartEntity = new SsoKitServerPartEntity({
      data: serializedKey
    });

    return {
      clientPart: ssoKitClientPartEntity,
      serverPart: ssoKitServerPartEntity,
    };
  }
}

export default GenerateSsoKitService;
