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
// const FolderLocalStorage = require('../service/local_storage/folder').FolderLocalStorage;

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
   */
  async findAll() {
    return this.client.findAll();
    // await FolderLocalStorage.addFolder(folders);
    // return folders;
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
    return new FolderEntity(response.body);
  }
}

exports.FolderModel = FolderModel;
