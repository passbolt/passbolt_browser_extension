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
 * @since         4.12.0
 */
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import MigrateMetadataResourcesApiService from "../api/migrateMetadata/migrateMetadataResourcesApiService";
import EncryptMetadataService from "../metadata/encryptMetadataService";
import {V4_TO_V5_RESOURCE_TYPE_MAPPING} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import i18n from "../../sdk/i18n";

const MAX_PROCESS_REPLAY = 3;

export const MIGRATE_METADATA_BASE_MAIN_STEPS_COUNT = 2;

export default class MigrateMetadataResourcesService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions, account, progressService) {
    this.account = account;
    this.migrateMetadataResourcesApiService = new MigrateMetadataResourcesApiService(apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.encryptMetadataService = new EncryptMetadataService(apiClientOptions, account);
    this.progressService = progressService;
  }

  /**
   * Runs a process that could fail for any reason but restarts it until a maximum attempt is reach.
   * @param {Function} callback the process that could fail to be played and replayed
   * @param {object} replayOption an object containing the replay state.
   */
  async _runReplayableProcess(callback, replayOption) {
    try {
      await callback();
    } catch (e) {
      if (e?.data?.code !== 404 && e?.data?.code !== 409) {
        throw e;
      }

      replayOption.count++;
      if (replayOption.count >= MAX_PROCESS_REPLAY) {
        const error = new Error("Too many attempts to run a process. Aborting");
        error.cause = e;
        throw error;
      }

      await this._runReplayableProcess(callback, replayOption);
    }
  }

  /**
   * Run the migration of the metadata.
   * @param {MigrateMetadataEntity} migrateMetadataEntity
   * @param {string} passphrase
   * @param {object} [{count: 0}]
   * @returns {Promise<void>}
   * @public
   */
  async migrate(migrateMetadataEntity, passphrase, replayOptions = {count: 0}) {
    await this._runReplayableProcess(() => this._migrateResources(migrateMetadataEntity, passphrase), replayOptions);
  }

  /**
   * Run the migration of the resource metadata.
   * @param {MigrateMetadataEntity} migrateMetadataSettingsFormEntity
   * @param {string} passphrase
   * @returns {Promise<void>}
   * @private
   */
  async _migrateResources(migrateMetadataEntity, passphrase) {
    let resourcePage = 0;
    const filters = {};
    const contains = {};
    /*
     * If the resources are the  shared resources only, there is no need for permission info as the encryption will happens with the shared key anyway
     * Otherwise we need permission info to know which user's private key to use for encryption.
     */
    if (migrateMetadataEntity.sharedContentOnly) {
      filters["is-shared"] = true;
    } else {
      contains["permissions"] = true;
    }

    this.progressService.finishStep(i18n.t('Retrieving resource types'));
    const resourceTypes = await this.resourceTypeModel.getOrFindAll();
    const resourceTypesMapping = this._computeResourceTypesMapping(resourceTypes);

    this.progressService.finishStep(i18n.t('Retrieving resources to migrate batch number {{number}}', {number: ++resourcePage}));
    let migrationDetailsPage = await this.migrateMetadataResourcesApiService.findAll(contains, filters);
    let v4ResourcesCollection = new ResourcesCollection(migrationDetailsPage.body);

    while (v4ResourcesCollection.length > 0) {
      const v5ResourcesCollection = this._getUpdatedCollectionWithV5ResourceTypes(v4ResourcesCollection, resourceTypesMapping);
      if (v5ResourcesCollection.length === 0) {
        // if we reach such a state, we might get stuck in an infinite loop as the API will serve again and again the same batch of resources that can't be migrated for some reasons.
        throw new Error("Unexpected empty resources collection to migrate");
      }

      this.progressService.updateStepMessage(i18n.t('Encrypting resources batch number {{number}}', {number: resourcePage}));
      await this.encryptMetadataService.encryptAllFromForeignModels(v5ResourcesCollection, passphrase);

      this.progressService.finishStep(i18n.t('Updating resources batch number {{number}} and retrieving next batch', {number: resourcePage++}));
      migrationDetailsPage = await this.migrateMetadataResourcesApiService.migrate(v5ResourcesCollection, contains, filters);
      v4ResourcesCollection = new ResourcesCollection(migrationDetailsPage.body);
    }
  }

  /**
   * Computes resource types v4 id mapping to resource types v5 id mapping.
   * @param {ResourcesTypesCollection} resourceTypes
   * @returns {Object} a map of resource types v4 uuid to resource type v5 uuid
   * @private
   */
  _computeResourceTypesMapping(resourceTypes) {
    const map = {};
    const v4ResourceTypes = resourceTypes.items.filter(rt => rt.isV4());
    for (let i = 0; i < v4ResourceTypes.length; i++) {
      const v4ResourceType = v4ResourceTypes[i];

      const v5ResourceTypeSlug = V4_TO_V5_RESOURCE_TYPE_MAPPING[v4ResourceType.slug];
      if (!v5ResourceTypeSlug) {
        continue;
      }

      const matchingV5ResourceType = resourceTypes.getFirstBySlug(v5ResourceTypeSlug);
      if (!matchingV5ResourceType) {
        continue;
      }

      map[v4ResourceType.id] = matchingV5ResourceType.id;
    }
    return map;
  }

  /**
   * Updates the resource types on the given collection.
   * @param {ResourcesCollection} resourcesCollection
   * @param {ResourceTypesCollection} resourceTypes
   * @returns {ResourcesCollection}
   * @private
   */
  _getUpdatedCollectionWithV5ResourceTypes(resourcesCollection, resourceTypesMapping) {
    const updatedResourcesCollection = new ResourcesCollection();
    for (let i = 0; i < resourcesCollection.length; i++) {
      const currentV4Resource = resourcesCollection.items[i];

      const matchingV5ResourceTypeId = resourceTypesMapping[currentV4Resource.resourceTypeId];
      if (!matchingV5ResourceTypeId) {
        continue;
      }

      const resourceV5Dto = currentV4Resource.toDto();
      resourceV5Dto.resource_type_id = matchingV5ResourceTypeId;
      resourceV5Dto.metadata.resource_type_id = matchingV5ResourceTypeId;

      const resource = new ResourceEntity(resourceV5Dto);
      updatedResourcesCollection.push(resource);
    }
    return updatedResourcesCollection;
  }
}
