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
const {ApiClient} = require('../service/api/apiClient/apiClient');

const FOLDER_API_NAME = 'folders';

class FolderService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    apiClientOptions.setResourceName(FOLDER_API_NAME);
    this.apiClient = new ApiClient(apiClientOptions);
  }

  /**
   * Find all folders
   * @param options
   * @returns {Promise<*>} response body
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
   * @throws {Error} if CSRF token is not set
   * @returns {Promise<FolderEntity>}
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
   * @throws {Error} if entity id is not set
   * @throws {Error} if CSRF token is not set
   * @returns {Promise<FolderEntity>}
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
   * @throws {TypeError} if entity id is not set
   * @throws {Error} if CSRF token is not set
   * @returns {Promise<void>}
   */
  async delete(folderId, cascade) {
    const options = {};
    if (cascade) {
      options.cascade = "1";
    }
    await this.apiClient.delete(folderId, null, options);
  }


  /**
   * Find folders to share
   * @param {array} foldersIds
   * @returns {array|Error}
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

    let url = new URL(`${this.apiClient.baseUrl}/folders.json?${this.apiClient.apiVersion}`);
    foldersIds.forEach(FolderId => {
      url.searchParams.append(`filter[has-id][]`, FolderId);
    });
    url.searchParams.append('contain[permission]', '1');
    url.searchParams.append('contain[permissions.user.profile]', '1');
    url.searchParams.append('contain[permissions.group]', '1');

    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    return response.body;
  }
}

exports.FolderService = FolderService;
