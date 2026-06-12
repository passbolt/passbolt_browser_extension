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
import ResourceLocalStorage from "../../service/local_storage/resourceLocalStorage";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import ResourcesCollection from "../entity/resource/resourcesCollection";
import PermissionEntity from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity";
import PermissionsCollection from "passbolt-styleguide/src/shared/models/entity/permission/permissionsCollection";
import ResourceEntity from "../entity/resource/resourceEntity";
import PermissionChangesCollection from "../entity/permission/change/permissionChangesCollection";
import ResourceService from "../../service/api/resource/resourceService";
import PlaintextEntity from "../entity/plaintext/plaintextEntity";

const MAX_LENGTH_PLAINTEXT = 4096;

class ResourceModel {
  /**
   * Constructor
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account the user account
   * @public
   */
  constructor(apiClientOptions) {
    this.resourceService = new ResourceService(apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
  }

  /*
   * ==============================================================
   *  Local storage getters
   * ==============================================================
   */
  /**
   * Get a collection of resources from the local storage by id
   *
   * @param {Array} folderIds The folder id
   * @return {ResourcesCollection}
   * @deprecated should use getOrFindResourcesService and collection filtering. See shareFoldersService usage.
   */
  async getAllByParentIds(folderIds) {
    const localResources = await ResourceLocalStorage.get();
    const resourcesCollection = new ResourcesCollection([]);
    for (const i in localResources) {
      const resourceDto = localResources[i];
      if (folderIds.includes(resourceDto.folder_parent_id)) {
        resourcesCollection.push(resourceDto);
      }
    }
    return resourcesCollection;
  }

  /**
   * Get a collection of resources from the local storage by id
   *
   * @param {Array} resourceIds The resource ids
   * @return {ResourcesCollection}
   * @deprecated should use getOrFindResourcesService and collection filtering.
   */
  async getAllByIds(resourceIds) {
    const localResources = await ResourceLocalStorage.get();
    const filteredResources = localResources.filter((localResource) => resourceIds.includes(localResource.id));
    return new ResourcesCollection(filteredResources);
  }

  /**
   * Return a resource for a given id from the local storage
   *
   * @param {string} resourceId uuid
   * @returns {Promise<ResourceEntity>}
   * @deprecated should use getOrFindResourcesService and collection filtering.
   */
  async getById(resourceId) {
    const resourceDto = await ResourceLocalStorage.getResourceById(resourceId);
    return new ResourceEntity(resourceDto);
  }

  /*
   * ==============================================================
   *  Permission changes
   * ==============================================================
   */
  /**
   * Calculate permission changes for a create
   * From current permissions add the destination permissions
   *
   * NOTE: This function requires destFolder permissions to be set
   *
   * @param {ResourceEntity} resource
   * @param {(FolderEntity|null)} destFolder destination
   * @returns {Promise<PermissionChangesCollection>}
   */
  async calculatePermissionsChangesForCreate(resource, destFolder) {
    let changes = null;
    if (destFolder) {
      if (!destFolder.permissions) {
        throw new TypeError(
          "Resource model calculatePermissionsChangesForMove requires destination permissions to be set.",
        );
      }
      const currentPermissions = new PermissionsCollection([resource.permission]);
      const permissionsFromDest = destFolder.permissions.cloneForAco(PermissionEntity.ACO_RESOURCE, resource.id);
      changes = PermissionChangesCollection.calculateChanges(currentPermissions, permissionsFromDest);
    }
    return changes;
  }

  /*
   * ==============================================================
   *  CRUD
   * ==============================================================
   */
  /**
   * Update resources in the local storage
   *
   * @param {ResourcesCollection} resourcesCollection
   * @returns {Promise<void>}
   */
  async updateCollection(resourcesCollection) {
    await ResourceLocalStorage.updateResourcesCollection(resourcesCollection);
  }

  /*
   * ==============================================================
   *  Secret plaintext serialization
   * ==============================================================
   */
  /**
   * Return plaintext ready to be encrypted
   * Based on resource type and plaintext
   *
   * @param {string|undefined} resourceTypeId The resource type uuid
   * @param {string|object} plaintextDto The secret to encrypt
   * @throws {TypeError} if resourceTypeId is invalid or the type definition is not found
   * @returns {Promise<string>}
   */
  async serializePlaintextDto(resourceTypeId, plaintextDto) {
    // If legacy resource (no resource type available or the plaintextDto is a string)
    if (!resourceTypeId || typeof plaintextDto === "string") {
      if (plaintextDto.length > MAX_LENGTH_PLAINTEXT) {
        throw new TypeError(`The secret should be maximum ${MAX_LENGTH_PLAINTEXT} characters in length.`);
      }
      return plaintextDto;
    }

    const schema = await this.resourceTypeModel.getSecretSchemaById(resourceTypeId);
    if (!schema) {
      throw new TypeError("Could not find the schema definition for the requested resource type.");
    }

    const plaintextEntity = new PlaintextEntity(plaintextDto, { schema });
    return JSON.stringify(plaintextEntity);
  }

  /*
   * ==============================================================
   *  Assertions
   * ==============================================================
   */
  /**
   * Assert that all resources are in the local storage
   *
   * @param {Array} resourceIds array of uuid
   * @throws {Error} if a resource does not exist
   */
  async assertResourcesExist(resourceIds) {
    const resources = await ResourceLocalStorage.get();
    if (!Array.isArray(resourceIds)) {
      throw new TypeError(`Resources exist check expect an array of uuid.`);
    }
    for (const i in resourceIds) {
      if (!resources.find((item) => item.id === resourceIds[i])) {
        throw new Error(`Resource with id ${resourceIds[i]} does not exist.`);
      }
    }
  }
}

export default ResourceModel;
