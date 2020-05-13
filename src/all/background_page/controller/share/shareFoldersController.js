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
const {Share} = require('../../model/share');
const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceModel} = require('../../model/resource/resourceModel');

const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

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
  }

  /**
   * Orchestrate dialogs during the share operation
   *
   * @param {FoldersCollection} folders
   * @param {PermissionChangesCollection} changes
   * @return {Promise}
   */
  async main(folders, changes) {
    this.folders = folders;
    this.originalChanges = changes;

    let progress = 0;
    const progressGoal = folders.length + 1;

    try {
      let msg = `Sharing ${folders.length} folders`;
      if (folders.length === 1) {
        msg  = `Sharing one folder`;
      }
      await progressController.open(this.worker, msg, progressGoal, 'Initializing...');
      await Share.bulkShareFolders(folders, changes, this.folderModel,  async message => {
        await progressController.update(this.worker, progress++, message);
      });
      // await calculateChanges();
      await progressController.update(this.worker, progressGoal, 'Done!');
      await progressController.close(this.worker);
    } catch(error) {
      console.error(error);
      await progressController.close(this.worker);
      throw error;
    }
  }

  // async calculateChanges() {
  //   for (let folder of folders) {
  //     let subfolders = this.folderModel.getAllChildren(folder.id);
  //     subfolders = this.folderModel.findAllForShare(subfolders.ids);
  //     for (let subfolder of subfolders) {
  //       let potentialChanges = this.originalChanges.copyForAnotherAco(subfolder.permission.aco, subfolder.id);
  //       let changes = PermissionChangesCollection.reuseChanges(subfolder.permissions, potentialChanges);
  //     }
  //     let resources = this.resourceModel.getAllChildren(folder.id);
  //     resources = this.resourceModel.findAllForShare(resources.ids);
  //   }
  // }
}

exports.ShareFoldersController = ShareFoldersController;
