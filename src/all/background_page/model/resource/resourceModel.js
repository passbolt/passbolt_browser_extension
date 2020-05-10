/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
const {ResourceEntity} = require('../entity/resource/resourceEntity');
const {ResourceLocalStorage} = require('../../service/local_storage/resourceLocalStorage');
const {ResourceService} = require('../../service/api/resource/resourceService');
const {MoveService} = require('../../service/api/move/moveService');

class ResourceModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.resourceService = new ResourceService(apiClientOptions);
    this.moveService = new MoveService(apiClientOptions);
  }

  /**
   * Update the resources local storage with the latest API resources the user has access.
   *
   * @return {Promise<[ResourceEntity]>}
   */
  async updateLocalStorage () {
    const resources = await this.resourceService.findAll({
      'permission':true, 'favorite':true, 'tags':true
    });
    await ResourceLocalStorage.setLegacy(resources);
    return resources;
  }

  /**
   * Create a resource using Passbolt API and add result to local storage
   *
   * @param {ResourceEntity} resourceEntity
   * @returns {Promise<ResourceEntity>}
   */
  async create(resourceEntity) {
    const resourceDto = await this.resourceService.create(resourceEntity.toDto({secrets:true}), {permission: true});
    const updatedResourceEntity = new ResourceEntity(resourceDto);
    await ResourceLocalStorage.addResource(updatedResourceEntity);
    return updatedResourceEntity;
  }

  /**
   * Move a folder using Passbolt API
   *
   * @param {string} resourceId the resource id
   * @param {(string|null)} folderParentId the folder parent
   * @returns {ResourceEntity}
   */
  async move(resourceId, folderParentId) {
    if (!resourceId || !Validator.isUUID(resourceId)) {
      throw new TypeError('Resource move expect a valid resource id.');
    }
    if (!(folderParentId === null || Validator.isUUID(folderParentId))) {
      throw new TypeError('Resource move expect a valid folder id.');
    }
    const resourceDto = await ResourceLocalStorage.getResourceById(resourceId);
    const resourceEntity = new ResourceEntity(resourceDto);
    resourceEntity.folderParentId = folderParentId;
    await this.moveService.move(resourceEntity);
    // TODO update modified date
    await ResourceLocalStorage.updateResource(resourceEntity);

    return resourceEntity;
  }
}

exports.ResourceModel = ResourceModel;
