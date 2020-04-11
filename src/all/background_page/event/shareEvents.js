/**
 * Share Listeners
 *
 * Used for sharing passwords
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {ShareController} = require('../controller/share/shareController');
const {Permission} = require('../model/permission');
const {Resource} = require('../model/resource');
const {Share} = require('../model/share');
const {TabStorage} = require('../model/tabStorage');
const Worker = require('../model/worker');

const listen = function (worker) {


  /*
   * Search aros based on keywords.
   * @listens passbolt.share.search-aros
   * @param keywords {string} The keywords to search
   */
  worker.port.on('passbolt.share.search-aros', async function (requestId, keywords) {
    const resourcesIds = TabStorage.get(worker.tab.id, 'shareResourcesIds');
    let aros;
    if (resourcesIds.length == 1) {
      // This code ensure the compatibility with passbolt < v2.4.0.
      aros = await Share.searchResourceAros(resourcesIds[0], keywords);
    } else {
      aros = await Share.searchAros(keywords);
    }
    worker.port.emit(requestId, 'SUCCESS', aros);
  });

  // /*
  //  * Retrieve the ids of the resources to share.
  //  * @listens passbolt.share.get-resources-ids
  //  */
  // worker.port.on('passbolt.share.get-resources-ids', function (requestId) {
  //   const resourcesIds = TabStorage.get(worker.tab.id, 'shareResourcesIds');
  //   worker.port.emit(requestId, 'SUCCESS', resourcesIds);
  // });

  /*
   * Retrieve the resources to share.
   * @listens passbolt.share.get-resources
   * @param {array} resourcesIds The ids of the resources to retrieve.
   */
  worker.port.on('passbolt.share.get-resources', async function (requestId, resourcesIds) {
    let resources = [];
    if (resourcesIds.length == 1) {
      // This code ensure the compatibility with passbolt < v2.4.0.
      const resource = await Resource.findShareResource(resourcesIds[0]);
      const resourcePermissions = await Permission.findResourcePermissions(resourcesIds[0]);
      resource.permissions = resourcePermissions;
      resources = [resource];
    } else {
      resources = await Resource.findShareResources(resourcesIds);
    }
    TabStorage.set(worker.tab.id, 'shareResources', resources);
    worker.port.emit(requestId, 'SUCCESS', resources);
  });

  /*
   * Encrypt the shared password for all the new users it has been shared with.
   * @listens passbolt.share.submit
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.share.save', async function (requestId, resources, changes) {
    const controller = new ShareController(worker, requestId);
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
    TabStorage.remove(worker.tab.id, 'shareResourcesIds');
    TabStorage.remove(worker.tab.id, 'shareResources');
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.share.close-share-dialog');
  });

};
exports.listen = listen;
