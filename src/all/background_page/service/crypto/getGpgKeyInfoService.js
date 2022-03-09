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

const {goog} = require('../../utils/format/emailaddress');
const {ExternalGpgKeyEntity} = require('../../model/entity/gpgkey/external/externalGpgKeyEntity');
const {GpgKeyError} = require('../../error/GpgKeyError');
const {assertKeys} = require('../../utils/openpgp/openpgpAssertions');

class GetGpgKeyInfoService {
  /**
   * Returns the information of the given key.
   *
   * @param {openpgp.PublicKey|openpgp.PrivateKey|string} key The key to get the info from.
   * @return {Promise<ExternalGpgKeyEntity>}
   */
  static async getKeyInfo(key) {
    const readKey = await assertKeys(key);
    return this._keyInfo(readKey);
  }

  /**
   * Returns key information.
   *
   * @param {openpgp.PublicKey|openpgp.PrivateKey} key The key to get info from.
   * @returns {Promise<ExternalGpgKeyEntity>}
   * @private
   */
  static async _keyInfo(key) {
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
    try {
      const opengpgExpirationTime = await key.getExpirationTime();
      expirationTime = opengpgExpirationTime === Infinity
        ? "Never"
        : opengpgExpirationTime.toISOString();
    } catch (e) {
      expirationTime = null;
    }

    const algorithmInfo = key.getAlgorithmInfo();
    const externalGpgKeyDto = {
      armored_key: key.armor(),
      key_id: keyid,
      user_ids: userIdsSplited,
      fingerprint: key.getFingerprint(),
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
        return "RSA";
      case "elgamal":
        return "Elgamal";
      case "dsa":
        return "DSA";
      case "ecdh":
        return "ECDH";
      case "ecdsa":
        return "ECDSA";
      case "eddsa":
        return "EdDSA";
      case "aedh":
        return "AEDH";
      case "aedsa":
        return "AEDSA";
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
      case "nist p-256":
      case "ed25519":
      case "curve25519":
      case "brainpoolp256r1": {
        return 256;
      }
      case "brainpoolp384r1":
      case "nist p-384": {
        return 384;
      }
      case "brainpoolp512r1": {
        return 512;
      }
      case "nist p-521": {
        return 521;
      }
    }

    //@todo check if we covered every cases especially for algo like: Elgamal, ECDH, AEDH and AEDSA
    return undefined;
  }
}

exports.GetGpgKeyInfoService = GetGpgKeyInfoService;
