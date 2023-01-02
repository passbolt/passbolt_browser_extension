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
import Keyring from "../../model/keyring";
import ResourceModel from "../../model/resource/resourceModel";
import {PassphraseController as passphraseController} from "../passphrase/passphraseController";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import FolderModel from "../../model/folder/folderModel";
import Share from "../../model/share";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";
import Log from "../../model/log";


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
    this.progressService = new ProgressService(this.worker);
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
    } catch (error) {
      this.cleanup();
      throw error;
    }
    try {
      this.progressService.title = this.getProgressTitle();
      this.progressService.start(null, i18n.t('Initializing ...'));

      await this.findAllForShare();
      this.filterOutResourcesThatWontMove();

      this.progressService.updateGoals(this.getGoals());

      await this.progressService.finishStep(i18n.t('Calculating changes ...'), true);
      await this.calculateChanges();

      await this.move();
      await this.share();
      await this.progressService.finishStep(i18n.t('Done'), true);
      await this.progressService.close();
      this.cleanup();
    } catch (error) {
      await this.progressService.close();
      this.cleanup();
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
      throw new Error(i18n.t('Could not move, expecting at least a resource to be provided.'));
    }
    this.destinationFolderId = destinationFolderId;
    this.resourcesIds = resourcesIds;
  }

  /**
   * GetPassphrase
   * @returns {Promise<void>}
   */
  async getPassphrase() {
    /*
     * Get the passphrase if needed and decrypt secret key
     * We do this to confirm the move even if there is nothing to decrypt/re-encrypt
     */
    const passphrase = await passphraseController.get(this.worker);
    this.privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
  }

  /**
   * findAllForShare
   * @returns {Promise<void>}
   */
  async findAllForShare() {
    this.resources = await this.resourceModel.findAllForShare(this.resourcesIds);
    const parentIds = [...new Set(this.resources.folderParentIds)];

    if (this.destinationFolderId) {
      this.destinationFolder = await this.folderModel.findForShare([this.destinationFolderId]);
    } else {
      this.destinationFolder = null;
    }

    if (parentIds.length) {
      this.resourcesParentFolders = await this.folderModel.findAllForShare(parentIds);
    }
  }

  /**
   * Filter out work needed on resources
   * @return void
   */
  filterOutResourcesThatWontMove() {
    // Remove resources that are directly selected that can't be moved
    const resourceIdsToRemove = [];
    for (const resource of this.resources) {
      let parent = null;
      if (resource.folderParentId !== null) {
        parent = this.resourcesParentFolders.getById(resource.folderParentId);
      }
      if (!ResourceEntity.canResourceMove(resource, parent, this.destinationFolder)) {
        console.warn(`Resource ${resource.name} can not be moved, skipping.`);
        resourceIdsToRemove.push(resource.id);
      }
    }
    this.resources.removeMany(resourceIdsToRemove);
  }

  /**
   * Set goals and init progress counter
   * @returns {number}
   */
  getGoals() {
    // goals = (number of resources to move * get move, secret, decrypt, share) + calculate changes + sync keyring
    return (this.resources.length * 5) + 1;
  }

  /**
   * Build changes to be used in bulk share
   */
  async calculateChanges() {
    this.changes = new PermissionChangesCollection([]);
    for (const resource of this.resources) {
      await this.progressService.finishStep(i18n.t('Calculating changes for {{name}}', {name: resource.name}));
      /*
       * A user who can update a resource can move it
       * But to change the rights they need to be owner
       */
      if (!resource.permission.isOwner()) {
        break;
      }

      /*
       * When a shared folder is moved, we do not change permissions when:
       * - move is from the root to a personal folder
       * - move is from a personal folder to a personal folder;
       * - move is from a personal folder to the root.
       */
      if (resource.isShared()
        && (this.destinationFolderId === null || this.destinationFolder.isPersonal())
        && (resource.folderParentId === null || resource.isPersonal())) {
        break;
      }

      const parent = !resource.folderParentId ? null : this.resourcesParentFolders.getById(resource.folderParentId);
      const changes = this.resourceModel.calculatePermissionsChangesForMove(resource, parent, this.destinationFolder);
      this.changes.merge(changes);
    }
  }

  /**
   * Change resources folder parent id
   * @returns {Promise<void>}
   */
  async move() {
    const resourceIdsToRemove = [];
    for (const resource of this.resources) {
      if (resource.folderParentId !== this.destinationFolderId) {
        await this.progressService.finishStep(i18n.t('Moving {{name}}', {name: resource.name}));
        await this.resourceModel.move(resource, this.destinationFolderId);
      } else {
        Log.write({level: 'debug', message: `Resource ${resource.name} is already in the folder, skipping.`});
        resourceIdsToRemove.push(resource.id);
      }
    }
    this.resources.removeMany(resourceIdsToRemove);
    if (this.resources.length > 0) {
      await this.resourceModel.updateCollection(this.resources);
    }
  }

  /**
   * Bulk share
   * @returns {Promise<void>}
   */
  async share() {
    const resourcesDto = this.resources.toDto({secrets: true});
    const changesDto = this.changes.toDto();
    if (changesDto.length) {
      await this.progressService.finishStep(i18n.t('Synchronizing keys'), true);
      await this.keyring.sync();
      await Share.bulkShareResources(resourcesDto, changesDto, this.privateKey, async message => {
        await this.progressService.finishStep(message);
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


  /**
   * Get the title to display on the progress dialog
   * @returns {string}
   */
  getProgressTitle() {
    if (this.resourcesIds.length === 1) {
      return i18n.t('Moving one resource');
    } else {
      return i18n.t('Moving {{total}} resources', {total: this.resourcesIds.length});
    }
  }
}

export default MoveResourcesController;
