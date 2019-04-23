/**
 * Resource events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Resource = require('../model/resource').Resource;
const ResourceCreateController = require('../controller/resource/resourceCreateController.js').ResourceCreateController;

const listen = function (worker) {

  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.resources.update-local-storage
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.resources.update-local-storage', async function (requestId) {
    try {
      await Resource.updateLocalStorage();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });

  /*
   * Create a new resource.
   *
   * @listens passbolt.resources.create
   * @param requestId {uuid} The request identifier
   * @param resource {object} The resource meta data
   * @param password {string} The password to encrypt
   */
  worker.port.on('passbolt.resources.create', async function (requestId, resource, password) {
    const controller = new ResourceCreateController(worker, requestId);

    try {
      const savedResource = await controller.main(resource, password);
      worker.port.emit(requestId, 'SUCCESS', savedResource);
    } catch (error) {
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });
}

exports.listen = listen;
