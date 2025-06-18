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
 * @since         4.11.0
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import MetadataPrivateKeysCollection
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeysCollection";
import {assertType} from '../../utils/assertions';
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import EncryptMessageService from "../crypto/encryptMessageService";
import Keyring from "../../model/keyring";

class EncryptMetadataPrivateKeysService {
  /**
   * @constructor
   * @param {AbstractAccountEntity} account the account associated to the worker
   */
  constructor(account) {
    this.account = account;
    this.keyring = new Keyring();
  }

  /**
   * Encrypt a metadata private key and mutate the metadata private key entity data with the encrypted result.
   * Additionally sign the encrypted message with the given private key.
   * If the private key is already encrypted, no action is taken.
   *
   * @param {MetadataPrivateKeyEntity} metadataPrivateKey The metadata private key entity to encrypt.
   * @param {openpgp.PrivateKey} userPrivateKey The user's decrypted private key.
   * @param {object} [options]
   * @param {Date} [options.date] Override the creation date of the message signature
   * @returns {Promise<void>}
   * @throws {TypeError} If `metadataPrivateKey` is not of type MetadataPrivateKeyEntity.
   * @throws {TypeError} If `options.date` is defined and not of type Date.
   * @throws {Error} If `userPrivateKey` is not a decrypted OpenPGP private key.
   */
  async encryptOne(metadataPrivateKey, userPrivateKey = null, options = {}) {
    assertType(metadataPrivateKey, MetadataPrivateKeyEntity, "The 'metadataPrivateKey' parameter should be of type MetadataPrivateKeysEntity.");
    if (typeof options?.date !== "undefined") {
      assertType(options?.date, Date, "The optional 'date' parameter should be of type Date.");
    }

    if (userPrivateKey) {
      await OpenpgpAssertion.assertDecryptedPrivateKey(userPrivateKey);
    }
    if (!metadataPrivateKey.isDecrypted) {
      return;
    }

    const recipientPublicKey = await this._retrieveRecipientKey(metadataPrivateKey.userId);
    const message = JSON.stringify(metadataPrivateKey.data);
    const encryptOptions =  {date: options?.date};
    const signingKeys = userPrivateKey ? [userPrivateKey] : null;
    metadataPrivateKey.data = await EncryptMessageService.encrypt(message, recipientPublicKey, signingKeys, encryptOptions);
  }

  /**
   * Retrieve the recipient's public key. If no user ID is provided, the recipient defaults to the API.
   * @param {string|null} [userId=null] - The user ID to retrieve the public key for.
   * @returns {Promise<openpgp.PublicKey>} - The recipient's public key.
   * @throws {Error} If no public key is found in the keyring for the given user ID.
   * @throws {Error} If the public key found for the user ID is expired.
   * @private
   */
  async _retrieveRecipientKey(userId = null) {
    if (!userId) {
      return OpenpgpAssertion.readKeyOrFail(this.account.serverPublicArmoredKey);
    }

    const userPublicGpgKey = this.keyring.findPublic(userId);

    if (!userPublicGpgKey) {
      throw new Error(`The public key for the user with ID ${userId} could not be found.`);
    }
    if (userPublicGpgKey.isExpired) {
      throw new Error(`The public key for the user with ID ${userId} is expired.`);
    }

    return OpenpgpAssertion.readKeyOrFail(userPublicGpgKey.armoredKey);
  }

  /**
   * Encrypts a collection of metadata private key entities and mutates all entities data with their encrypted result.
   *
   * @param {MetadataPrivateKeysCollection} metadataPrivateKeys The collection of metadata private key entities to encrypt.
   * @param {openpgp.PrivateKey} userPrivateKey The user's decrypted private key.
   * @returns {Promise<void>}
   * @throws {TypeError} If `metadataPrivateKeys` is not of type MetadataPrivateKeysCollection.
   * @throws {Error} If `userPrivateKey` is not a decrypted OpenPGP private key.
   */
  async encryptAll(metadataPrivateKeys, userPrivateKey) {
    assertType(metadataPrivateKeys, MetadataPrivateKeysCollection, "The 'metadataPrivateKeys' parameter should be of type MetadataPrivateKeysCollection.");
    await OpenpgpAssertion.assertDecryptedPrivateKey(userPrivateKey);
    for (const metadataPrivateKey of metadataPrivateKeys.items) {
      await this.encryptOne(metadataPrivateKey, userPrivateKey);
    }
  }

  /**
   * Encrypt the metadata private keys from a metadata key entity and mutate all metadata private key entities with
   * their encrypted result.
   *
   * @param {MetadataKeyEntity} metadataKey The metadata key entity containing the private keys to encrypt.
   * @param {openpgp.PrivateKey} userPrivateKey The user's decrypted private key.
   * @returns {Promise<void>}
   * @throws {TypeError} If `metadataKey` is not of type MetadataKeyEntity.
   * @throws {Error} If `userPrivateKey` is not a decrypted OpenPGP private key.
   */
  async encryptAllFromMetadataKeyEntity(metadataKey, userPrivateKey) {
    assertType(metadataKey, MetadataKeyEntity, "The 'metadataKey' parameter should be of type MetadataKeyEntity.");
    await OpenpgpAssertion.assertDecryptedPrivateKey(userPrivateKey);
    await this.encryptAll(metadataKey.metadataPrivateKeys, userPrivateKey);
  }
}

export default EncryptMetadataPrivateKeysService;
