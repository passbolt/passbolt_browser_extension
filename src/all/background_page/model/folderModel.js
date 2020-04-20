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
const {FolderEntity} = require('./entity/folder/folderEntity');
const {FolderLocalStorage} = require('../service/local_storage/folder');
const {FolderService} = require('../service/api/folder');

class FolderModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.folderService = new FolderService(apiClientOptions);
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
   * Get all folders from API and map API result to folder Entity
   * @return {Array<FolderEntity>} folders
   */
  async findAll(options) {
    return await this.folderService
      .findAll(options)
      .map(folder => FolderEntity.fromApiData(folder));
  }

  /**
   * Create a folder using Passbolt API and add result to local storage
   *
   * @param {FolderEntity} folderEntity
   * @throws {Error} if CSRF token is not set
   * @returns {Promise<FolderEntity>}
   */
  async create(folderEntity) {
    const response = await this.folderService.create(folderEntity.toApiData());
    const updatedFolderEntity = FolderEntity.fromApiData(response);
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
    const response = await this.folderService.update(folderEntity.getId(), folderEntity.toApiData());
    const updatedFolderEntity = FolderEntity.fromApiData(response.body);
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
    await this.folderService.delete(folderId, cascade);
    await FolderLocalStorage.delete(folderId);
  }
}

exports.FolderModel = FolderModel;
