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
import i18n from "../../sdk/i18n";
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";
import GenerateGpgKeyPairOptionsEntity from "../../model/entity/gpgkey/generate/generateGpgKeyPairOptionsEntity";


class ValidatePrivateGpgKeySetupController {
  /**
   * ValidateGpgKeyController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @param {string} key the key to validate.
   */
  async _exec(key) {
    try {
      await this.exec(key);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Get the given user key information.
   *
   * @param {string} privateArmoredKey the key to validate.
   * @returns {Promise<void>}
   * @throws {Error} if the key is not a valid GPG Key.
   * @throws {Error} if the key is revoked.
   * @throws {Error} if the key is expired.
   * @throws {Error} if the key is not expired but has an expiration date.
   * @throws {Error} if the key is not private.
   * @throws {Error} if the key is decrypted.
   * @throws {Error} if the key is a too weak RSA.
   * @throws {Error} if the key is an ECC with an undefined curve.
   * @throws {Error} if the key is an ECC with an unsupported curve.
   */
  async exec(privateArmoredKey) {
    const privateKey = await OpenpgpAssertion.readKeyOrFail(privateArmoredKey);
    OpenpgpAssertion.assertPrivateKey(privateKey);
    OpenpgpAssertion.assertEncryptedPrivateKey(privateKey);

    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(privateKey);

    if (!keyInfo.isValid) {
      throw new Error(i18n.t("The private key should be a valid openpgp key."));
    } else if (keyInfo.revoked) {
      throw new Error(i18n.t("The private key should not be revoked."));
    } else if (keyInfo.isExpired) {
      throw new Error(i18n.t("The private key should not be expired."));
    } else if (keyInfo.expires !== "Infinity") {
      throw new Error(i18n.t("The private key should not have an expiry date."));
    }

    if (keyInfo.algorithm === GenerateGpgKeyPairOptionsEntity.TYPE_RSA) {
      if (keyInfo.length < GenerateGpgKeyPairOptionsEntity.DEFAULT_KEY_SIZE) {
        throw new Error(i18n.t("An RSA key should have a length of {{size}} bits minimum.", {size: GenerateGpgKeyPairOptionsEntity.DEFAULT_KEY_SIZE}));
      }
    } else {
      if (!keyInfo.curve) {
        throw new Error(i18n.t("The private key should use a supported algorithm: RSA, ECDSA OR EDDSA."));
      } else if (!ValidatePrivateGpgKeySetupController._isCurveSupported(keyInfo.curve)) {
        throw new Error(i18n.t("An ECC key should be based on a supported curve."));
      }
    }
  }

  /**
   * Returns true if the curve is supported of false otherwise.
   *
   * @param {string} curve the curve identifier to check.
   * @returns {boolean}
   */
  static _isCurveSupported(curve) {
    const supportedCurve = [
      "p256",
      "p384",
      "p521",
      "secp256k1",
      "ed25519",
      "curve25519",
      "brainpoolP256r1",
      "brainpoolP384r1",
      "brainpoolP512r1",
    ];

    return supportedCurve.indexOf(curve) > -1;
  }
}

export default ValidatePrivateGpgKeySetupController;
