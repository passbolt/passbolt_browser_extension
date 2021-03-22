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
 * @since         2.8.0
 */
const {Crypto} = require('../../model/crypto');
const {Keyring} = require('../../model/keyring');
const {Share} = require('../../model/share');
const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {PermissionChangesCollection} = require('../../model/entity/permission/change/permissionChangesCollection');
const {FoldersCollection} = require('../../model/entity/folder/foldersCollection');

const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');
const {i18n} = require('../../sdk/i18n');

class ShareFoldersController {
  /**
   * Controller constructor
   *
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.folderModel = new FolderModel(apiClientOptions);
    this.resourceModel = new ResourceModel(apiClientOptions);
    this.keyring = new Keyring();
    this.crypto = new Crypto();

    // Work variables
    this.folders = null;
    this.folder = null;
    this.subFolders = null;
    this.resources = null;

    this.originalChanges = null;
    this.foldersChanges = new PermissionChangesCollection([]);
    this.resourcesChanges = new PermissionChangesCollection([]);

    this.passphrase = null;
    this.privateKey = null;
  }

  /**
   * Orchestrate dialogs during the share operation
   *
   * @param {FoldersCollection} folders
   * @param {PermissionChangesCollection} changes
   * @return {Promise}
   */
  async main(folders, changes) {
    this.assertValidParameters(folders, changes);

    try {
      await this.getPassphrase();
    } catch(error) {
      this.cleanup();
      throw error;
    }

    try {
      await progressController.open(this.worker, i18n.t('Sharing folder {{name}}', {name: this.folder.name}), 1, i18n.t('Initializing ...'));
      await this.findAllForShare();
      await this.setGoals();
      await this.calculateChanges();
      await this.share();
      await progressController.update(this.worker, this.goals, i18n.t('Done'));
      await progressController.close(this.worker);
      this.cleanup()
    } catch(error) {
      await progressController.close(this.worker);
      this.cleanup()
      throw error;
    }
  }

  /**
   * Assert controller main parameters are valid
   *
   * @param {FoldersCollection} folders
   * @param {PermissionChangesCollection} changes
   * @throws {Error} if multi share requested, if no changes are provided
   */
  assertValidParameters(folders, changes) {
    if (!folders || folders.length > 1) {
      throw new Error('Sharing multiple folders at once is not supported');
    }
    if (!changes || !changes.length) {
      throw new Error('ShareFoldersController, invalid request changes can not be empty.');
    }

    this.folders = folders;
    this.folder = folders.items[0];
    this.originalChanges = changes;

    if (!this.folder.isOwner()) {
      throw new Error(i18n.t('The folder cannot be shared. Insufficient rights.'));
    }
  }

  /**
   * GetPassphrase
   * @returns {Promise<void>}
   */
  async getPassphrase() {
    // Get the passphrase if needed and decrypt secret key
    // We do this to confirm the move even if there is nothing to decrypt/re-encrypt
    const passphrase = await passphraseController.get(this.worker);
    this.privateKey = await this.crypto.getAndDecryptPrivateKey(passphrase);
  }

  /**
   * findAllForShare
   * @returns {Promise<void>}
   */
  async findAllForShare() {
    // Get all folders contained in this folder
    // and get all the resources contain in this folder and subfolders
    this.subFolders = await this.folderModel.getAllChildren([this.folder.id]);
    this.resources = await this.resourceModel.getAllByParentIds([this.folder.id, ...this.subFolders.ids]);

    // filter to keep only the resources and folders where the user can change permissions / share
    this.resources = this.resources.getAllWhereOwner();
    this.subFolders = this.subFolders.getAllWhereOwner();

    // Get more detailed permissions for all of these affected items if any
    if (this.resources.length) {
      this.resources = await this.resourceModel.findAllForShare(this.resources.ids);
    }
    if (this.subFolders.length) {
      this.subFolders = await this.folderModel.findAllForShare(this.subFolders.ids);
    }
  }

  /**
   * Set goals and init progress counter
   * @returns {Promise<void>}
   */
  async setGoals() {
    // calculate changes for folder + subfolders + resources
    // init + (folders to update * 2) + (resources to update * get secret, decrypt, encrypt, share) + sync keyring
    this.goals = 3 + (this.subFolders.length * 2) + (this.resources.length * 4);
    this.progress = 0;
    await progressController.updateGoals(this.worker, this.goals);
    await progressController.update(this.worker, this.progress++, i18n.t('Calculating changes...'));
  }

  /**
   *
   * @returns {Promise<void>}
   */
  calculateChanges() {
    // Add current folder changes to final folders changes
    this.foldersChanges.merge(this.originalChanges);

    // Calculate changes for subfolders
    for (let subfolder of this.subFolders) {
      this.foldersChanges.merge(PermissionChangesCollection.reuseChanges(
        subfolder.permission.aco, subfolder.id, subfolder.permissions, this.originalChanges, this.folder.permissions
      ));
    }

    // Calculate changes for resources inside these folders
    for (let resource of this.resources) {
      this.resourcesChanges.merge(PermissionChangesCollection.reuseChanges(
        resource.permission.aco, resource.id, resource.permissions, this.originalChanges, this.folder.permissions
      ));
    }
  }

  /**
   * Bulk share
   * @returns {Promise<void>}
   */
  async share() {
    // Update folders permissions
    if (this.foldersChanges.length) {
      let folders = new FoldersCollection([this.folder]);
      folders.merge(this.subFolders);
      await Share.bulkShareFolders(folders, this.foldersChanges, this.folderModel,  async message => {
        await progressController.update(this.worker, this.progress++, message);
      });
    }

    // Share resources
    if (this.resourcesChanges.length) {
      let resourcesDto = this.resources.toDto({secrets:true});
      let changesDto = this.resourcesChanges.toDto();
      await progressController.update(this.worker, this.progress++, i18n.t('Synchronizing keys'));
      await this.keyring.sync();
      await Share.bulkShareResources(resourcesDto, changesDto, this.privateKey, async message => {
        await progressController.update(this.worker, this.progress++, message);
      });
      await this.resourceModel.updateLocalStorage();
    }
  }

  /**
   * flush sensitive info at the end or in case of error
   * @returns {void}
   */
  cleanup() {
    this.privateKey = null;
  }
}

exports.ShareFoldersController = ShareFoldersController;
