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
 * @since         5.13.0
 */
import UsersCollection from "passbolt-styleguide/src/shared/models/entity/user/usersCollection";
import UserLocalStorage from "../local_storage/userLocalStorage";
import FindAndUpdateUsersLocalStorageService from "./findAndUpdateUsersLocalStorageService";
import { assertArrayUUID } from "../../utils/assertions";

/**
 * The service aims to get users from the local storage if it is set, or retrieve them from the API and
 * set the local storage.
 */
class GetOrFindUsersService {
  /**
   * Constructor.
   * @param {AccountEntity} account The user account.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(account, apiClientOptions) {
    this.findAndUpdateUsersLocalStorage = new FindAndUpdateUsersLocalStorageService(account, apiClientOptions);
  }

  /**
   * Get or find all users.
   * @returns {Promise<UsersCollection>}
   */
  async getOrFindAll() {
    const usersDto = await UserLocalStorage.get();
    if (typeof usersDto !== "undefined") {
      return new UsersCollection(usersDto);
    }
    return this.findAndUpdateUsersLocalStorage.findAndUpdateAll();
  }

  /**
   * Get or find all the users matching the given ids.
   * @param {Array<string>} userIds The ids of the users to retrieve.
   * @returns {Promise<UsersCollection>}
   */
  async getOrFindByIds(userIds) {
    assertArrayUUID(userIds);

    const usersCollection = await this.getOrFindAll();
    usersCollection.filterByPropertyValueIn("id", userIds);

    return usersCollection;
  }
}

export default GetOrFindUsersService;
