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
 * @since         4.9.4
 */

import FolderService from "../api/folder/folderService";
import FolderLocalStorage from "../local_storage/folderLocalStorage";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import {assertArrayUUID, assertBoolean, assertUuid} from "../../utils/assertions";
import FolderEntity from "../../model/entity/folder/folderEntity";
import splitBySize from "../../utils/array/splitBySize";
import ExecuteConcurrentlyService from "../execute/executeConcurrentlyService";

/**
 * The service aims to find folders from the API.
 */
export default class FindFoldersService {
  /**
   *
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(apiClientOptions) {
    this.folderService = new FolderService(apiClientOptions);
  }

  /**
   * Retrieve a folder.
   * @param {string} id The id
   * @param {object} [contains] optional The contain option
   * @returns {Promise<FolderEntity>}
   */
  async findById(id, contains) {
    //Assert
    assertUuid(id);
    const supportedContain = FolderService.getSupportedContainOptions();

    if (contains && !Object.keys(contains).every(option => supportedContain.includes(option))) {
      throw new Error("Unsupported contains parameter used, please check supported contains");
    }

    const foldersDto = await this.folderService.get(id, contains);
    return new FolderEntity(foldersDto);
  }

  /**
   * Retrieve a folder with permission.
   * @param {string} id The id
   * @returns {Promise<FolderEntity>}
   */
  async findByIdWithPermissions(id) {
    //Assert
    assertUuid(id);
    const foldersDto = await this.findById(id, {'permissions.user.profile': true, 'permissions.group': true});
    return new FolderEntity(foldersDto);
  }

  /**
   * Retrieve a folder with creator and modifier.
   * @param {string} id The id
   * @returns {Promise<FolderEntity>}
   */
  async findByIdWithCreatorAndModifier(id) {
    //Assert
    assertUuid(id);
    const foldersDto = await this.findById(id, {creator: true, modifier: true});
    return new FolderEntity(foldersDto);
  }

  /**
   * Retrieve all folders.
   * @param {object} [contains] optional The contain option
   * @param {object} [filters] optional The filters option
   * @param {object} [options] optional The options
   * @returns {Promise<FoldersCollection>}
   */
  async findAll(contains, filters, options) {
    //Assert contains
    const supportedContain = FolderService.getSupportedContainOptions();
    const supportedFilter = FolderService.getSupportedFiltersOptions();

    if (contains && !Object.keys(contains).every(option => supportedContain.includes(option))) {
      throw new Error("Unsupported contains parameter used, please check supported contains");
    }

    if (filters && !Object.keys(filters).every(filter => supportedFilter.includes(filter))) {
      throw new Error("Unsupported filters parameter used, please check supported filters");
    }

    assertBoolean(options?.ignoreInvalidEntity);

    const foldersDto = await this.folderService.findAll(contains, filters);
    return new FoldersCollection(foldersDto, {clone: false, ignoreInvalidEntity: options?.ignoreInvalidEntity});
  }

  /**
   * Retrieve all folders for the local storage.
   * @returns {Promise<FoldersCollection>}
   */
  async findAllForLocalStorage() {
    return this.findAll(FolderLocalStorage.DEFAULT_CONTAIN, null, {ignoreInvalidEntity: true});
  }

  /**
   * Find all by ids
   * @param {Object} contains
   * @param {Array<string>} foldersIds
   * @returns {Promise<FoldersCollection>}
   */
  async findAllByIds(foldersIds, contains = {}) {
    assertArrayUUID(foldersIds);

    // We split the requests in chunks in order to avoid any too long url error.
    const foldersIdsChunks = splitBySize(foldersIds, 80);
    const callbacks = foldersIdsChunks.map(foldersIds => {
      const filter = {
        "has-id": foldersIds
      };
      return async() => await this.findAll(contains, filter);
    });

    // @todo Later (tm). The Collection should provide this capability, ensuring that validation build rules are executed and performance is guaranteed.
    const executeConcurrentlyService = new ExecuteConcurrentlyService();
    const foldersBatches = await executeConcurrentlyService.execute(callbacks, 5);
    const folders = new FoldersCollection();

    foldersBatches.forEach(foldersBatch => {
      folders._items = folders._items.concat(foldersBatch._items);
    });

    return folders;
  }
}
