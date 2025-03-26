/**
 * Resource events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import ResourceModel from "../model/resource/resourceModel";
import ResourceCreateController from "../controller/resource/resourceCreateController";
import ResourceUpdateController from "../controller/resource/resourceUpdateController";
import Log from "../model/log";
import GetResourceGridUserSettingController
  from "../controller/resourceGridSetting/getResourceGridUserSettingController";
import SetResourceGridUserSettingController
  from "../controller/resourceGridSetting/setResourceGridUserSettingController";
import SetResourcesExpiryDateController from "../controller/resource/setResourcesExpiryDateController";
import FindResourceDetailsController from "../controller/resource/findResourceDetailsController";
import ResourceUpdateLocalStorageController
  from "../controller/resourceLocalStorage/resourceUpdateLocalStorageController";
import FindAllIdsByIsSharedWithGroupController from "../controller/resource/findAllIdsByIsSharedWithGroupController";
import FindAllByIdsForDisplayPermissionsController
  from "../controller/resource/findAllByIdsForDisplayPermissionsController";
import MoveResourcesController from "../controller/move/moveResourcesController";
import ResetResourceGridUserSettingController
  from "../controller/resourceGridSetting/resetResourceGridUserSettingController";

const listen = function(worker, apiClientOptions, account) {
  /*
   * Pull the resources from the API and update the local storage.
   *
   * @listens passbolt.resources.update-local-storage
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.resources.update-local-storage', async requestId => {
    Log.write({level: 'debug', message: 'ResourceEvent listen passbolt.resources.update-local-storage'});
    const controller = new ResourceUpdateLocalStorageController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /**
   * Find a resource with its details given an id
   *
   * @listens passbolt.resources.find-details
   * @param requestId {uuid} The request identifier
   * @param options {object} The options to apply to the find
   */
  worker.port.on('passbolt.resources.find-details', async(requestId, resourceId) => {
    const controller = new FindResourceDetailsController(worker, requestId, apiClientOptions, account);
    await controller._exec(resourceId);
  });

  /*
   * Find all resources shared with group by aro foreign key
   *
   * @listens passbolt.resources.find-all-ids-by-has-access
   * @param requestId {uuid} The request identifier
   * @param options {uuid} The group identifier
   */
  worker.port.on('passbolt.resources.find-all-ids-by-is-shared-with-group', async(requestId, groupId) => {
    const controller = new FindAllIdsByIsSharedWithGroupController(worker, requestId, apiClientOptions, account);
    await controller._exec(groupId);
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
    const controller = new ResourceCreateController(worker, requestId, apiClientOptions, account);
    await controller._exec(resourceDto, plaintextDto);
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
      const resourceModel = new ResourceModel(apiClientOptions, account);
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
   * @param plaintextDto {} The resource secret
   */
  worker.port.on('passbolt.resources.update', async(requestId, resourceDto, plaintextDto) => {
    const controller = new ResourceUpdateController(worker, requestId, apiClientOptions, account);
    await controller._exec(resourceDto, plaintextDto);
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

  /*
   * Reset the resources grid settings
   *
   * @listens passbolt.resources.reset-grid-setting
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.resources.reset-grid-setting', async requestId => {
    const resetResourceColumnsSettingsController = new ResetResourceGridUserSettingController(worker, requestId, account);
    await resetResourceColumnsSettingsController._exec();
  });

  /*
   * Set the given resources expiration date
   *
   * @listens passbolt.resources.set-expiration-date
   * @param requestId {uuid} The request identifier
   * @param gridSetting {object} The grid setting
   */
  worker.port.on('passbolt.resources.set-expiration-date', async(requestId, passwordExpiryResourcesCollectionDto) => {
    const controller = new SetResourcesExpiryDateController(worker, requestId, apiClientOptions);
    await controller._exec(passwordExpiryResourcesCollectionDto);
  });

  /*
   * Retrieve all resources by ids with their permissions.
   * @listens passbolt.resources.find-all-by-ids-with-permissions
   * @param {array} resourcesIds The ids of the resources to retrieve.
   */
  worker.port.on('passbolt.resources.find-all-by-ids-for-display-permissions', async(requestId, resourcesIds) => {
    const controller = new FindAllByIdsForDisplayPermissionsController(worker, requestId, apiClientOptions, account);
    await controller._exec(resourcesIds);
  });

  /*
   * Moves the given resources to a new folder.
   *
   * @listens passbolt.resources.move-by-ids
   * @param {uuid} requestId The request identifier
   * @param {string} destinationFolderId The destination folder id
   * @param {string} resourcesIds The resources ids to move
   */
  worker.port.on('passbolt.resources.move-by-ids', async(requestId, resourcesIds, destinationFolderId) => {
    const controller = new MoveResourcesController(worker, requestId, apiClientOptions, account);
    await controller.exec(resourcesIds, destinationFolderId);
  });
};

export const ResourceEvents = {listen};
