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
const progressController = require('../progress/progressController');
const ResourceService = require('../../service/resource').ResourceService;
const TabStorage = require('../../model/tabStorage').TabStorage;

/**
 * Resources export controller
 */
class ResourceExportController {

  /**
   * Execute the controller
   * @param {array} resourcesIds The list of resources identifiers to export
   */
  static async exec(worker, resourcesIds) {
    try {
      const progressDialogPromise = progressController.start(worker, 'Retrieving passwords...');
      const resources = await ResourceService.findAllByResourcesIds(resourcesIds, {contain:{secret: 1}});
      progressController.complete(worker);
      TabStorage.set(worker.tab.id, 'exportedResources', resources);
      await progressDialogPromise;
      worker.port.emit('passbolt.export-passwords.open-dialog');
    } catch (error) {
      console.error(error);
    } finally {
      progressController.complete(worker);
    }
  }
}

exports.ResourceExportController = ResourceExportController;
