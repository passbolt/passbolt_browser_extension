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
const {UserEntity} = require("../entity/user/userEntity");
const {SetupEntity} = require("../entity/setup/setupEntity");
const {SetupService} = require("../../service/api/setup/setupService");
const {UserService} = require("../../service/api/user/userService");

class SetupModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.setupService = new SetupService(apiClientOptions);
    this.userService = new UserService(apiClientOptions);
  }

  /**
   * Find setup info. Retrieve the user profile and server public key and return a setup entity
   * @param {string} userId The user id
   * @param {string} token The setup token
   * populated with these information.
   * @returns {Promise<UserEntity>}
   * @throws {Error} if options are invalid or API error
   */
  async findUser(userId, token) {
    const userDto = await this.setupService.findUserLegacy(userId, token);
    return new UserEntity(userDto);
  }

  /**
   * Validate the account
   * @param {SetupEntity} setupEntity The setup entity
   * @returns {Promise<void>}
   * @throws {Error} if options are invalid or API error
   */
  async validateAccount(setupEntity) {
    const validateAccountDto = setupEntity.toValidateAccountDto();
    await this.userService.validateAccount(setupEntity.userId, validateAccountDto);
  }
}

exports.SetupModel = SetupModel;
