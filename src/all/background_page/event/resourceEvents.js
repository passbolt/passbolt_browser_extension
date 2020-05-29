/**
 * Resource events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {User} = require('../model/user');
const {Log} = require('../model/log');
const {Resource} = require('../model/resource');
const {ResourceEntity} = require('../model/entity/resource/resourceEntity');

const {ResourceCreateController} = require('../controller/resource/resourceCreateController.js');
const {ResourceUpdateController} = require('../controller/resource/resourceUpdateController.js');

const listen = function (worker) {
  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.resources.update-local-storage
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.resources.update-local-storage', async function (requestId) {
    Log.write({level: 'debug', message: 'ResourceEvent listen passbolt.resources.update-local-storage'});
    try {
      await Resource.updateLocalStorage();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      Log.write({level: 'error', message: error.message, data: JSON.stringify(error)});
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });

  /*
   * Find all resources
   *
   * @listens passbolt.resources.find-all
   * @param requestId {uuid} The request identifier
   * @param options {object} The options to apply to the find
   */
  worker.port.on('passbolt.resources.find-all', async function (requestId, options) {
    try {
      const resources = await Resource.findAll(options);
      worker.port.emit(requestId, 'SUCCESS', resources);
    } catch (error) {
      console.error(error);
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
   * @param resource {resourceDto} The resource meta data
   * @param password {string} The password to encrypt
   */
  worker.port.on('passbolt.resources.create', async function (requestId, resourceDto, password) {
    try {
      const resourceEntity = new ResourceEntity(resourceDto)
      const clientOptions = await User.getInstance().getApiClientOptions();
      const controller = new ResourceCreateController(worker, requestId, clientOptions);
      const savedResource = await controller.main(resourceEntity, password);
      const savedResourceDto = savedResource.toJSON();
      worker.port.emit(requestId, 'SUCCESS', savedResourceDto);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });

  /*
   * Delete resources
   *
   * @listens passbolt.resources.delete-all
   * @param requestId {uuid} The request identifier
   * @param resourcesIds {array} The resources ids to delete
   */
  worker.port.on('passbolt.resources.delete-all', async function (requestId, resourcesIds) {
    try {
      await Resource.deleteAll(resourcesIds);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });

  /*
   * Save a resource
   *
   * @listens passbolt.resources.save
   * @param requestId {uuid} The request identifier
   * @param resource {array} The resource
   */
  worker.port.on('passbolt.resources.save', async function (requestId, resource) {
    try {
      const resourceCreated = await Resource.save(resource);
      worker.port.emit(requestId, 'SUCCESS', resourceCreated);
    } catch (error) {
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });

  /*
   * Update resource
   *
   * @listens passbolt.resources.update
   * @param requestId {uuid} The request identifier
   * @param resource {array} The resource
   * @param editedPassword {} The resource
   */
  worker.port.on('passbolt.resources.update', async function (requestId, resource, password) {
    const controller = new ResourceUpdateController(worker, requestId, password);
    try {
      const updatedResource = await controller.main(resource, password);
      worker.port.emit(requestId, 'SUCCESS', updatedResource);
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
