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

import FolderModel from "../../../model/folder/folderModel";
import Keyring from "../../../model/keyring";
import ShareModel from "../../../model/share/shareModel";
import {OpenpgpAssertion} from "../../../utils/openpgp/openpgpAssertions";
import EncryptMessageService from "../../crypto/encryptMessageService";
import ResourceSecretsCollection from "../../../model/entity/secret/resource/resourceSecretsCollection";
import ResourceEntity from "../../../model/entity/resource/resourceEntity";
import ResourceService from "../../api/resource/resourceService";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import i18n from "../../../sdk/i18n";
import ResourceModel from "../../../model/resource/resourceModel";
import DecryptPrivateKeyService from "../../crypto/decryptPrivateKeyService";
import FindAndUpdateResourcesLocalStorage from "../findAndUpdateResourcesLocalStorageService";
import ResourceTypeModel from "../../../model/resourceType/resourceTypeModel";
import EncryptMetadataKeysService from "../../metadata/encryptMetadataService";
import PermissionChangesCollection from "../../../model/entity/permission/change/permissionChangesCollection";

class ResourceCreateService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions, progressService) {
    this.account = account;
    this.resourceService = new ResourceService(apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.folderModel = new FolderModel(apiClientOptions, account);
    this.shareModel = new ShareModel(apiClientOptions);
    this.keyring = new Keyring();
    this.progressService = progressService;
    this.resourceModel = new ResourceModel(apiClientOptions, this.account);
    this.encryptMetadataKeysService = new EncryptMetadataKeysService(apiClientOptions, this.account);
    this.findAndUpdateResourcesLocalStorage = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);
  }

  /**
   * Create a resource.
   *
   * @param {object} resourceDto The resource data
   * @param {string|object} secretDto The secret to encrypt
   * @param {string} passphrase The user passphrase
   * @return {Promise<ResourceEntity>} resourceEntity
   */
  async create(resourceDto, secretDto, passphrase) {
    const resource = new ResourceEntity(resourceDto);
    const resourceTypes = await this.resourceTypeModel.getOrFindAll();
    const resourceType = resourceTypes.getFirstById(resource.resourceTypeId);
    // Keep a copy of the metadata. It will be used after creation on the API, to persist it decrypted into the local storage.
    const resourceMetadata = resource.metadata;
    // Get private key decrypted to encrypt data
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    let permissionChanges = new PermissionChangesCollection([]);
    let destinationFolder;
    if (resource.folderParentId) {
      destinationFolder = await this.folderModel.findForShare(resource.folderParentId);
      if (destinationFolder.permissions.length > 1 || destinationFolder.permissions.items[0].aroForeignKey !== this.account.userId) {
        permissionChanges = destinationFolder.permissions;
      }
    }
    this.updateGoals(resourceType.isV5(), permissionChanges.length);
    await this.encryptMetadata(resource, resourceType, permissionChanges, passphrase);
    await this.buildAndEncryptUserSecret(resource, secretDto, privateKey);
    const createdResource = await this.save(resource, resourceType);
    // If resource v5, metadata will be returned encrypted, replace it with the original decrypted copy.
    if (resourceType.isV5()) {
      createdResource.metadata = resourceMetadata;
    }
    await ResourceLocalStorage.addResource(createdResource);
    // Share the resource with the metadata decrypted
    await this.share(createdResource, privateKey, destinationFolder, permissionChanges);
    return createdResource;
  }


  /**
   * Save the resource on the API.
   *
   * @param {ResourceEntity} resource The resource
   * @param {ResourceTypeEntity} resourceType The resource type
   * @returns {Promise<ResourceEntity>}
   * @private
   */
  async save(resource, resourceType) {
    await this.progressService.finishStep(i18n.t('Creating password'), true);

    const resourceDto = resourceType.isV5() ? resource.toDto({secrets: true}) : resource.toV4Dto({secrets: true});
    const contain = {permission: true, favorite: true, tags: true, folder: true};
    const newResourceDto = await this.resourceService.create(resourceDto, contain);
    return new ResourceEntity(newResourceDto);
  }

  /**
   * Build and encrypt user secret.
   *
   * @param {ResourceEntity} resource
   * @param {string|object} secretDto
   * @param {openpgp.PrivateKey} privateKey The user private key
   * @returns {Promise}
   * @private
   */
  async buildAndEncryptUserSecret(resource, secretDto, privateKey) {
    const serializedSecret = await this.resourceModel.serializePlaintextDto(resource.resourceTypeId, secretDto);

    // Encrypt and sign
    await this.progressService.finishStep(i18n.t('Encrypting secret'), true);
    const userPublicKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPublicArmoredKey);
    const secret = await EncryptMessageService.encrypt(serializedSecret, userPublicKey, [privateKey]);
    resource.secrets = new ResourceSecretsCollection([{data: secret}]);
  }

  /**
   * Share the resource.
   *
   * @param {ResourceEntity} resource The resource to share.
   * @param {openpgp.PrivateKey} privateKey The user decrypted private key
   * @param {FolderEntity} folder The folder entity
   * @param {PermissionChangesCollection} permissionChangesFromFolder The permission changes
   * @returns {Promise<void>}
   * @private
   */
  async share(resource, privateKey, folder, permissionChangesFromFolder) {
    if (!folder || !permissionChangesFromFolder.length) {
      return;
    }
    // Calculate resource creation share permission changes.
    await this.progressService.finishStep(i18n.t('Calculate permissions'), true);
    // Whenever a resource is created into a folder, its creation will be followed by a share operation
    const permissionChanges = await this.resourceModel.calculatePermissionsChangesForCreate(resource, folder);

    await this.progressService?.finishStep(i18n.t('Synchronizing keys'), true);
    await this.keyring.sync();

    await this.progressService?.finishStep(i18n.t('Start sharing'), true);
    const resourcesToShare = [resource.toDto({secrets: true})];
    await this.shareModel.bulkShareResources(resourcesToShare, permissionChanges.toDto(), privateKey, async message =>
      await this.progressService?.finishStep(message)
    );
    await this.findAndUpdateResourcesLocalStorage.findAndUpdateAll();
  }

  /**
   * Encrypt resource metadata if v5.
   * @param {ResourceEntity} resource The resource
   * @param {ResourceTypeEntity} resourceType The resource type
   * @param {PermissionChangesCollection} permissionChanges The permission changes
   * @param {string} passphrase The user passphrase
   * @private
   */
  async encryptMetadata(resource, resourceType, permissionChanges, passphrase) {
    if (!resourceType.isV5()) {
      return;
    }
    await this.progressService.finishStep(i18n.t("Encrypting Metadata"), true);
    resource.personal = !permissionChanges.length;
    await this.encryptMetadataKeysService.encryptOneForForeignModel(resource, passphrase);
  }

  /**
   * Update goals
   * @param {boolean} shouldEncryptMetadata if metadata should be encrypted
   * @param {number} changesLength number of permissions changes
   * @private
   */
  updateGoals(shouldEncryptMetadata, changesLength = 0) {
    const stepToCreate = shouldEncryptMetadata ? 4 : 3; // number of step to create a resource;
    const stepPreparingShare = changesLength > 0 ? 3 : 0; // number of step preparing a share;
    // Goals = number of share (with 3 steps each time) + number of step to create a resource
    this.progressService.updateGoals(changesLength * 3 + stepPreparingShare + stepToCreate);
  }
}

export default ResourceCreateService;
