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
 * @since         3.5.0
 */

const {goog} = require('../../utils/format/emailaddress');
const {ExternalGpgKeyEntity} = require('../../model/entity/gpgkey/external/externalGpgKeyEntity');
const {GpgKeyError} = require('../../error/GpgKeyError');

class GetGpgKeyInfoService {
  /**
   * Returns the information of the given key.
   *
   * @param {ExternalGpgKeyEntity|openpgp.key.Key|string} key The key to get the info from.
   * @return {ExternalGpgKeyEntity}
   */
  static async getKeyInfo(key) {
    const readKey = await this._readOpenPgpKey(key);
    return await this._keyInfo(readKey);
  }

  /**
   * Read an openpgp key from different supported format.
   *
   * @param {ExternalGpgKeyEntity|openpgp.key.Key|string} key The key to read.
   * @return {openpgp.key.Key}
   */
  static async _readOpenPgpKey(key) {
    if (key instanceof openpgp.key.Key) {
      return key;
    } else if (key instanceof ExternalGpgKeyEntity) {
      return this._readOpenpgpKeyFromArmoredKey(key.armoredKey);
    } else if (typeof key === "string") {
      return this._readOpenpgpKeyFromArmoredKey(key);
    }

    throw new GpgKeyError("Cannot parse key from the given data");
  }

  /**
   * Read an armored key.
   *
   * @param {string} armoredKey The armored key to read.
   * @returns {Promise<openpgp.key.Key>}
   * @throws {GpgKeyError} If the armored key cannot be read
   * @private
   */
  static async _readOpenpgpKeyFromArmoredKey(armoredKey) {
    let result = null;
    try {
      result = await openpgp.key.readArmored(armoredKey);
    } catch (e) {
      throw new GpgKeyError(e.message);
    }

    if (result.err) {
      throw new GpgKeyError(result.err[0].message);
    }

    return result.keys[0];
  }

  /**
   * Returns key information.
   *
   * @param {openpgp.key.Key} key The key to get info from.
   * @returns {Promise<ExternalGpgKeyEntity>}
   */
  static async _keyInfo(key) {
    // Check the userIds
    const userIds = key.getUserIds();
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
    let keyid = key.primaryKey.getKeyId().toHex();
    if (keyid.length > 8) {
      keyid = keyid.substr(keyid.length - 8);
    }

    // Format expiration time
    const opengpgExpirationTime = await key.getExpirationTime();
    const expirationTime = opengpgExpirationTime === Infinity
      ? "Never"
      : opengpgExpirationTime.toISOString();

    const externalGpgKeyDto = {
      armored_key: key.armor(),
      key_id: keyid,
      user_ids: userIdsSplited,
      fingerprint: key.primaryKey.getFingerprint(),
      created: key.primaryKey.getCreationTime().toISOString(),
      expires: expirationTime,
      algorithm: this.formatAlgorithm(key.primaryKey.getAlgorithmInfo().algorithm),
      length: key.primaryKey.getAlgorithmInfo().bits,
      curve: key.primaryKey.getAlgorithmInfo().curve || null,
      private: key.isPrivate(),
      revoked: await key.isRevoked()
    };

    return new ExternalGpgKeyEntity(externalGpgKeyDto);
  }

  static formatAlgorithm(algorithmName) {
    switch (algorithmName) {
      case "rsa_encrypt_sign":
      case "rsa_encrypt":
      case "rsa_sign":
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
}

exports.GetGpgKeyInfoService = GetGpgKeyInfoService;
