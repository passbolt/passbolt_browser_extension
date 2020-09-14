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
const {UsersCollection} = require('../entity/user/usersCollection');
const {UserService} = require('../../service/api/user/userService');

class UserModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.userService = new UserService(apiClientOptions);
  }

  /**
   *
   * @param {string} resourceId uuid
   * @returns {Promise<Array<string>>} Array of user uuids
   */
  async findAllIdsForResourceUpdate(resourceId) {
    if (!Validator.isUUID(resourceId)) {
      throw new TypeError('Error in find all users for resources updates. The resource id is not a valid uuid.');
    }
    const usersDto = await this.userService.findAll(null, {'has-access': resourceId});
    const usersCollection = new UsersCollection(usersDto);
    return usersCollection.ids;
  }
}

exports.UserModel = UserModel;