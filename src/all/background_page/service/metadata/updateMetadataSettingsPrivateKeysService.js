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
 * @since         5.5.0
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {assertString, assertType} from "../../utils/assertions";
import FindUsersService from "../user/findUsersService";
import EncryptMetadataPrivateKeysService from "./encryptMetadataPrivateKeysService";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";
import Keyring from "../../model/keyring";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import ShareMetadataPrivateKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/shareMetadataPrivateKeysCollection";
import FindMetadataKeysService from "./findMetadataKeysService";

/**
 * The service aims to update metadata private keys to go back from a zero-knowledge to a user friendly-mode.
 */
export default class UpdateMetadataSettingsPrivateKeysService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.keyring = new Keyring();
    this.findUsersService = new FindUsersService(account, apiClientOptions);
    this.encryptMetadataPrivateKeysService = new EncryptMetadataPrivateKeysService(account);
    this.findMetadataKeysService = new FindMetadataKeysService(apiClientOptions, account);
  }

  /**
   * Update metadata key settings to add for users having missing keys and the server to go back from a zero-knowledge to a user friendly-mode.
   * Note: the service alter the metadataKeysSettings to add the metadata private keys needed to be stored.
   * @param {MetadataKeysSettingsEntity} metadataKeysSettings The metadata key settings entity.
   * @param {string} passphrase The user passphrase.
   * @returns {Promise<void>}
   * @throws {TypeError} if metadataKeysSettings argument is not of the expected type
   * @throws {TypeError} if passphrase argument is not a string
   */
  async updateKeys(metadataKeysSettings, passphrase) {
    assertType(metadataKeysSettings, MetadataKeysSettingsEntity, "The parameter 'metadataKeysSettings' should be a MetadataKeysSettingsEntity");
    assertString(passphrase, 'The parameter "passphrase" should be a string.');

    if (this.account.roleName !== RoleEntity.ROLE_ADMIN) {
      throw new Error("This action can only be performed by an administrator.");
    }

    await this.keyring.sync();
    const shareMetadataPrivateKeysCollection = await this._getMetadataPrivateKeys(passphrase);
    const decryptedUserPrivateKey = await this._getDecryptedPrivateKey(passphrase);
    const metadataPrivateKeysDto = await this._buildMetadataKeyForUsers(shareMetadataPrivateKeysCollection, decryptedUserPrivateKey);

    if (!metadataKeysSettings.zeroKnowledgeKeyShare) {
      const metadataPrivateKeyServer = await this._buildMetadataKeyForServer(shareMetadataPrivateKeysCollection, decryptedUserPrivateKey);
      metadataPrivateKeysDto.push(...metadataPrivateKeyServer);
    }

    metadataKeysSettings.metadataPrivateKeys = new ShareMetadataPrivateKeysCollection(metadataPrivateKeysDto);
  }

  /**
   * Get all metadata private key collection to share.
   * @param {string} passphrase The passphrase
   * @returns {Promise<ShareMetadataPrivateKeysCollection>}
   * @private
   */
  async _getMetadataPrivateKeys(passphrase) {
    const metadataKeysCollection = await this.findMetadataKeysService.findAllForSessionStorage(passphrase);
    const shareMetadataPrivateKeysCollection = new ShareMetadataPrivateKeysCollection([]);
    for (const metadataKeyEntity of metadataKeysCollection) {
      shareMetadataPrivateKeysCollection.pushMany(metadataKeyEntity.metadataPrivateKeys.toDto());
    }
    return shareMetadataPrivateKeysCollection;
  }

  /**
   * Get decrypted private key
   * @param {string} passphrase The passphrase
   * @return {Promise<PrivateKey|null>}
   * @private
   */
  async _getDecryptedPrivateKey(passphrase) {
    const encryptedUserPrivateKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPrivateArmoredKey);
    return await DecryptPrivateKeyService.decrypt(encryptedUserPrivateKey, passphrase);
  }

  /**
   * Build the metadata private key array for users having missing keys.
   * @param {ShareMetadataPrivateKeysCollection} metadataPrivateKeysCollection The metadata private key.
   * @param {PrivateKey|null} decryptedUserPrivateKey The decrypted private key.
   * @returns {Promise<Array<object>>}
   * @private
   */
  async _buildMetadataKeyForUsers(metadataPrivateKeysCollection, decryptedUserPrivateKey) {
    const users = await this.findUsersService.findAllActiveWithMissingKeys();
    users.filterByCallback(user => user.missingMetadataKeysIds.length > 0);
    const metadataPrivateKeysDto = [];

    for (const user of users) {
      for (const metadataPrivateKey of metadataPrivateKeysCollection) {
        const clonedSharedMetadataPrivateKey = await metadataPrivateKey.cloneForSharing(user.id);
        if (metadataPrivateKey.dataSignedByCurrentUser) {
          await this.encryptMetadataPrivateKeysService.encryptOne(clonedSharedMetadataPrivateKey, decryptedUserPrivateKey);
        } else {
          await this.encryptMetadataPrivateKeysService.encryptOne(clonedSharedMetadataPrivateKey, null);
        }
        metadataPrivateKeysDto.push(clonedSharedMetadataPrivateKey);
      }
    }

    return metadataPrivateKeysDto;
  }

  /**
   * Build the metadata private key for the server.
   * @param {ShareMetadataPrivateKeysCollection} metadataPrivateKeysCollection The metadata private keys collection.
   * @param {PrivateKey|null} decryptedUserPrivateKey The decrypted private key.
   * @returns {Promise<Array<object>>}
   * @private
   */
  async _buildMetadataKeyForServer(metadataPrivateKeysCollection, decryptedUserPrivateKey) {
    const metadataPrivateKeysDto = [];
    // Create metadata private keys for server
    for (const metadataPrivateKey of metadataPrivateKeysCollection) {
      const clonedSharedMetadataPrivateKey = await metadataPrivateKey.cloneForSharing(null);
      if (metadataPrivateKey.dataSignedByCurrentUser) {
        await this.encryptMetadataPrivateKeysService.encryptOne(clonedSharedMetadataPrivateKey, decryptedUserPrivateKey);
      } else {
        await this.encryptMetadataPrivateKeysService.encryptOne(clonedSharedMetadataPrivateKey, null);
      }
      metadataPrivateKeysDto.push(clonedSharedMetadataPrivateKey);
    }

    return metadataPrivateKeysDto;
  }
}
