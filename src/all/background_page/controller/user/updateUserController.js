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
 * @since         4.4.0
 */

import UserEntity from "../../model/entity/user/userEntity";
import UserModel from "../../model/user/userModel";

class UpdateUserController {
  /**
   * Constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions The
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.userModel = new UserModel(apiClientOptions, account);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec(userDto) {
    try {
      const updatedUser = await this.exec(userDto);
      this.worker.port.emit(this.requestId, 'SUCCESS', updatedUser);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Update the given user on the API.
   * @param {object} userDto the user dto to register on the API
   * @return {Promise<UserEntity>}
   */
  async exec(userDto) {
    const userEntity = new UserEntity(userDto);
    return await this.userModel.update(userEntity, true);
  }
}

export default UpdateUserController;
