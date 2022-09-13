/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import AbstractService from "../abstract/abstractService";

const ACCOUNT_RECOVERY_REQUEST_SERVICE_RESOURCE_NAME = '/account-recovery/requests';

class AccountRecoveryRequestService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryRequestService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_REQUEST_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contain option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      "creator",
      "creator.gpgkey",
      'account_recovery_private_key_passwords',
      "armored_key",
    ];
  }

  /**
   * Return the list of supported filters for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedFiltersOptions() {
    return [
      'has-users',
    ];
  }

  /**
   * Find the requests of account recovery by user
   *
   * @param {string} id The request Id
   * @param {Object} [contains] Additionnal information to retrieve along with the request. i.e. {creator: true, creator.gpgkey: true}
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findById(id, contains = {}) {
    const options = contains ? this.formatContainOptions(contains, AccountRecoveryRequestService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.get(id, options);
    return response.body;
  }

  /**
   * Find a request by id by authenticating the user with its authentication token.
   * @param {string} id The request id
   * @param {string} userId The target user id
   * @param {string} authenticationTokenToken The authentication token
   * @returns {Promise<Object>}
   */
  async findRequestByIdAndUserIdAndAuthenticationToken(id, userId, authenticationTokenToken) {
    this.assertValidId(id);
    this.assertValidId(userId);
    this.assertValidId(authenticationTokenToken);
    const url = this.apiClient.buildUrl(`${this.apiClient.baseUrl}/${id}/${userId}/${authenticationTokenToken}`);
    const response = await this.apiClient.fetchAndHandleResponse('GET', url);
    return response.body;
  }

  /**
   * Find the requests of account recovery by user
   *
   * @param {object} filters The additional filters to provide to the API
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findByUser(filters) {
    filters = filters ? this.formatFilterOptions(filters, AccountRecoveryRequestService.getSupportedFiltersOptions()) : null;
    const options = {...filters};
    const response = await this.apiClient.findAll(options);
    return response.body;
  }

  /**
   * Create an account recovery request.
   * @param {Object} accountRecoveryRequestDto The request dto
   * @returns {Promise<object>} response
   * @throws {Error} if options are invalid or API error
   */
  async create(accountRecoveryRequestDto) {
    const response = await this.apiClient.create(accountRecoveryRequestDto);
    return response.body;
  }
}

export default AccountRecoveryRequestService;
