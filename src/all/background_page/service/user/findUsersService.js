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
 * @since         4.11.0
 */
import UsersCollection from "../../model/entity/user/usersCollection";
import UserService from "../api/user/userService";

/**
 * The service aims to find resources from the API.
 */
export default class FindUsersService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.userApiService = new UserService(apiClientOptions);
  }

  /**
   * Find all users.
   * @param {Object} [contains = {}] optional example: {profile: true}. By default, the service will disable the API default
   * contains behavior and delegate the responsibility of defining the contains parameter to the service callers. API
   * default contains:
   *   - profile
   *   - gpgkey
   *   - groups_users
   *   - role
   * @param {Object} [filters = {}] optional
   * @param {boolean?} [ignoreInvalidEntity = false] Should invalid entities be ignored.
   * @returns {Promise<UsersCollection>}
   */
  async findAll(contains = {}, filters = {}, ignoreInvalidEntity = false) {
    const supportedOptions = UserService.getSupportedContainOptions();
    const supportedFilter = UserService.getSupportedFiltersOptions();

    if (contains && !Object.keys(contains).every(option => supportedOptions.includes(option))) {
      throw new Error("Unsupported contains parameter used, please check supported contains");
    }

    if (filters && !Object.keys(filters).every(filter => supportedFilter.includes(filter))) {
      throw new Error("Unsupported filter parameter used, please check supported filters");
    }

    // Remove default contains served by the API if not explicitly given.
    const sanitizedContains = {
      profile: false,
      gpgkey: false,
      groups_users: false,
      role: false,
      ...contains,
    };
    const usersDto = await this.userApiService.findAll(sanitizedContains, filters);

    return new UsersCollection(usersDto, {clone: false, ignoreInvalidEntity: ignoreInvalidEntity});
  }

  /**
   * Retrieve all active users.
   * @returns {Promise<UsersCollection>}
   * @throws {CollectionValidationError} if the data returned by the API does not validate.
   */
  async findAllActive() {
    const filters = {"is-active": true};
    return this.findAll({}, filters);
  }
}
