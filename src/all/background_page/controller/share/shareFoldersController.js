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
const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

class ShareFoldersController {
  /**
   * Controller constructor
   *
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {FolderModel} folderModel
   */
  constructor(worker, requestId, folderModel) {
    this.worker = worker;
    this.requestId = requestId;
    this.folderModel = folderModel;
  }

  /**
   * Orchestrate dialogs during the share operation
   *
   * @param {FoldersCollection} folders
   * @param {PermissionChangesCollection} changes
   * @return {Promise}
   */
  async main(folders, changes) {
    let progress = 0;
    const progressGoal = folders.length + 1;

    try {
      let msg = `Sharing ${folders.length} folders`;
      if (folders.length === 1) {
        msg  = `Sharing one folder`;
      }
      await progressController.start(this.worker, msg, progressGoal, 'Initializing...');
      await Share.bulkShareFolders(folders, changes, this.folderModel, message => {
        progressController.update(this.worker, progress++, message);
      });
      await progressController.complete(this.worker);
    } catch(error) {
      console.error(error);
      await progressController.complete(this.worker);
      throw error;
    }
  }
}

exports.ShareFoldersController = ShareFoldersController;
