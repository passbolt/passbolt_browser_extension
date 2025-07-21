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
 * @since         5.4.0
 */
import UserService from "../api/user/userService";
import {assertType, assertUuid} from "../../utils/assertions";
import DeleteDryRunError from "../../error/deleteDryRunError";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import UserDeleteTransferEntity from "../../model/entity/user/transfer/userDeleteTransferEntity";
import UserLocalStorage from "../local_storage/userLocalStorage";

/**
 * The service aims to delete user from the API.
 */
export default class DeleteUserService {
  /**
   *
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.userServiceApi = new UserService(apiClientOptions);
  }

  /**
   * Delete dry run a user.
   * Check if a user can be deleted.
   *
   * A user can not be deleted if:
   * - they are the only owner of a shared resource
   * - they are the only group manager of a group that owns a shared resource
   * In such case ownership transfer is required.
   *
   * @param {string} userId The user id.
   * @returns {Promise<void>}
   * @throws {DeleteDryRunError} if the data should be transferred to someone.
   * @throws {Error} if the data returned by the API is not a PassboltApiFetchError with error code 400 and groups, resources or folders to transfer.
   */
  async deleteDryRun(userId) {
    assertUuid(userId, "The parameter \"userId\" should be a UUID");
    try {
      await this.userServiceApi.delete(userId, {}, true);
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Delete a user and transfer ownership if needed.
   * @param {string} userId The user id.
   * @param {UserDeleteTransferEntity} [transfer] optional ownership transfer information if needed.
   * @returns {Promise<void>}
   * @throws {DeleteDryRunError} if some permissions must be transferred.
   * @throws {Error} if the data returned by the API is not a PassboltApiFetchError with error code 400 and groups, resources or folders to transfer.
   */
  async delete(userId, transfer) {
    assertUuid(userId, "The parameter \"userId\" should be a UUID");
    if (transfer !== null) {
      assertType(transfer, UserDeleteTransferEntity, 'The `transfer` parameter should be a UserDeleteTransferEntity.');
    }
    try {
      const deleteData = transfer ? transfer.toDto() : {};
      await this.userServiceApi.delete(userId, deleteData);
    } catch (error) {
      await this.handleError(error);
    }
    // Update local storage
    await UserLocalStorage.delete(userId);
  }

  /**
   * @private
   * @param {object} error The error
   * @throws {DeleteDryRunError} if some permissions must be transferred.
   * @throws {Error} if the data returned by the API is not a PassboltApiFetchError with error code 400 and groups, resources or folders to transfer.
   */
  async handleError(error) {
    if (error instanceof PassboltApiFetchError && error.data.code === 400 && error.data.body.errors) {
      /*
       * recast generic 400 error into a delete dry run error
       * allowing validation of the returned entities and reuse down the line to transfer permissions
       */
      throw new DeleteDryRunError(error.message, error.data.body.errors);
    }
    throw error;
  }
}
