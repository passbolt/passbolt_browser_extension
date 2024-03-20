/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2024 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.7.0
 */

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import DecryptMessageService from "../crypto/decryptMessageService";
import GpgAuthToken from "../../model/gpgAuthToken";
import stripslashes from "locutus/php/strings/stripslashes";
import urldecode from "locutus/php/url/urldecode";

class DecryptUserAuthTokenService {
  /**
   * Decrypt the user auth token
   *
   * @param {string} encryptedUserAuthToken The message to decrypt.
   * @param {string} userPrivateArmoredKey The user private armored key.
   * @param {string} passphrase The user passphrase.
   * @returns {Promise<string>} The token
   * @throws {Error} If the token is not valid
   */
  static async decryptToken(encryptedUserAuthToken, userPrivateArmoredKey, passphrase) {
    if (typeof encryptedUserAuthToken != "string") {
      throw new TypeError("The encrypted user auth token should be string.");
    }
    if (typeof userPrivateArmoredKey != "string") {
      throw new TypeError("The user private armored key should be string.");
    }
    if (typeof passphrase != "string") {
      throw new TypeError("The passphrase should be string.");
    }

    const token = stripslashes(urldecode(encryptedUserAuthToken));
    // Get the private key decrypted
    const key = await OpenpgpAssertion.readKeyOrFail(userPrivateArmoredKey);
    const privateKey = await DecryptPrivateKeyService.decrypt(key, passphrase);
    const encryptedMessage = await OpenpgpAssertion.readMessageOrFail(token);
    const userAuthToken = await DecryptMessageService.decrypt(encryptedMessage, privateKey);
    // Validate the User Auth Token
    const authToken = new GpgAuthToken(userAuthToken);
    return authToken.token;
  }
}

export default DecryptUserAuthTokenService;
