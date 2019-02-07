/**
 * Share Listeners
 *
 * Used for sharing passwords
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Keyring = require('../model/keyring').Keyring;
var masterPasswordController = require('../controller/masterPasswordController');
var progressDialogController = require('../controller/progressDialogController');
var Permission = require('../model/permission').Permission;
var Resource = require('../model/resource').Resource;
var Share = require('../model/share').Share;
var TabStorage = require('../model/tabStorage').TabStorage;
var Worker = require('../model/worker');

var listen = function (worker) {

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

  /*
   * Retrieve the ids of the resources to share.
   * @listens passbolt.share.get-resources-ids
   */
  worker.port.on('passbolt.share.get-resources-ids', function (requestId) {
    const resourcesIds = TabStorage.get(worker.tab.id, 'shareResourcesIds');
    worker.port.emit(requestId, 'SUCCESS', resourcesIds);
  });

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
  worker.port.on('passbolt.share.submit', async function (requestId, changes) {
    const appWorker = Worker.get('App', worker.tab.id);
    const resources = TabStorage.get(worker.tab.id, 'shareResources');
    const keyring = new Keyring();
    let progress = 0;
    // 3+1 :
    // 3: the simulate call to the API + the encrypting step + the share call to the API
    // 1: the initialization phase, in other words this function
    const progressGoal = resources.length * 3 + 1;

    try {
      const privateKeySecret = await masterPasswordController.get(worker);
      progressDialogController.open(appWorker, `Share ${resources.length} passwords`, progressGoal);
      progressDialogController.update(appWorker, progress++, 'Initialize');
      await keyring.sync();
      await Share.bulkShare(resources, changes, privateKeySecret, message => {
        progressDialogController.update(appWorker, progress++, message);
      });
      worker.port.emit(requestId, 'SUCCESS');
      progressDialogController.close(appWorker);
      appWorker.port.emit('passbolt.share.complete', resources.map(resource => resource.id));
    } catch(error) {
      progressDialogController.close(appWorker);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Close the share passwords dialog
   * @listens passbolt.share.close
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.share.close', function() {
    const appWorker = Worker.get('App', worker.tab.id);
    appWorker.port.emit('passbolt.share.close');
  });

  /*
   * Go to the edit dialog.
   * @listens passbolt.share.close
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.share.go-to-edit', function() {
    const appWorker = Worker.get('App', worker.tab.id);
    appWorker.port.emit('passbolt.share.go-to-edit');
  });

};
exports.listen = listen;
