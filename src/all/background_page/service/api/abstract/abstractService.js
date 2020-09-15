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
const {ApiClient} = require('../apiClient/apiClient');

class AbstractService {
  /**
   *
   * @param apiClientOptions
   * @param resourceName
   */
  constructor(apiClientOptions, resourceName) {
    apiClientOptions.setResourceName(resourceName);
    this.apiClient = new ApiClient(apiClientOptions);
  }

  /**
   * Format contain options
   *
   * @param {object} contain example: {"user": true, "user.profile": true}
   * @param {array} supportedOptions example: ['user', 'user.profile', 'user.profile.avatar']
   * @returns {object} to be used in API request example: {"contain[user]":"1", "contain[user.profile]":"1"}
   */
  formatContainOptions(contain, supportedOptions) {
    const result = {};
    for (let item in contain) {
      if (contain[item] && supportedOptions.includes(item)) {
        result[`contain[${item}]`] = '1';
      }
    }
    return result;
  }

  /**
   * Format contain filters
   *
   * @param {object} filter example: {"has-id": ['uuid', 'uuid2'], "search": 'name'}
   * @param {array} supportedOptions example: ['has-id', 'search']
   * @throws {TypeError} if filter value is not an array or a string
   * @returns {object} to be used in API request
   */
  formatFilterOptions(filter, supportedOptions) {
    const result = {};
    for (let item in filter) {
      if (filter.hasOwnProperty(item) && supportedOptions.includes(item)) {
        if (typeof filter[item] === 'boolean') {
          result[`filter[${item}]`] = (filter[item] ? '1' : '0');
        } else if (typeof filter[item] === 'string') {
          result[`filter[${item}]`] = filter[item];
        } else if (Array.isArray(filter[item])) {
          result[`filter[${item}][]`] = filter[item];
        } else {
          throw new TypeError(`Service error. Filter option should be an array or a string.`);
        }
      }
    }
    return result;
  }

  /**
   * Format contain orders
   *
   * @param {object} orders example: {"orders": ['Resources.name ASC']}
   * @param {array} supportedOrders example: ['Resources.name ASC', 'Resources.name DESC']
   * @returns {object} to be used in API request
   */
  formatOrderOptions(orders, supportedOrders) {
    const result = {};
    for (let order in orders) {
      if (supportedOrders.includes(order)) {
        result[`order[]`] = order;
      }
    }
    return result;
  }

  /**
   * Assert that an id is a valid uuid or throw a TypeError
   *
   * @param {string} id
   * @throws {TypeError} if id is not a valid uuid
   * @return {void}
   * @public
   */
  assertValidId(id) {
    if (!id || typeof id !== 'string' || !Validator.isUUID(id)) {
      throw new TypeError(`Service error. The id '${id}' is not a valid uuid.`);
    }
  }

  /**
   * Assert the provided data is not empty
   *
   * @param {object} data
   * @return {void}
   * @public
   */
  assertNonEmptyData(data) {
    if (!data) {
      throw new TypeError(`Service error. Data cannot be empty.`)
    }
  }
}

exports.AbstractService = AbstractService;
