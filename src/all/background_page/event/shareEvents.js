/**
 * Share Listeners
 *
 * Used for sharing passwords
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {ShareResourcesController} = require('../controller/share/shareResourcesController');
const {Permission} = require('../model/permission');
const {Resource} = require('../model/resource');
const {Folder} = require('../model/folderModel');
const {Share} = require('../model/share');
const Worker = require('../model/worker');

const listen = function (worker) {
  /*
   * Search aros based on keywords.
   * @listens passbolt.share.search-aros
   * @param keywords {string} The keywords to search
   */
  worker.port.on('passbolt.share.search-aros', async function (requestId, itemsToShare, keywords) {
    let aros;
    if (itemsToShare.resourcesIds && itemsToShare.resourcesIds.length === 1) {
      // This code ensure the compatibility with passbolt < v2.4.0.
      aros = await Share.searchResourceAros(itemsToShare.resourcesIds[0], keywords);
    } else {
      aros = await Share.searchAros(keywords);
    }
    worker.port.emit(requestId, 'SUCCESS', aros);
  });

  /*
   * Retrieve the resources to share.
   * @listens passbolt.share.get-resources
   * @param {array} resourcesIds The ids of the resources to retrieve.
   */
  worker.port.on('passbolt.share.get-resources', async function (requestId, resourcesIds) {
    let resources = [];
    try {
      if (resourcesIds.length === 1) {
        // This code ensure the compatibility with passbolt < v2.4.0.
        const resource = await Resource.findShareResource(resourcesIds[0]);
        resource.permissions = await Permission.findResourcePermissions(resourcesIds[0]);
        resources = [resource];
      } else {
        resources = await Resource.findShareResources(resourcesIds);
      }
      worker.port.emit(requestId, 'SUCCESS', resources);
    } catch(error) {
      worker.port.emit(requestId, 'ERROR', this.worker.port.getEmitableError(error));
    }
  });

  /*
   * Retrieve the folders to share.
   * @listens passbolt.share.get-folders
   * @param {array} foldersIds The ids of the folders to retrieve.
   */
  worker.port.on('passbolt.share.get-folders', async function (requestId, foldersIds) {
    try {
      const folders = await Folder.findAllForShare(foldersIds);
      worker.port.emit(requestId, 'SUCCESS', folders);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', this.worker.port.getEmitableError(error));
    }
  });

  /*
   * Encrypt the shared password for all the new users it has been shared with.
   * @listens passbolt.share.submit
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.share.resources.save', async function (requestId, resources, changes) {
    const controller = new ShareResourcesController(worker, requestId);
    try {
      await controller.main(resources, changes);
      worker.port.emit(requestId, 'SUCCESS');
      //appWorker.port.emit('passbolt.share.complete', results);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      //appWorker.port.emit('passbolt.share.error', worker.port.getEmitableError(error));
    }
  });

  /*
   * Close the share passwords dialog
   * @listens passbolt.share.close
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.share.close', function() {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.share.close-share-dialog');
  });

};
exports.listen = listen;
