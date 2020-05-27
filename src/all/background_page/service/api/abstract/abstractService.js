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
        result[`contain[${item}]`] = "1";
      }
    }
    return result;
  }

  /**
   * Format contain filters
   *
   * @param {object} contain example: {"has-id": ['uuid', 'uuid2'], "search": 'name'}
   * @param {array} supportedOptions example: ['has-id', 'search']
   * @returns {object} to be used in API request
   */
  formatFilterOptions(contain, supportedOptions) {
    const result = {};
    for (let item in contain) {
      if (contain.hasOwnProperty(item) && supportedOptions.includes(item)) {
        result[`filter[${item}][]`] = contain[item];
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
}

exports.AbstractService = AbstractService;
