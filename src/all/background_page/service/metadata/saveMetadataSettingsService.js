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
import MetadataTypesSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import MetadataTypesSettingsApiService from "../api/metadata/metadataTypesSettingsApiService";
import MetadataTypesSettingsLocalStorage from "../local_storage/metadataTypesSettingsLocalStorage";
import {assertString, assertType} from "../../utils/assertions";
import MetadataKeysSettingsApiService from "../api/metadata/metadataKeysSettingsApiService";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";
import MetadataKeysSettingsLocalStorage from "../local_storage/metadataKeysSettingsLocalStorage";
import ShareMetadataKeyPrivateService from "./shareMetadataKeyPrivateService";
import FindMetadataSettingsService from "./findMetadataSettingsService";
import ShareMetadataPrivateKeysCollection
  from "passbolt-styleguide/src/shared/models/entity/metadata/shareMetadataPrivateKeysCollection";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import FindAndUpdateMetadataKeysSessionStorageService from "./findAndUpdateMetadataKeysSessionStorageService";
import EncryptMetadataPrivateKeysService from "./encryptMetadataPrivateKeysService";

/**
 * The service aims to save metadata settings.
 */
export default class SaveMetadataSettingsService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.metadataKeysSettingsApiService = new MetadataKeysSettingsApiService(apiClientOptions);
    this.metadataTypesSettingsApiService = new MetadataTypesSettingsApiService(apiClientOptions);
    this.metadataKeysSettingsLocalStorage = new MetadataKeysSettingsLocalStorage(account);
    this.metadataTypesSettingsLocalStorage = new MetadataTypesSettingsLocalStorage(account);
    this.findMetadataSettingsService = new FindMetadataSettingsService(apiClientOptions);
    this.shareMetadataKeyPrivateService = new ShareMetadataKeyPrivateService(account, apiClientOptions);
    this.findAndUpdateMetadataKeysSessionStorageService = new FindAndUpdateMetadataKeysSessionStorageService(account, apiClientOptions);
    this.encryptMetadataPrivateKeysService = new EncryptMetadataPrivateKeysService(account);
  }

  /**
   * Save the metadata keys settings to the API and update local storage with the latest version.
   * @param {MetadataKeysSettingsEntity} settings The settings to save.
   * @param {string} passphrase The user passphrase.
   * @return {Promise<MetadataKeysSettingsEntity>}
   * @throws {TypeError} if the `settings` argument is not of type MetadataKeysSettingsEntity
   */
  async saveKeysSettings(settings, passphrase) {
    assertType(settings, MetadataKeysSettingsEntity);
    assertString(passphrase, 'The parameter "passphrase" should be a string.');

    const previousSettings = await this.findMetadataSettingsService.findKeysSettings();
    if (previousSettings.zeroKnowledgeKeyShare && !settings.zeroKnowledgeKeyShare) {
      // Add the private keys for the server in the settings and create private keys for users having missing keys to go back to a user-friendly mode
      await this._createServerMetadataPrivateKeys(settings, passphrase);
      await this.shareMetadataKeyPrivateService.shareAllMissing(passphrase);
    }

    const savedSettingsDto = await this.metadataKeysSettingsApiService.save(settings);
    const savedSettings = new MetadataKeysSettingsEntity(savedSettingsDto);
    await this.metadataKeysSettingsLocalStorage.set(savedSettings);

    return savedSettings;
  }

  /**
   * Create server metadata private keys
   * @param {MetadataKeysSettingsEntity} settings The settings to save.
   * @param {string} passphrase The user passphrase.
   * @return {Promise<void>}
   * @private
   */
  async _createServerMetadataPrivateKeys(settings, passphrase) {
    const shareMetadataPrivateKeysCollection = await this._getMetadataPrivateKeys(passphrase);
    const decryptedUserPrivateKey = await this._getDecryptedPrivateKey(passphrase);

    if (!settings.zeroKnowledgeKeyShare) {
      settings.metadataPrivateKeys = await this._buildMetadataKeyForServer(shareMetadataPrivateKeysCollection, decryptedUserPrivateKey);
    }
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
   * Get all metadata private key collection to share.
   * @param {string} passphrase The passphrase
   * @returns {Promise<ShareMetadataPrivateKeysCollection>}
   * @private
   */
  async _getMetadataPrivateKeys(passphrase) {
    const metadataKeysCollection = await this.findAndUpdateMetadataKeysSessionStorageService.findAndUpdateAll(passphrase);
    const shareMetadataPrivateKeysCollection = new ShareMetadataPrivateKeysCollection([]);
    for (const metadataKeyEntity of metadataKeysCollection) {
      shareMetadataPrivateKeysCollection.pushMany(metadataKeyEntity.metadataPrivateKeys.toDto());
    }
    return shareMetadataPrivateKeysCollection;
  }

  /**
   * Build the metadata private key for the server.
   * @param {ShareMetadataPrivateKeysCollection} metadataPrivateKeysCollection The metadata private keys collection.
   * @param {PrivateKey|null} decryptedUserPrivateKey The decrypted private key.
   * @returns {Promise<ShareMetadataPrivateKeysCollection>}
   * @private
   */
  async _buildMetadataKeyForServer(metadataPrivateKeysCollection, decryptedUserPrivateKey) {
    const shareMetadataPrivateKeysCollection = new ShareMetadataPrivateKeysCollection([]);
    // Create metadata private keys for server
    for (const metadataPrivateKey of metadataPrivateKeysCollection) {
      const clonedSharedMetadataPrivateKey = await metadataPrivateKey.cloneForSharing(null);
      if (metadataPrivateKey.dataSignedByCurrentUser) {
        await this.encryptMetadataPrivateKeysService.encryptOne(clonedSharedMetadataPrivateKey, decryptedUserPrivateKey);
      } else {
        await this.encryptMetadataPrivateKeysService.encryptOne(clonedSharedMetadataPrivateKey, null);
      }
      shareMetadataPrivateKeysCollection.push(clonedSharedMetadataPrivateKey);
    }

    return shareMetadataPrivateKeysCollection;
  }

  /**
   * Save the metadata type settings to the API and update local storage with the latest version.
   * @param {MetadataTypesSettingsEntity} settings The settings to save.
   * @return {Promise<MetadataTypesSettingsEntity>}
   */
  async saveTypesSettings(settings) {
    assertType(settings, MetadataTypesSettingsEntity);
    const savedSettingsDto = await this.metadataTypesSettingsApiService.save(settings);
    const savedSettings = new MetadataTypesSettingsEntity(savedSettingsDto);
    await this.metadataTypesSettingsLocalStorage.set(savedSettings);

    return savedSettings;
  }
}
