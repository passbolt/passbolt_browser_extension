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
 * @since         4.10.1
 */
import FindAndUpdateFoldersLocalStorageService from "./findAndUpdateFoldersLocalStorageService";
import FolderLocalStorage from "../local_storage/folderLocalStorage";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import {assertUuid} from "../../utils/assertions";

/**
 * The service aims to get folders from the local storage if it is set, or retrieve them from the API and
 * set the local storage.
 */
export default class GetOrFindFoldersService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.findAndUpdateFoldersLocalStorage = new FindAndUpdateFoldersLocalStorageService(account, apiClientOptions);
  }

  /**
   * Get or find all folders.
   * @returns {Promise<FoldersCollection>}
   */
  async getOrFindAll() {
    const hasRuntimeCache = FolderLocalStorage.hasCachedData();
    const foldersDto = await FolderLocalStorage.get();
    // Return local storage data if the storage was initialized.
    if (foldersDto) {
      // No validation is required if the data is in the runtime cache, as validation was done by the process that set the cache.
      return new FoldersCollection(foldersDto, {validate: !hasRuntimeCache});
    }

    // Otherwise retrieve the folders and update the local storage.
    return this.findAndUpdateFoldersLocalStorage.findAndUpdateAll();
  }

  /**
   * Get or find a folder given its id.
   * @param {string} folderId the folder to find.
   * @return {Promise<FolderEntity>}
   */
  async getOrFindById(folderId) {
    assertUuid(folderId);

    const foldersCollection = await this.getOrFindAll();

    return foldersCollection.getById(folderId);
  }
}
