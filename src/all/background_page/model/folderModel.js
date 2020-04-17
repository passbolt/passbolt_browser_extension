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
const {FolderEntity} = require('./entity/folder/folderEntity');
const {FolderLocalStorage} = require('../service/local_storage/folder');

const FOLDER_API_NAME = 'folders';

class FolderModel {
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
   * Update the folders local storage with the latest API folders the user has access.
   * @return {Promise}
   */
  async updateLocalStorage () {
    const options = {
      "contain[folder_parent_id]": "1"
    };
    const folders = await this.findAll(options);
    await FolderLocalStorage.set(folders);
    return folders;
  }

  /**
   */
  async findAll(options) {
    const response = await this.apiClient.findAll(options);
    if (!response.body || !response.body.length) {
      return [];
    }
    return response.body.map(folder => new FolderEntity(FolderEntity.fromApiData(folder)));
  }

  /**
   * Create a folder using Passbolt API
   *
   * @param {FolderEntity} folderEntity
   * @throws {Error} if CSRF token is not set
   * @returns {Promise<FolderEntity>}
   */
  async create(folderEntity) {
    const response = await this.apiClient.create(folderEntity.toApiData());
    const updatedFolderEntity = new FolderEntity(FolderEntity.fromApiData(response.body));
    await FolderLocalStorage.addFolder(updatedFolderEntity);
    return updatedFolderEntity;
  }

  /**
   * Update a folder using Passbolt API
   *
   * @param {FolderEntity} folderEntity
   * @throws {Error} if entity id is not set
   * @throws {Error} if CSRF token is not set
   * @returns {Promise<FolderEntity>}
   */
  async update(folderEntity) {
    const response = await this.apiClient.update(folderEntity.getId(), folderEntity.toApiData());
    const updatedFolderEntity = new FolderEntity(FolderEntity.fromApiData(response.body));
    await FolderLocalStorage.updateFolder(updatedFolderEntity);
    return updatedFolderEntity;
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
    await FolderLocalStorage.delete(folderId);
  }

  /**
   * Find folders to share
   * @param {array} foldersIds
   * @returns {array|Error}
   */
  // TODO use apiClient, return collection of folderEntity
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

    const user = User.getInstance();
    const domain = user.settings.getDomain();
    const fetchOptions = {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json'
      }
    };
    let url = new URL(`${domain}/folders.json?api-version=2`);
    foldersIds.forEach(FolderId => {
      url.searchParams.append(`filter[has-id][]`, FolderId);
    });
    url.searchParams.append('contain[permission]', '1');
    url.searchParams.append('contain[permissions.user.profile]', '1');
    url.searchParams.append('contain[permissions.group]', '1');
    let response, json;

    try {
      response = await fetch(url, fetchOptions);
      json = await response.json();
    } catch (error) {
      return new Error(__('There was a problem when trying to retrieve the folders'));
    }

    return json.body;
  };

}

exports.FolderModel = FolderModel;
