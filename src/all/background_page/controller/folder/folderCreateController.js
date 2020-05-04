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
const {FolderEntity} = require('../../model/entity/folder/folderEntity');
const {FolderModel} = require('../../model/folderModel');

const progressController = require('../progress/progressController');

class FolderCreateController {
  /**
   * Constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {FolderModel} folderModel
   */
  constructor(worker, requestId, folderModel) {
    this.worker = worker;
    this.requestId = requestId;
    this.folderModel = folderModel;
  }

  /**
   * Main
   *
   * @param {FolderEntity} folderEntity
   * @returns {Promise<FolderEntity>}
   */
  async main(folderEntity) {
    let progress = 0;
    let progressGoal = !folderEntity.folderParentId ? 1 : 2;

    try {
      let msg = `Creating folder ${folderEntity.name}`;
      await progressController.start(this.worker, msg, progressGoal, 'Initializing...');
      const newFolderEntity = await this.folderModel.create(folderEntity);
      await progressController.update(this.worker, progress++, 'Saving permissions...');
      await progressController.delay();

      if (folderEntity.folderParentId) {
        const parentEntity = await this.folderModel.findParentWithPermissions(folderEntity);
      }

      await progressController.complete(this.worker);
      return newFolderEntity;
    } catch(error) {
      console.error(error);
      await progressController.complete(this.worker);
      throw error;
    }
  }
}

exports.FolderCreateController = FolderCreateController;
