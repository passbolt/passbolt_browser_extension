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

import ExternalGpgKeyEntity from "../../model/entity/gpgkey/external/externalGpgKeyEntity";
import goog from "../../utils/format/emailaddress";
import GpgKeyError from "../../error/GpgKeyError";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";


class GetGpgKeyInfoService {
  /**
   * Returns the information of the given key.
   *
   * @param {openpgp.PublicKey|openpgp.PrivateKey} key The key to get the info from.
   * @return {Promise<ExternalGpgKeyEntity>}
   */
  static async getKeyInfo(key) {
    OpenpgpAssertion.assertKey(key);

    // Check the userIds
    const userIds = key.getUserIDs();
    const userIdsSplited = [];
    if (userIds.length === 0) {
      throw new GpgKeyError('No key user ID found');
    }

    for (const i in userIds) {
      if (Object.prototype.hasOwnProperty.call(userIds, i)) {
        const result = goog.format.EmailAddress.parse(userIds[i]);
        userIdsSplited.push({
          name: result.name_,
          email: result.address_
        });
      }
    }

    // seems like opengpg keys id can be longer than 8 bytes (16 default?)
    let keyid = key.getKeyID().toHex();
    if (keyid.length > 8) {
      keyid = keyid.substr(keyid.length - 8);
    }

    // Format expiration time
    let expirationTime;
    const opengpgExpirationTime = await key.getExpirationTime();
    if (opengpgExpirationTime instanceof Date) {
      expirationTime = opengpgExpirationTime.toISOString();
    } else if (opengpgExpirationTime === Infinity) {
      expirationTime = opengpgExpirationTime.toString();
    } else { // opengpgExpirationTime === null
      expirationTime = null;
    }

    const algorithmInfo = key.getAlgorithmInfo();
    const externalGpgKeyDto = {
      armored_key: key.armor(),
      key_id: keyid,
      user_ids: userIdsSplited,
      fingerprint: key.getFingerprint().toUpperCase(),
      created: key.getCreationTime().toISOString(),
      expires: expirationTime,
      algorithm: this.formatAlgorithm(algorithmInfo.algorithm),
      length: this.getKeyLength(algorithmInfo),
      curve: algorithmInfo.curve || null,
      private: key.isPrivate(),
      revoked: await key.isRevoked()
    };
    return new ExternalGpgKeyEntity(externalGpgKeyDto);
  }

  /**
   * Format the name of an openpgp's lib algorithm name to an internal one.
   *
   * @param {string} algorithmName
   * @returns {string}
   */
  static formatAlgorithm(algorithmName) {
    switch (algorithmName) {
      case "rsaEncryptSign":
      case "rsaEncrypt":
      case "rsaSign":
        return "rsa";
      case "elgamal":
        return "elgamal";
      case "dsa":
        return "dsa";
      case "ecdh":
        return "ecdh";
      case "ecdsa":
        return "ecdsa";
      case "eddsa":
        return "eddsa";
      case "aedh":
        return "aedh";
      case "aedsa":
        return "aedsa";
      default:
        throw new Error("Unknown algorithm.");
    }
  }

  /**
   * Get the key size from an openpgp algorithm info.
   *
   * @param {object} algorithmInfo
   * @returns {string}
   */
  static getKeyLength(algorithmInfo) {
    //algorithm are DSA or RSA
    if (typeof(algorithmInfo.bits) !== "undefined") {
      return algorithmInfo.bits;
    }

    //algorithm are ECDSA or EdDSA
    const curveName = algorithmInfo?.curve.toString().toLowerCase();
    switch (curveName) {
      case "p256":
      case "ed25519":
      case "secp256k1":
      case "curve25519":
      case "brainpoolp256r1": {
        return 256;
      }
      case "brainpoolp384r1":
      case "p384": {
        return 384;
      }
      case "brainpoolp512r1": {
        return 512;
      }
      case "p521": {
        return 521;
      }
    }

    //@todo check if we covered every cases especially for algo like: AEDH and AEDSA
    return undefined;
  }
}

export default GetGpgKeyInfoService;
