/**
 * Resource events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import User from "../model/user";
import ResourceModel from "../model/resource/resourceModel";
import ResourceCreateController from "../controller/resource/resourceCreateController";
import ResourceUpdateController from "../controller/resource/resourceUpdateController";
import Log from "../model/log";
import GetResourceGridUserSettingController
  from "../controller/resourceGridSetting/getResourceGridUserSettingController";
import SetResourceGridUserSettingController
  from "../controller/resourceGridSetting/setResourceGridUserSettingController";

const listen = function(worker, apiClientOption, account) {
  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.resources.update-local-storage
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.resources.update-local-storage', async requestId => {
    Log.write({level: 'debug', message: 'ResourceEvent listen passbolt.resources.update-local-storage'});
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const resourceModel = new ResourceModel(apiClientOptions);
      resourceModel.updateLocalStorage();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Find all resources
   *
   * @listens passbolt.resources.find-all
   * @param requestId {uuid} The request identifier
   * @param options {object} The options to apply to the find
   */
  worker.port.on('passbolt.resources.find-all', async(requestId, options) => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const resourceModel = new ResourceModel(clientOptions);
      const {contains, filters, orders} = options;
      const resources = await resourceModel.findAll(contains, filters, orders);
      worker.port.emit(requestId, 'SUCCESS', resources);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Find a resource with complete permissions
   *
   * @listens passbolt.resources.find-for-permissions
   * @param requestId {uuid} The request identifier
   * @param options {object} The options to apply to the find
   */
  worker.port.on('passbolt.resources.find-permissions', async(requestId, resourceId) => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const resourceModel = new ResourceModel(clientOptions);
      const permissions = await resourceModel.findResourcePermissions(resourceId);
      worker.port.emit(requestId, 'SUCCESS', permissions);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Create a new resource.
   *
   * @listens passbolt.resources.create
   * @param requestId {uuid} The request identifier
   * @param resourceDto {object} The resource meta data
   * @param plaintextDto {string|object} The plaintext data to encrypt
   */
  worker.port.on('passbolt.resources.create', async(requestId, resourceDto, plaintextDto) => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const controller = new ResourceCreateController(worker, requestId, clientOptions);
      const savedResource = await controller.main(resourceDto, plaintextDto);
      worker.port.emit(requestId, 'SUCCESS', savedResource);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Delete resources
   *
   * @listens passbolt.resources.delete-all
   * @param requestId {uuid} The request identifier
   * @param resourcesIds {array} The resources ids to delete
   */
  worker.port.on('passbolt.resources.delete-all', async(requestId, resourcesIds) => {
    try {
      // TODO DeleteResourcesController with progress dialog if resourceIds > 1
      const clientOptions = await User.getInstance().getApiClientOptions();
      const resourceModel = new ResourceModel(clientOptions);
      await resourceModel.bulkDelete(resourcesIds);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
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
  worker.port.on('passbolt.resources.update', async(requestId, resourceDto, plaintextDto) => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const controller = new ResourceUpdateController(worker, requestId, clientOptions);
      const updatedResource = await controller.main(resourceDto, plaintextDto);
      worker.port.emit(requestId, 'SUCCESS', updatedResource);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Get the resource grid setting
   *
   * @listens passbolt.resources.get-grid-setting
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.resources.get-grid-setting', async requestId => {
    const getResourceColumnsSettingsController = new GetResourceGridUserSettingController(worker, requestId, account);
    await getResourceColumnsSettingsController._exec();
  });

  /*
   * Set the resource grid setting
   *
   * @listens passbolt.resources.set-grid-setting
   * @param requestId {uuid} The request identifier
   * @param gridSetting {object} The grid setting
   */
  worker.port.on('passbolt.resources.set-grid-setting', async(requestId, gridSetting) => {
    const setResourceColumnsSettingsController = new SetResourceGridUserSettingController(worker, requestId, account);
    await setResourceColumnsSettingsController._exec(gridSetting);
  });
};

export const ResourceEvents = {listen};
