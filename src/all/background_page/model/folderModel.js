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
    this.client = new ApiClient(apiClientOptions);
  }

  /**
   * Update the resources local storage with the latest API resources the user has access.
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
    const response = await this.client.findAll(options);
    if (!response.body || !response.body.length) {
      return [];
    }
    return response.body.map(folder => new FolderEntity(FolderEntity.fromApiData(folder)));
  }

  /**
   */
  async findOne(folderId) {
    const response = await this.client.get(folderId);
    return new FolderEntity(response.body);
  }

  /**
   * Create a folder using Passbolt API
   *
   * @param {FolderEntity} folderEntity
   * @throws {Error} if CSRF token is not set
   * @returns {Promise<FolderEntity>}
   */
  async create(folderEntity) {
    const response = await this.client.create(folderEntity.toApiData());
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
    const response = await this.client.update(folderEntity.getId(), folderEntity.toApiData());
    const updatedFolderEntity = new FolderEntity(FolderEntity.fromApiData(response.body));
    await FolderLocalStorage.updateFolder(updatedFolderEntity);
    return updatedFolderEntity;
  }

  /**
   * Delete a folder using Passbolt API
   *
   * @param {string} folderId uuid
   * @param {boolean} [cascade] delete sub folder / resources
   * @throws {TypeError} if entity id is not set
   * @throws {Error} if CSRF token is not set
   * @returns {Promise<void>}
   */
  async delete(folderId, cascade) {
    const options = {};
    if (cascade) {
      options.cascade = "1";
    }
    await this.client.delete(folderId, null, options);
    await FolderLocalStorage.delete(folderId);
  }
}

exports.FolderModel = FolderModel;
