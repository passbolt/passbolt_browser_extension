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

import GpgAuthHeader from "../../model/gpgAuthHeader";
import AuthLoginService from "../api/auth/authLoginService";
import DecryptUserAuthTokenService from "./decryptUserAuthTokenService";
class AuthVerifyLoginChallengeService {
  /**
   * The constructor
   * @param apiClientOptions
   */
  constructor(apiClientOptions) {
    this.authLoginService = new AuthLoginService(apiClientOptions);
  }

  /**
   * Verify and validate the server challenge
   * @param {string} userFingerprint The user fingerprint
   * @param {string} userPrivateArmoredKey The user armored key encrypted
   * @param {string} passphrase The passphrase
   * @return {Promise<void>}
   */
  async verifyAndValidateLoginChallenge(userFingerprint, userPrivateArmoredKey, passphrase) {
    // Step 1: Get an encrypted token from the server
    const responseStage1 = await this.authLoginService.loginStage1(userFingerprint);
    // Step 2: Check headers and validate the step
    const authStage1 = new GpgAuthHeader(responseStage1.headers, 'stage1');
    // Step 3: Decrypt the user auth token
    const encryptedUserAuthToken = authStage1.headers['x-gpgauth-user-auth-token'];
    const token = await DecryptUserAuthTokenService.decryptToken(encryptedUserAuthToken, userPrivateArmoredKey, passphrase);
    // Step 4: Send back the token decrypted
    const responseStage2 = await this.authLoginService.loginStage2(token, userFingerprint);
    // Step 5: Check headers and validate the step
    new GpgAuthHeader(responseStage2.headers, 'complete');
  }
}

export default AuthVerifyLoginChallengeService;
