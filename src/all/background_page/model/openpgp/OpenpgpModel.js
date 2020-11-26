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
 */
// const {OpenpgpkeyEntity} = require("../entity/gpgkey/local/localGpgkeyEntity");

class OpenpgpModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {

  }
  //
  // /**
  //  * Generate a key
  //  * @param {OpenpgpkeyEntity} openpgpkeyEntity The openpgp entity
  //  * @returns {Promise<OpenpgpkeyEntity>} The opengpg entity populated with the generated key
  //  * @throws {Error} if options are invalid or the operation failed for an unexpected reason
  //  */
  // async generateKey(openpgpkeyEntity) {
  //   const openpgpKey = await openpgp.generateKey({
  //     rsaBits: openpgpkeyEntity.rsaBits,
  //     userIds: [openpgpkeyEntity.userId],
  //     passphrase: openpgpkeyEntity.passphrase
  //   });
  //   const openpgpkeyDto = {
  //     ...(await this.parseOpenpgpkey(openpgpKey.key)).toDto(),
  //     ...openpgpkeyEntity.toDto()
  //   };
  //
  //   return new OpenpgpkeyEntity(openpgpkeyDto);
  // }

  // @todo maybe useful for retrieving the server key and test the imported gpg key
  async parseArmoredKey(armoredKey) {
    let openpgpKey = await openpgp.key.readArmored(armoredKey);
    if (openpgpKey.err) {
      throw new Error(openpgpKey.err[0].message);
    }
    return this.parseOpenpgpkey(openpgpKey.keys[0]);
  }

  async parseOpenpgpkey(openpgpKey) {
    // extract the user id
    const userId = openpgpKey.getUserIds()[0];
    // extract the key id
    let keyId = openpgpKey.primaryKey.getKeyId().toHex();
    keyId = keyId.substring(keyId.length - 8);
    // extract the secret armored key
    const secretArmoredKey = openpgpKey.armor()
    // extract the public armored key
    const publicArmoredKey = openpgpKey.toPublic().armor();
    // extract rsa bits
    const rsaBits = openpgpKey.primaryKey.getAlgorithmInfo().bits;

    const openpgpkeyDto = {userId, keyId, secretArmoredKey, publicArmoredKey, rsaBits};
    return new OpenpgpkeyEntity(openpgpkeyDto);
  }
}

exports.OpenpgpModel = OpenpgpModel;
