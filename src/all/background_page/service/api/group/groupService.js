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
import AbstractService from "../abstract/abstractService";

const GROUP_SERVICE_RESOURCE_NAME = 'groups';

class GroupService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, GroupService.RESOURCE_NAME);
  }

  /**
   * API Group Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return GROUP_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contains option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      'modifier',
      'modifier.profile',
      'my_group_user',
      'groups_users',
      'groups_users.user',
      'groups_users.user.profile',
      'groups_users.user.gpgkey',

      // @deprecated when v2.13 support is removed
      'group_user',
      'group_user.user',
      'group_user.user.profile',
      'group_user.user.gpgkey'
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
      'has-managers',
    ];
  }

  /**
   * Return the list of supported orders for in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedOrdersOptions() {
    return [
      'Group.name DESC',
      'Group.name ASC',
    ];
  }

  /**
   * Get a group for a given id
   *
   * @param {string} id group uuid
   * @throws {Error} if API call fails, service unreachable, etc.
   * @throws {TypeError} if group id is not a valid uuid
   * @returns {Object} groupDto
   */
  async get(id) {
    this.assertValidId(id);
    const response = await this.apiClient.get(id);
    return response.body;
  }

  /**
   * Find all groups
   *
   * @param {Object} [contains] optional example: {permissions: true}
   * @param {Object} [filters] optional
   * @param {Object} [orders] optional
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async findAll(contains, filters, orders) {
    const legacyContain = GroupService.remapLegacyContain(contains);// crassette
    contains = legacyContain ? this.formatContainOptions(legacyContain, GroupService.getSupportedContainOptions()) : null;
    filters = filters ? this.formatFilterOptions(filters, GroupService.getSupportedFiltersOptions()) : null;
    orders = orders ? this.formatOrderOptions(orders, GroupService.getSupportedFiltersOptions()) : null;
    const options = {...contains, ...filters, ...orders};
    const response = await this.apiClient.findAll(options);
    if (!response.body || !response.body.length) {
      return [];
    }
    return response.body;
  }

  /**
   * Create a group using Passbolt API
   *
   * @param {Object} data
   * @returns {Promise<*>} Response body
   * @public
   */
  async create(data) {
    this.assertNonEmptyData(data);
    data = GroupService.remapV2DataToV1(data); // crassette
    const response = await this.apiClient.create(data);
    return response.body;
  }

  /**
   * Update a group using Passbolt API
   *
   * @param {String} groupId uuid
   * @param {Object} groupData
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if group id is not a valid uuid
   * @public
   */
  async update(groupId, groupData) {
    this.assertValidId(groupId);
    this.assertNonEmptyData(groupData);
    const response = await this.apiClient.update(groupId, groupData);
    return response.body;
  }

  /**
   * Simulate a group update using Passbolt API
   *
   * @param {String} groupId uuid
   * @param {Object} groupData
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if group id is not a valid uuid
   * @public
   */
  async updateDryRun(groupId, groupData) {
    this.assertValidId(groupId);
    this.assertNonEmptyData(groupData);
    const {body} = await this.apiClient.update(groupId, groupData, {}, true);

    if (body) {
      // @deprecated prior to API v2.14, the update dry run returns only v1 format result.
      if (body['dry-run']) {
        return this.remapUpdateDryRunDataV1tov2(body['dry-run']);
      } else {
        return body;
      }
    }
  }

  /**
   * Delete a group using Passbolt API
   *
   * @param {string} groupId uuid
   * @param {object} transfer for example instructions for permissions transfer
   * @param {boolean} [dryRun] optional (default false)
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if group id is not a valid uuid
   * @throw {ApiFetchError} if group cannot be deleted
   * @public
   */
  async delete(groupId, transfer, dryRun) {
    this.assertValidId(groupId);
    const data = transfer ? {transfer: transfer} : {};
    const response = await this.apiClient.delete(groupId, data, {},  dryRun);
    return response.body;
  }

  /*
   * ========================================================================
   * CRASSETTES
   * ========================================================================
   */
  /**
   * @deprecated should be removed when v2.14 support is dropped
   * @param {undefined|Object} data
   * @returns {undefined|Object}
   */
  static remapV2DataToV1(data) {
    if (!data || !data.name || !data.groups_users) {
      return undefined;
    }
    const groups_users = [];
    for (const g of data.groups_users) {
      const group_user =  {};
      if (Object.prototype.hasOwnProperty.call(g, 'user_id')) {
        group_user.user_id = g.user_id;
      }
      if (Object.prototype.hasOwnProperty.call(g, 'is_admin')) {
        group_user.is_admin = g.is_admin ? 1 : 0;
      }
      groups_users.push({'GroupUser': group_user});
    }
    return {
      'Group': {name: data.name},
      'GroupUsers': groups_users
    };
  }

  /**
   * @deprecated should be removed when v2.14 support is dropped
   * @param {undefined|Object} contain
   * @returns {undefined|Object}
   */
  static remapLegacyContain(contain) {
    if (!contain) {
      return undefined;
    }
    /*
     * Remap for compatibility reason
     * groups_users => group_user
     */
    if (Object.prototype.hasOwnProperty.call(contain, 'groups_users')) {
      if (typeof contain.groups_users === 'boolean') {
        contain.group_user = contain.groups_users;
      } else {
        contain.group_user = Object.assign({}, contain.groups_users);
      }
      delete contain.groups_users;
    }
    return contain;
  }

  /**
   * @deprecated should be removed when v2.14 support is dropped
   * Remap update dry run result from V1 format to v2 format.
   * @returns {{secrets_needed: (*|*[]), secrets: (*|*[])}}
   */
  remapUpdateDryRunDataV1tov2(data) {
    let secrets = [];
    let needed_secrets = [];

    if (data.Secrets && Array.isArray(data.Secrets)) {
      const mapLegacySecret = legacySecret => legacySecret.Secret && Array.isArray(legacySecret.Secret) ? legacySecret.Secret[0] : null;
      secrets = data.Secrets.map(mapLegacySecret);
    }
    if (data.SecretsNeeded && Array.isArray(data.SecretsNeeded)) {
      const mapLegacyNeededSecret = legacyNeededSecret => legacyNeededSecret.Secret;
      needed_secrets = data.SecretsNeeded.map(mapLegacyNeededSecret);
    }

    return {secrets: secrets, needed_secrets: needed_secrets};
  }
}

export default GroupService;
