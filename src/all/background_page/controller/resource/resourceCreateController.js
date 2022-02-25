/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.9.0
 */
const {i18n} = require('../../sdk/i18n');

const {Keyring} = require('../../model/keyring');
const {Share} = require('../../model/share');
const {User} = require('../../model/user');

const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceEntity} = require('../../model/entity/resource/resourceEntity');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {ResourceSecretsCollection} = require("../../model/entity/secret/resource/resourceSecretsCollection");

const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');
const {EncryptMessageService} = require('../../service/crypto/encryptMessageService');
const {GetDecryptedUserPrivateKeyService} = require('../../service/account/getDecryptedUserPrivateKeyService');

class ResourceCreateController {
  /**
   * ResourceCreateController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceModel = new ResourceModel(clientOptions);
    this.folderModel = new FolderModel(clientOptions);
    this.keyring = new Keyring();
    this.progress = 0;
    this.goals = 0;
  }

  /**
   * Create a resource.
   *
   * @param {object} resourceDto The resource data
   * @param {string|object} plaintextDto The secret to encrypt
   * @return {Promise<ResourceEntity>} resourceEntity
   */
  async main(resourceDto, plaintextDto) {
    let privateKey;

    /*
     * set default goals, we give arbitrarily "more" goals if a parent permission folder is set
     * as we don't know how many 'share' operations are needed yet
     */
    let resource = new ResourceEntity(resourceDto);
    this.goals = resource.folderParentId ? 10 : 2;

    // Get the passphrase if needed and decrypt secret key
    try {
      const passphrase = await passphraseController.get(this.worker);
      privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
    } catch (error) {
      console.error(error);
      throw error;
    }

    try {
      await progressController.open(this.worker, i18n.t('Creating password'), this.goals, i18n.t('Initializing'));
      const plaintext = await this.resourceModel.serializePlaintextDto(resource.resourceTypeId, plaintextDto);

      // Encrypt and sign
      await progressController.update(this.worker, this.progress++, i18n.t('Encrypting secret'));
      const userPublicKey = this.keyring.findPublic(User.getInstance().get().id).armoredKey;
      const secret = (await EncryptMessageService.encrypt(plaintext, userPublicKey, privateKey)).data;
      resource.secrets = new ResourceSecretsCollection([{data: secret}]);

      // Save
      await progressController.update(this.worker, this.progress++, i18n.t('Creating password'));
      resource = await this.resourceModel.create(resource);

      // Share if needed
      if (resource.folderParentId) {
        await this.handleCreateInFolder(resource, privateKey);
      }
    } catch (error) {
      console.error(error);
      await progressController.close(this.worker);
      throw error;
    }

    await progressController.update(this.worker, this.goals, i18n.t('Done!'));
    await progressController.close(this.worker);

    return resource;
  }

  /**
   * Handle post create operations if resource is created in folder
   * This includes sharing the resource to match the parent folder permissions
   *
   * @param {ResourceEntity} resourceEntity
   * @param {openpgp.key.Key} privateKey The user decrypted private key
   * @returns {Promise<void>}
   */
  async handleCreateInFolder(resourceEntity, privateKey) {
    // Calculate changes if any
    await progressController.update(this.worker, this.progress++, i18n.t('Calculate permissions'));
    const destinationFolder = await this.folderModel.findForShare(resourceEntity.folderParentId);
    const changes = await this.resourceModel.calculatePermissionsChangesForCreate(resourceEntity, destinationFolder);

    // Apply changes
    if (changes.length) {
      this.goals = (changes.length * 3) + 2 + this.progress; // closer to reality...
      await progressController.updateGoals(this.worker, this.goals);

      // Sync keyring
      await progressController.update(this.worker, this.progress++, i18n.t('Synchronizing keys'));
      await this.keyring.sync();

      // Share
      await progressController.update(this.worker, this.progress++, i18n.t('Start sharing'));
      const resourcesToShare = [resourceEntity.toDto({secrets: true})];
      await Share.bulkShareResources(resourcesToShare, changes.toDto(), privateKey, async message => {
        await progressController.update(this.worker, this.progress++, message);
      });
      await this.resourceModel.updateLocalStorage();
    }
  }
}

exports.ResourceCreateController = ResourceCreateController;
