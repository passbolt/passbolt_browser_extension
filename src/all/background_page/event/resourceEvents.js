/**
 * Resource events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Resource = require('../model/resource').Resource;

const listen = function (worker) {

  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.resources.pull-api-and-update-local-storage
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
}

exports.listen = listen;
