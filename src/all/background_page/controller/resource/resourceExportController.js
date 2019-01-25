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
 * @since         2.7.0
 */
const progressDialogController = require('../../controller/progressDialogController');
const ResourceServices = require('../../service/resource').ResourceServices;
const TabStorage = require('../../model/tabStorage').TabStorage;
const Worker = require('../../model/worker');

/**
 * Resources export controller
 */
class ResourceExportController {

  /**
   * Execute the controller
   * @param {array} resourcesIds The list of resources identifiers to export
   */
  static async exec(worker, resourcesIds) {
    const appWorker = Worker.get('App', worker.tab.id);
    try {
      const progressDialogPromise = progressDialogController.open(appWorker, 'Retrieving passwords...');
      const resources = await ResourceServices.findAllByResourcesIds(resourcesIds, {contain:{secret: 1}});
      progressDialogController.close(appWorker);
      TabStorage.set(worker.tab.id, 'exportedResources', resources);
      await progressDialogPromise;
      worker.port.emit('passbolt.export-passwords.open-dialog');
    } catch (error) {
      console.log(error);
    } finally {
      progressDialogController.close(appWorker);
    }
  }
}

exports.ResourceExportController = ResourceExportController;
