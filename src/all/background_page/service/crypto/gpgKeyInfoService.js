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

class GpgKeyInfoService {
  /**
   * @param {ExternalGpgKeyEntity} key
   */
  static async getKeyInfo(keyDto) {
    let key = await openpgp.key.readArmored(keyDto.armoredKey);
    if (key.err) {
      throw new Error(key.err[0].message);
    }
    key = key.keys[0];

    // Check the userIds
    const userIds = key.getUserIds();
    const userIdsSplited = [];
    if (userIds.length === 0) {
      throw new Error('No key user ID found');
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
    let expirationTime;
    try {
      expirationTime = await key.getExpirationTime();
      expirationTime = expirationTime.toString();
      if (expirationTime === 'Infinity') {
        expirationTime = 'Never';
      }
      //created = key.primaryKey.created.toString(); //Why it was there as it's not related to expirationTime
    } catch (error) {
      expirationTime = null;
    }

    return {
      armored_key: key.armor(),
      key_id: keyid,
      user_ids: userIdsSplited,
      fingerprint: key.primaryKey.getFingerprint(),
      created: key.primaryKey.getCreationTime().toISOString(),
      expires: expirationTime,
      algorithm: GpgKeyInfoService.formatAlgorithm(key.primaryKey.getAlgorithmInfo().algorithm),
      length: key.primaryKey.getAlgorithmInfo().bits,
      curve: key.primaryKey.getAlgorithmInfo().curve || null,
      private: key.isPrivate(),
      revoked: false //await key.isRevoked()  TODO: do a proper revokation check as the isRevoked() needs parameters and doesn't work with empty params
    };
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

exports.GpgKeyInfoService = GpgKeyInfoService;
