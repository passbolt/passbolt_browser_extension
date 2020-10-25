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
const {UserLocalStorage} = require("../../service/local_storage/userLocalStorage");
const {MultiFactorAuthenticationService} = require("../../service/api/multiFactorAuthentication/multiFactorAuthenticationService");

class MultiFactorAuthenticationModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.multiFactorAuthenticationService = new MultiFactorAuthenticationService(apiClientOptions);
  }

  /**
   * Disable mfa for a user
   *
   * @param {string} userId The user id
   * @returns {Promise<void>}
   * @public
   */
  async disableForUser(userId) {
    // await this.multiFactorAuthenticationService.disableMfaForUser(userId);
    const userDto = await UserLocalStorage.getUserById(userId);
    console.log(userDto);
    if (userDto) {
      userDto.is_mfa_enabled = false;
      const userEntity = new UserEntity(userDto);
      await UserLocalStorage.updateUser(userEntity);
    }
  }
}

exports.MultiFactorAuthenticationModel = MultiFactorAuthenticationModel;