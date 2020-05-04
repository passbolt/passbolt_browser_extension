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
const {ApiClient} = require('../apiClient/apiClient');
const {AbstractService} = require('../abstract/abstractService');

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
   * @param {Object} contain optional example: {permissions: true}
   * @throws {Error} if API call fails, service unreachable, etc.
   * @returns {Object} folderDto
   */
  async get(id, contain) {
    let options = contain ? this.formatContainOptions(contain, FolderService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.get(id, options);
    return response.body;
  }

  /**
   * Find all folders
   *
   * @param {Object} contain optional for example {"user": true}
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
  async findAll(contain, filters) {
    contain = contain ? this.formatContainOptions(contain, FolderService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(contain, FolderService.getSupportedFiltersOptions()) : null;
    const options = {...contain, ...filters };
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
   * @param {Object} contain optional for example {"permission": true}
   * @returns {Promise<*>} Response body
   * @public
   */
  async create(data, contain) {
    let options = contain ? this.formatContainOptions(contain, FolderService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.create(data, options);
    return response.body;
  }

  /**
   * Update a folder using Passbolt API
   *
   * @param {String} folderId uuid
   * @param {Object} folderData
   * @param {Object} contain optional for example {"permission": true}
   * @returns {Promise<*>} Response body
   * @public
   */
  async update(folderId, folderData, contain) {
    let options = contain ? this.formatContainOptions(contain, FolderService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.update(folderId, folderData, options);
    return response.body;
  }

  /**
   * Delete a folder using Passbolt API
   *
   * @param {string} folderId uuid
   * @param {boolean} [cascade] delete sub folder / folders
   * @returns {Promise<*>} Response body
   * @public
   */
  async delete(folderId, cascade) {
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

    let url = this.apiClient.buildUrl(this.apiClient.baseUrl.toString());
    foldersIds.forEach(folderId => {
      url.searchParams.append(`filter[has-id][]`, folderId);
    });
    url.searchParams.append('contain[permission]', '1');
    url.searchParams.append('contain[permissions.user.profile]', '1');
    url.searchParams.append('contain[permissions.group]', '1');

    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    return response.body;
  }

  /**
   * Update a given folder permission
   *
   * @param {string} folderId uuid
   * @param {object} permissionChangesDto
   * @returns {Promise<*>}
   */
  async updatePermissions(folderId, permissionChangesDto) {
    let url = `${folderId}/permissions`;
    const response = await this.apiClient.update(url, permissionChangesDto);
    return response.body;
  }
}

exports.FolderService = FolderService;
