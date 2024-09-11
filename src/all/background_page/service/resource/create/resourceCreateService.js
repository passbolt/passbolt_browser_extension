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

class ResourceCreateService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions, progressService) {
    this.account = account;
    this.resourceService = new ResourceService(apiClientOptions);
    this.folderModel = new FolderModel(apiClientOptions);
    this.shareModel = new ShareModel(apiClientOptions);
    this.keyring = new Keyring();
    this.progressService = progressService;
    this.resourceModel = new ResourceModel(apiClientOptions, this.account);
  }

  /**
   * Create a resource.
   *
   * @param {object} resourceDto The resource data
   * @param {string|object} plaintextDto The secret to encrypt
   * @param {string} passphrase The user passphrase
   * @return {Promise<ResourceEntity>} resourceEntity
   */
  async exec(resourceDto, plaintextDto, passphrase) {
    let resource = new ResourceEntity(resourceDto);

    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const plaintext = await this.resourceModel.serializePlaintextDto(resource.resourceTypeId, plaintextDto);

    // Encrypt and sign
    await this.progressService?.finishStep(i18n.t('Encrypting secret'), true);
    const userPublicKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPublicArmoredKey);
    const secret = await EncryptMessageService.encrypt(plaintext, userPublicKey, [privateKey]);
    resource.secrets = new ResourceSecretsCollection([{data: secret}]);

    // Save
    await this.progressService?.finishStep(i18n.t('Creating password'), true);
    resource = await this.create(resource);

    // Share if needed
    if (resource.folderParentId) {
      await this.handleCreateInFolder(resource, privateKey);
    }

    return resource;
  }

  /**
   * Create a resource using Passbolt API and add result to local storage
   *
   * @param {ResourceEntity} resourceEntity
   * @returns {Promise<ResourceEntity>}
   * @private
   */
  async create(resourceEntity) {
    const data = resourceEntity.toV4Dto({secrets: true});
    const contain = {permission: true, favorite: true, tags: true, folder: true};
    const resourceDto = await this.resourceService.create(data, contain);
    const newResourceEntity = new ResourceEntity(resourceDto);
    await ResourceLocalStorage.addResource(newResourceEntity);
    return newResourceEntity;
  }

  /**
   * Handle post create operations if resource is created in folder
   * This includes sharing the resource to match the parent folder permissions
   *
   * @param {ResourceEntity} resourceEntity
   * @param {openpgp.PrivateKey} privateKey The user decrypted private key
   * @returns {Promise<void>}
   * @private
   */
  async handleCreateInFolder(resourceEntity, privateKey) {
    // Calculate changes if any
    await this.progressService?.finishStep(i18n.t('Calculate permissions'), true);
    const destinationFolder = await this.folderModel.findForShare(resourceEntity.folderParentId);
    const changes = await this.resourceModel.calculatePermissionsChangesForCreate(resourceEntity, destinationFolder);

    // Apply changes
    if (changes.length) {
      if (this.progressService) {
        const goals = (changes.length * 3) + 2 + this.progressService.progress; // closer to reality...
        this.progressService.updateGoals(goals);
      }

      // Sync keyring
      await this.progressService?.finishStep(i18n.t('Synchronizing keys'), true);
      await this.keyring.sync();

      // Share
      await this.progressService?.finishStep(i18n.t('Start sharing'), true);
      const resourcesToShare = [resourceEntity.toDto({secrets: true})];
      await this.shareModel.bulkShareResources(resourcesToShare, changes.toDto(), privateKey, async message =>
        await this.progressService?.finishStep(message)
      );
      await this.resourceModel.updateLocalStorage();
    }
  }
}

export default ResourceCreateService;
