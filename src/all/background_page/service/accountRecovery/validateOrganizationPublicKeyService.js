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
 * @since         4.7.0
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import GetGpgKeyInfoService from "../crypto/getGpgKeyInfoService";
import AuthVerifyServerKeyService from "../api/auth/authVerifyServerKeyService";
import GenerateGpgKeyPairOptionsEntity from "../../model/entity/gpgkey/generate/generateGpgKeyPairOptionsEntity";
import Keyring from "../../model/keyring";

class ValidateOrganizationPublicKeyService {
  /**
   * Service constructor
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.authVerifyServerKeyService = new AuthVerifyServerKeyService(apiClientOptions);
    this.keyring = new Keyring();
  }

  /**
   * Validate the new organization account recovery public key.
   *
   * @param {string} publicArmoredKeyToValidate the key to check the validity as a potential new organization recovery key
   * @param {string} organizationPolicyPublicArmoredKey the current organization recovery key in its armored form
   * @throws {Error} If the key is not a valid openpgp key.
   * @throws {Error} If the key does not use RSA as algorithm.
   * @throws {Error} If the key is not public.
   * @throws {Error} If the key is revoked.
   * @throws {Error} If the key has an expiry date.
   * @throws {Error} If the key is not at least 4096 bits.
   * @throws {Error} If the key is the current server key.
   * @throws {Error} If the key is used by another user.
   */
  async validatePublicKey(publicArmoredKeyToValidate, organizationPolicyPublicArmoredKey) {
    const publicKey = await OpenpgpAssertion.readKeyOrFail(publicArmoredKeyToValidate);
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(publicKey);

    if (!keyInfo.isValid) {
      throw new Error("The key should be a valid openpgp key.");
    }

    if (keyInfo.algorithm !== GenerateGpgKeyPairOptionsEntity.TYPE_RSA) {
      throw new Error("The key algorithm should be RSA.");
    }

    if (keyInfo.private) {
      throw new Error("The key should be public.");
    }

    if (keyInfo.revoked) {
      throw new Error("The key should not be revoked.");
    }

    if (keyInfo.expires !== "Infinity") {
      throw new Error("The key should not have an expiry date.");
    }

    if (keyInfo.length < 4096) {
      throw new Error("The key should be at least 4096 bits.");
    }

    const serverKey = await this.authVerifyServerKeyService.getServerKey();
    if (serverKey.fingerprint.toUpperCase() === keyInfo.fingerprint) {
      throw new Error("The key is the current server key, the organization recovery key must be a new one.");
    }

    await this.keyring.sync();
    const publicKeys = this.keyring.getPublicKeysFromStorage();
    for (const id in publicKeys) {
      const publicKey = publicKeys[id];
      if (publicKey.fingerprint.toUpperCase() === keyInfo.fingerprint) {
        throw new Error("The key is already being used, the organization recovery key must be a new one.");
      }
    }

    if (!organizationPolicyPublicArmoredKey) {
      return;
    }

    const organizationPolicyPublicKey = await OpenpgpAssertion.readKeyOrFail(organizationPolicyPublicArmoredKey);
    if (organizationPolicyPublicKey.getFingerprint().toUpperCase() === keyInfo.fingerprint) {
      throw new Error("The key is the current organization recovery key, you must provide a new one.");
    }
  }
}

export default ValidateOrganizationPublicKeyService;
