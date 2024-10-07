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
 * @since         4.10.0
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import PassphraseStorageService from '../session_storage/passphraseStorageService';
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";
import MetadataPrivateKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeysCollection";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import {assertType} from '../../utils/assertions';
import DecryptPrivateKeyService from '../crypto/decryptPrivateKeyService';
import DecryptMessageService from '../crypto/decryptMessageService';

class DecryptMetadataPrivateKeysService {
  /**
   * @constructor
   * @param {AbstractAccountEntity} account the account associated to the worker
   */
  constructor(account) {
    this.account = account;
  }

  /**
   * Decrypts a metadata private key and mutate the metadata private key entity with the decrypted result.
   *
   * @param {MetadataPrivateKeyEntity} metadataPrivateKeyEntity the metadata private key entity to decrypt.
   * @param {string} [passphrase = null] The passphrase to use to decrypt the metadata private key.
   * @returns {Promise<void>}
   * @throws {TypeError} if the `metadataPrivateKeyEntity` is not of type MetadataPrivateKeyEntity
   * @throws {Error} if the `metadataPrivateKeyEntity` is already decrypted
   * @throws {Error} if metadata private key entity data is not a valid openPGP message.
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   */
  async decryptOne(metadataPrivateKeyEntity, passphrase = null) {
    assertType(metadataPrivateKeyEntity, MetadataPrivateKeyEntity, "The given entity is not a MetadataPrivateKeyEntity");
    if (metadataPrivateKeyEntity.isDecrypted) {
      throw new Error("The metadata private key should not be already decrypted.");
    }

    const message = await OpenpgpAssertion.readMessageOrFail(metadataPrivateKeyEntity.data);

    passphrase = passphrase || await this.getPassphraseFromLocalStorageOrFail();

    const userDecryptedPrivateArmoredKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const metadataPrivateArmoredKey = await DecryptMessageService.decrypt(message, userDecryptedPrivateArmoredKey);

    metadataPrivateKeyEntity.armoredKey = metadataPrivateArmoredKey;
  }

  /**
   * Decrypts a collection of metadata private key entities and mutate all entities with their decrypted result.
   *
   * @param {MetadataPrivateKeysCollection} metadataPrivateKeysCollection the metadata private keys collection to decrypt.
   * @param {string} [passphrase = null] The passphrase to use to decrypt the metadata private key.
   * @returns {Promise<void>}
   * @throws {TypeError} if the `MetadataPrivateKeysCollection` is not of type MetadataPrivateKeysCollection
   * @throws {Error} if one of the `MetadataPrivateKeyEntity` is already decrypted
   * @throws {Error} if one of the metadata private key entity data is not a valid openPGP message.
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   */
  async decryptAll(metadataPrivateKeysCollection, passphrase = null) {
    assertType(metadataPrivateKeysCollection, MetadataPrivateKeysCollection, "The given collection is not of the type MetadataPrivateKeysCollection");

    passphrase = passphrase || await this.getPassphraseFromLocalStorageOrFail();

    const items = metadataPrivateKeysCollection.items;
    for (let i = 0; i < items.length; i++) {
      const metadataPrivateKeyEntity = items[i];
      await this.decryptOne(metadataPrivateKeyEntity, passphrase);
    }
  }

  /**
   * Decrypts the metadata private keys from a metadata keys collection
   * and mutate all metadata private key entities with their decrypted result.
   *
   * @param {MetadataKeysCollection} metadataKeysCollection the metadata keys collection to decrypt.
   * @param {string} [passphrase = null] The passphrase to use to decrypt the metadata private key.
   * @returns {Promise<void>}
   * @throws {TypeError} if the `MetadataPrivateKeysCollection` is not of type MetadataPrivateKeysCollection
   * @throws {Error} if one of the `MetadataPrivateKeyEntity` is already decrypted
   * @throws {Error} if one of the metadata private key entity data is not a valid openPGP message.
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   */
  async decryptAllFromMetadataKeysCollection(metadataKeysCollection, passphrase = null) {
    assertType(metadataKeysCollection, MetadataKeysCollection, "The given collection is not of the type MetadataKeysCollection");

    passphrase = passphrase || await this.getPassphraseFromLocalStorageOrFail();

    const items = metadataKeysCollection.items;
    for (let i = 0; i < items.length; i++) {
      const metadataKeysCollection = items[i].metadataPrivateKeys;
      await this.decryptAll(metadataKeysCollection, passphrase);
    }
  }

  /**
   * Retrieve the user passphrase from the local storage or fail.
   *
   * @returns {Promise<string>}
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   * @private
   */
  async getPassphraseFromLocalStorageOrFail() {
    const passphrase = await PassphraseStorageService.get();
    if (!passphrase) {
      throw new UserPassphraseRequiredError();
    }
    return passphrase;
  }
}

export default DecryptMetadataPrivateKeysService;
