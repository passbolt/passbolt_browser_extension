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
const ResourceService = require('../../service/api/resource/resourceService').ResourceService;
const TabStorage = require('../../model/tabStorage').TabStorage;
const User = require('../../model/user').User;
const ResourceModel = require('../../model/resource/resourceModel').ResourceModel;
const FolderModel = require('../../model/folder/folderModel').FolderModel;

/**
 * Resources export controller
 */
class ResourceExportController {

  /**
   * Execute the controller
   * @param {array} items The list of items to export. There are 2 formats:
   *   1) a list of resource ids (will be deprecated)
   *   2) a list of items categorized under their entity name: example: folders: [folderIds], resources[resourceIds]
   */
  static async exec(worker, items) {
    const requestedToExport = {
      resources: Array.isArray(items) ? items : items['resources'] || [],
      folders: items['folders'] || []
    };

    const itemsToExport = {
      resources: [],
      folders: [],
    }

    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const progressDialogPromise = progressController.open(worker, 'Retrieving items...');
      const resourceModel = new ResourceModel(apiClientOptions);
      const folderModel = new FolderModel(apiClientOptions);

      if (requestedToExport.folders.length) {
        const folders = await folderModel.getAllByIds(requestedToExport.folders, true);
        itemsToExport.folders = folders.items.map((f) => { return f.toDto() });
        const folderIdsToExport = folders.items.map((f) => {
          return f.id;
        });

        const resourcesInFolders = await resourceModel.getAllByParentIds(folderIdsToExport);
        const resourceInFoldersIds = resourcesInFolders.items.map((r) => {
          return r.id;
        });
        requestedToExport.resources = [...new Set([...requestedToExport.resources, ...resourceInFoldersIds])];
      }

      // If there are resources to export.
      if (requestedToExport.resources.length) {
        const filter = {
          'has-id': requestedToExport.resources
        };
        const contain = {
          'secret': 1
        };

        const resourceService = new ResourceService(apiClientOptions);
        itemsToExport.resources = await resourceService.findAll(contain, filter);
      }


      await progressController.close(worker);
      TabStorage.set(worker.tab.id, 'itemsToExport', itemsToExport);
      await progressDialogPromise;
      worker.port.emit('passbolt.export-passwords.open-dialog');
    } catch (error) {
      console.error(error);
    } finally {
      await progressController.close(worker);
    }
  }
}

exports.ResourceExportController = ResourceExportController;
