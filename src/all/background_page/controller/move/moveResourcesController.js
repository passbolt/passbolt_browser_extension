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
 * @since         2.13.0
 */
const {Keyring} = require('../../model/keyring');
const {Crypto} = require('../../model/crypto');
const {Share} = require('../../model/share');
const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {ResourceEntity} = require('../../model/entity/resource/resourceEntity');
const {PermissionChangesCollection} = require('../../model/entity/permission/permissionChangesCollection');
const {PermissionsCollection}  = require("../../model/entity/permission/permissionsCollection");

const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

class MoveResourcesController {
  /**
   * MoveResourcesController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.folderModel = new FolderModel(clientOptions);
    this.resourceModel = new ResourceModel(clientOptions);
    this.keyring = new Keyring();
    this.crypto = new Crypto();
  }

  /**
   * Move content.
   *
   * @param {array} resourcesIds: The resources ids to move
   * @param {(string|null)} destinationFolderId: The destination folder
   */
  async main(resourcesIds, destinationFolderId) {
    await this.assertValidMoveParameters(resourcesIds, destinationFolderId);
    try {
      await this.getPassphrase();
    } catch(error) {
      this.cleanup();
      throw error;
    }
    try {
      await progressController.open(this.worker, this.getProgressTitle(), 1, 'Initializing...');
      await this.findAllForShare();
      this.filterOutResourcesThatWontMove();
      await this.setGoals();
      await this.buildChanges();
      await this.move();
      await this.share();
      await progressController.update(this.worker, this.goals, 'Done');
      await progressController.close(this.worker);
      this.cleanup()
    } catch(error) {
      await progressController.close(this.worker);
      this.cleanup()
      throw error;
    }
  }

  /**
   * Sanity check
   * @returns {Promise<void>}
   */
  async assertValidMoveParameters(resourcesIds, destinationFolderId) {
    if (destinationFolderId !== null) {
      await this.folderModel.assertFolderExists(destinationFolderId);
    }
    if (resourcesIds.length) {
      await this.resourceModel.assertResourcesExist(resourcesIds);
    } else {
      throw new Error('Could not move, expecting at least a resource to be provided.');
    }
    this.destinationFolderId = destinationFolderId;
    this.resourcesIds = resourcesIds;
  }

  /**
   * GetPassphrase
   * @returns {Promise<void>}
   */
  async getPassphrase() {
    // Get the passphrase if needed and decrypt secret key
    // We do this to confirm the move even if there is nothing to decrypt/re-encrypt
    this.passphrase = await passphraseController.get(this.worker);
    this.privateKey = await this.crypto.getAndDecryptPrivateKey(this.passphrase);
  }

  /**
   * findAllForShare
   * @returns {Promise<void>}
   */
  async findAllForShare() {
    this.resources = await this.resourceModel.findAllForShare(this.resourcesIds);
    const parentIds = this.resources.folderParentIds;

    if (this.destinationFolderId) {
      this.destinationFolder = await this.folderModel.findForShare([this.destinationFolderId]);
    } else {
      this.destinationFolder = null;
    }

    if (parentIds.length) {
      this.resourcesParentFolders = await this.folderModel.findAllForShare(this.resources.folderParentIds);
    }
  }

  /**
   * Filter out work needed on resources
   * @return void
   */
  filterOutResourcesThatWontMove() {
    // Remove resources that are directly selected that can't be moved
    for (let resource of this.resources) {
      let parent = null;
      if (resource.folderParentId !== null) {
        parent = this.resourcesParentFolders.getById(resource.folderParentId);
      }
      if (!ResourceEntity.canResourceMove(resource, parent, this.destinationFolder)) {
        console.warning(`Resource ${resource.name} can not be moved, skipping.`);
        this.resources.remove(resource.id);
      }
    }
  }

  /**
   * Set goals and init progress counter
   * @returns {Promise<void>}
   */
  async setGoals() {
    // goals = (number of resources to move * get move, secret, decrypt, share) + calculate changes + sync keyring
    this.goals = (this.resources.length * 5) + 1;
    this.progress = 0;
    await progressController.updateGoals(this.worker, this.goals);
    await progressController.update(this.worker, this.progress++, 'Calculating changes...');
  }

  /**
   * Build changes to be used in bulk share
   * @returns {Promise<void>}
   */
  async buildChanges() {
    this.changes = new PermissionChangesCollection([]);
    for (let resource of this.resources) {
      await progressController.update(this.worker, this.progress++, `Calculating changes for ${resource.name}`);

      // Somebody who can update can move
      // But to change the rights one need to be owner
      if (resource.permission.isOwner()) {
        let parent = !resource.folderParentId ? null : this.resourcesParentFolders.getById(resource.folderParentId);
        let changes = await this.resourceModel.calculatePermissionsChangesForMove(resource, parent, this.destinationFolder);
        this.changes.merge(changes);
      }
    }
  }

  /**
   * Change resources folder parent id
   * @returns {Promise<void>}
   */
  async move() {
    for (let resource of this.resources) {
      await progressController.update(this.worker, this.progress++, `Moving ${resource.name}`);
      if (resource.folderParentId !== this.destinationFolderId) {
        await this.resourceModel.move(resource.id, this.destinationFolderId);
      }
    }
  }

  /**
   * Bulk share
   * @returns {Promise<void>}
   */
  async share() {
    let resourcesDto = this.resources.toDto({secrets:true});
    let changesDto = this.changes.toDto();
    if (changesDto.length) {
      await progressController.update(this.worker, this.progress++, 'Synchronizing keys');
      await this.keyring.sync();
      await Share.bulkShareResources(resourcesDto, changesDto, this.passphrase, async message => {
        await progressController.update(this.worker, this.progress++, message);
      });
    }
  }

  /**
   * flush sensitive info at the end or in case of error
   * @returns {void}
   */
  cleanup() {
    this.passphrase = null;
    this.privateKey = null;
  }


  /**
   * Get the title to display on the progress dialog
   * @returns {string}
   */
  getProgressTitle() {
    if (this.resourcesIds.length === 1) {
      return 'Moving one resource';
    } else {
      return `Moving ${this.resourcesIds.length} resources`;
    }
  }
}

exports.MoveResourcesController = MoveResourcesController;
