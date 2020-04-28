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

class FolderService {
  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return 'folders';
  }

  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    apiClientOptions.setResourceName(FolderService.RESOURCE_NAME);
    this.apiClient = new ApiClient(apiClientOptions);
  }

  /**
   * Find all folders
   *
   * @param {Object} options optional url parameters for example {"contain[something]": "1"}
   * Supported options:
   *
   *   "contain[children_resources]": "1"
   *   "contain[children_folders]": "1"
   *   "contain[creator]": "1"
   *   "contain[modifier]": "1"
   *   "contain[permission]": "1"
   *   "contain[permissions]": "1"
   *   "contain[permissions.user.profile]": "1"
   *   "contain[permissions.group]": "1"
   *
   *   "filter[has-id][]": <uuid>     // filter by ids(s)
   *   "filter[has-parent][]": <uuid> // filter by parent id(s)
   *   "filter[search][]": <string>   // filter by name
   *
   * @returns {Promise<*>} response body
   * @throws {TypeError} if urlOptions key or values are not a string
   * @throws {PassboltServiceUnavailableError} if service is not reachable
   * @throws {PassboltBadResponseError} if passbolt API responded with non parsable JSON
   * @throws {PassboltApiFetchError} if passbolt API response is not OK (non 2xx status)
   * @public
   */
  async findAll(options) {
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
   * @returns {Promise<*>} Response body
   * @public
   */
  async create(data) {
    const response = await this.apiClient.create(data);
    return response.body;
  }

  /**
   * Update a folder using Passbolt API
   *
   * @param {String} folderId uuid
   * @param {Object} folderData
   * @returns {Promise<*>} Response body
   * @public
   */
  async update(folderId, folderData) {
    const response = await this.apiClient.update(folderId, folderData);
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
}

exports.FolderService = FolderService;
