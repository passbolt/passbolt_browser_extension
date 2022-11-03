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
import FolderModel from "../../model/folder/folderModel";
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";


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
    this.progressService = new ProgressService(this.worker, i18n.t('Creating folder...'));
  }

  /**
   * Main
   *
   * @param {FolderEntity} originalFolder
   * @returns {Promise<FolderEntity>}
   */
  async main(originalFolder) {
    const progressGoal = !originalFolder.folderParentId ? 1 : 3;

    try {
      const msg = `Creating folder ${originalFolder.name}`;
      this.progressService.start(progressGoal, msg);
      const folderEntity = await this.folderModel.create(originalFolder);

      if (folderEntity.folderParentId) {
        /*
         * TODO a confirmation dialog that recaps the changes
         * TODO ask if they want to keep the original permission?
         * TODO a remember me option to skip confirmation dialog
         */
        await this.progressService.finishStep(i18n.t('Fetching parent permissions'), true);
        const targetFolder = await this.folderModel.findForShare(folderEntity.folderParentId);

        await this.progressService.finishStep(i18n.t('Saving permissions...'), true);
        const changes = await this.folderModel.calculatePermissionsChangesForCreate(folderEntity, targetFolder);
        if (changes) {
          await this.folderModel.share(folderEntity, changes);
        }
      }

      await this.progressService.finishStep(i18n.t('Done!'), true);
      await this.progressService.close();
      return folderEntity;
    } catch (error) {
      console.error(error);
      await this.progressService.close();
      throw error;
    }
  }
}

export default FolderCreateController;
