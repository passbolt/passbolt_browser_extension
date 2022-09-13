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
import AbstractService from "../abstract/abstractService";

const FOLDER_SERVICE_RESOURCE_NAME = 'folders';

class FolderService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, FolderService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return FOLDER_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contain option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      "children_resources",
      "children_folders",
      "creator",
      "modifier",
      "permission",
      "permissions",
      "permissions.user.profile",
      "permissions.group"
    ];
  }

  /**
   * Return the list of supported filters for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedFiltersOptions() {
    return [
      "has-id",
      "has-parent",
      "search", // search by name
    ];
  }

  /**
   * Get a folder for a given id
   *
   * @param {string} id folder uuid
   * @param {Object} [contains] optional example: {permissions: true}
   * @throws {Error} if API call fails, service unreachable, etc
   * @throws {TypeError} if folder id is not a uuid
   * @returns {Object} folderDto
   * @public
   */
  async get(id, contains) {
    this.assertValidId(id);
    const options = contains ? this.formatContainOptions(contains, FolderService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.get(id, options);
    return response.body;
  }

  /**
   * Find all folders
   *
   * @param {Object} [contains] optional for example {"user": true}
   *        @see getSupportedContainOptions
   * @param {Object} [filters] optional for example {"has-id": [uuid, ...]}
   *        @see getSupportedFiltersOptions
   * @returns {Promise<*>} response body
   * @throws {TypeError} if urlOptions key or values are not a string
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @public
   */
  async findAll(contains, filters) {
    contains = contains ? this.formatContainOptions(contains, FolderService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(contains, FolderService.getSupportedFiltersOptions()) : null;
    const options = {...contains, ...filters};
    const response = await this.apiClient.findAll(options);
    if (!response.body || !response.body.length) {
      return [];
    }
    return response.body;
  }

  /**
   * Create a folder using Passbolt API
   *
   * @param {Object} data
   * @param {Object} [contains] optional for example {"permission": true}
   * @returns {Promise<*>} Response body
   * @throws {TypeError} if data is empty
   * @public
   */
  async create(data, contains) {
    this.assertNonEmptyData(data);
    const options = contains ? this.formatContainOptions(contains, FolderService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.create(data, options);
    return response.body;
  }

  /**
   * Update a folder using Passbolt API
   *
   * @param {String} folderId uuid
   * @param {Object} folderData
   * @param {Object} [contains] optional for example {"permission": true}
   * @returns {Promise<*>} Response body
   * @throws {TypeError} if folder id is not a uuid or data is empty
   * @public
   */
  async update(folderId, folderData, contains) {
    this.assertValidId(folderId);
    this.assertNonEmptyData(folderData);
    const options = contains ? this.formatContainOptions(contains, FolderService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.update(folderId, folderData, options);
    return response.body;
  }

  /**
   * Delete a folder using Passbolt API
   *
   * @param {string} folderId uuid
   * @param {boolean} [cascade] delete sub folder / folders
   * @returns {Promise<*>} Response body
   * @throws {TypeError} if folder id is not a uuid
   * @public
   */
  async delete(folderId, cascade) {
    this.assertValidId(folderId);
    const options = {};
    if (cascade) {
      options.cascade = "1";
    }
    const response = await this.apiClient.delete(folderId, null, options);
    return response.body;
  }

  /**
   * Find folders to share
   * @param {array} foldersIds
   * @returns {Promise<*>} Response body
   * @public
   */
  async findAllForShare(foldersIds) {
    // Retrieve by batch to avoid any 414 response.
    const batchSize = 80;
    if (foldersIds.length > batchSize) {
      let folders = [];
      const totalBatches = Math.ceil(foldersIds.length / batchSize);
      for (let i = 0; i < totalBatches; i++) {
        const foldersIdsPart = foldersIds.splice(0, batchSize);
        const foldersPart = await this.findAllForShare(foldersIdsPart);
        folders = [...folders, ...foldersPart];
      }

      return folders;
    }

    const url = this.apiClient.buildUrl(this.apiClient.baseUrl.toString());
    foldersIds.forEach(folderId => {
      url.searchParams.append(`filter[has-id][]`, folderId);
    });
    url.searchParams.append('contain[permission]', '1');
    url.searchParams.append('contain[permissions.user.profile]', '1');
    url.searchParams.append('contain[permissions.group]', '1');

    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    return response.body;
  }
}

export default FolderService;
