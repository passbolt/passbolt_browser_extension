import GpgAuthToken from "../../model/gpgAuthToken";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import EncryptMessageService from "../crypto/encryptMessageService";
import GpgAuthHeader from "../../model/gpgAuthHeader";
import AuthVerifyServerKeyService from "../api/auth/authVerifyServerKeyService";

/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.7.0
 */
class AuthVerifyServerChallengeService {
  /**
   * The constructor
   * @param apiClientOptions
   */
  constructor(apiClientOptions) {
    this.authVerifyServerKeyService = new AuthVerifyServerKeyService(apiClientOptions);
    this.gpgAuthToken = new GpgAuthToken();
  }

  /**
   * Verify and validate the server challenge
   * @param {string} userFingerprint The user fingerprint
   * @param {string} serverPublicArmoredKey The server public armored key
   * @return {Promise<void>}
   */
  async verifyAndValidateServerChallenge(userFingerprint, serverPublicArmoredKey) {
    // Read the server public key
    const serverKey = await OpenpgpAssertion.readKeyOrFail(serverPublicArmoredKey);
    // Step 1: Encrypt the token
    const encryptedToken = await EncryptMessageService.encrypt(this.gpgAuthToken.token, serverKey);
    // Step 2: Send the token encrypted to the server
    const response = await this.authVerifyServerKeyService.verify(userFingerprint, encryptedToken);
    // Step 3: Verify and validate the response headers
    const auth = new GpgAuthHeader(response.headers, 'verify');
    // Step 4: Verify and validate that the token received is the same
    const verifyToken = new GpgAuthToken(auth.headers['x-gpgauth-verify-response']);
    if (verifyToken.token !== this.gpgAuthToken.token) {
      throw new Error('The server was unable to prove it can use the advertised OpenPGP key.');
    }
  }
}

export default AuthVerifyServerChallengeService;
