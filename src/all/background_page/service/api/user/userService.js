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
 * @since         3.0.0
 */
const {AbstractService} = require('../abstract/abstractService');

const USER_SERVICE_RESOURCE_NAME = 'users';

class UserService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, UserService.RESOURCE_NAME);
  }

  /**
   * API User Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return USER_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contains option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      'LastLoggedIn',
      'is_mfa_enabled'
    ];
  }

  /**
   * Return the list of supported filters for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedFiltersOptions() {
    return [
      'search',
      'has-groups',
      'has-access',
      'is-admin'
    ];
  }

  /**
   * Return the list of supported orders for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedOrdersOptions() {
    return [
      'Profile.first_name DESC',
      'Profile.first_name ASC',
      'Profile.last_name DESC',
      'Profile.last_name ASC',
      'Profile.created DESC',
      'Profile.created ASC',
      'Profile.modified DESC',
      'Profile.modified ASC'
    ];
  }

  /**
   * Get a user for a given id
   *
   * @param {string} id user uuid
   * @throws {Error} if API call fails, service unreachable, etc.
   * @returns {Object} userDto
   */
  async get(id) {
    const response = await this.apiClient.get(id);
    return response.body;
  }

  /**
   * Find all users
   *
   * @param {Object} [contains] optional example: {permissions: true}
   * @param {Object} [filters] optional
   * @param {Object} [orders] optional
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll(contains, filters, orders) {
    contains = contains ? this.formatContainOptions(contains, UserService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(filters, UserService.getSupportedFiltersOptions()) : null;
    orders = orders ? this.formatOrderOptions(orders, UserService.getSupportedFiltersOptions()) : null;
    const options = {...contains, ...filters, ...orders};
    const response = await this.apiClient.findAll(options);
    if (!response.body || !response.body.length) {
      return [];
    }
    return response.body;
  }

  /**
   * Create a user using Passbolt API
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
   * Update a user using Passbolt API
   *
   * @param {String} userId uuid
   * @param {Object} userData
   * @returns {Promise<*>} Response body
   * @public
   */
  async update(userId, userData) {
    const response = await this.apiClient.update(userId, userData);
    return response.body;
  }

  /**
   * Delete a user using Passbolt API
   *
   * @param {string} userId uuid
   * @returns {Promise<*>} Response body
   * @public
   */
  async delete(userId) {
    const response = await this.apiClient.delete(userId);
    return response.body;
  }
}

exports.UserService = UserService;
