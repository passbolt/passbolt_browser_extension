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

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import GetGpgKeyInfoService from "./getGpgKeyInfoService";

class CompareGpgKeyService {
  /**
   * Check if both given keys are the same.
   * 2 keys are considered identical when the following information is equal:
   * - fingerprint
   * - expiration date
   *
   * @param {openpgp.PublicKey|openpgp.PrivateKey} keyA
   * @param {openpgp.PublicKey|openpgp.PrivateKey} keyB
   * @returns {Promise<bool>}
   */
  static async areKeysTheSame(keyA, keyB) {
    OpenpgpAssertion.assertKey(keyA);
    OpenpgpAssertion.assertKey(keyB);

    const keyAInfo = await GetGpgKeyInfoService.getKeyInfo(keyA);
    const keyBInfo = await GetGpgKeyInfoService.getKeyInfo(keyB);
    return keyAInfo.fingerprint === keyBInfo.fingerprint
      && keyAInfo.expires === keyBInfo.expires;
  }
}

export default CompareGpgKeyService;
