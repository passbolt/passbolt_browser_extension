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
const {FolderModel} = require('../../model/folder/folderModel');
const {i18n} = require('../../sdk/i18n');

const progressController = require('../progress/progressController');

class FolderCreateController {
  /**
   * Constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.folderModel = new FolderModel(clientOptions);
  }

  /**
   * Main
   *
   * @param {FolderEntity} originalFolder
   * @returns {Promise<FolderEntity>}
   */
  async main(originalFolder) {
    let progress = 0;
    let progressGoal = !originalFolder.folderParentId ? 1 : 3;

    try {
      let msg = `Creating folder ${originalFolder.name}`;
      await progressController.open(this.worker, msg, progressGoal, i18n.t('Creating folder...'));
      let folderEntity = await this.folderModel.create(originalFolder);

      if (folderEntity.folderParentId) {
        // TODO a confirmation dialog that recaps the changes
        // TODO ask if they want to keep the original permission?
        // TODO a remember me option to skip confirmation dialog
        await progressController.update(this.worker, progress++, i18n.t('Fetching parent permissions'));
        let targetFolder = await this.folderModel.findForShare(folderEntity.folderParentId);

        await progressController.update(this.worker, progress++, i18n.t('Saving permissions...'));
        let changes = await this.folderModel.calculatePermissionsChangesForCreate(folderEntity, targetFolder);
        if (changes) {
          await this.folderModel.share(folderEntity, changes);
        }
      }

      await progressController.update(this.worker, progressGoal,  i18n.t('Done!'));
      await progressController.close(this.worker);
      return folderEntity;
    } catch(error) {
      console.error(error);
      await progressController.close(this.worker);
      throw error;
    }
  }
}

exports.FolderCreateController = FolderCreateController;
