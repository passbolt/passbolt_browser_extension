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

import DeleteDryRunError from "../../error/deleteDryRunError";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import DeleteUserService from "../../service/user/deleteUserService";
import DecryptMetadataService from "../../service/metadata/decryptMetadataService";
import UserDeleteTransferEntity from "../../model/entity/user/transfer/userDeleteTransferEntity";

class DeleteUserController {
  /**
   * Constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.deleteUserService = new DeleteUserService(account, apiClientOptions);
    this.getPassphraseService = new GetPassphraseService(account);
    this.decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec(userId, transferDto) {
    try {
      await this.exec(userId, transferDto);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Delete dry run the user.
   * @param {string} userId The user id.
   * @param {object} [transferDto = null] The transfer dto.
   * @return {Promise<void>}
   * @throws {DeleteDryRunError} if the data should be transferred to someone.
   * @throws {Error} if the data returned by the API is not a PassboltApiFetchError with error code 400.
   */
  async exec(userId, transferDto = null) {
    try {
      const transferEntity = transferDto ? new UserDeleteTransferEntity(transferDto) : null;
      await this.deleteUserService.delete(userId, transferEntity);
    } catch (error) {
      if (error instanceof DeleteDryRunError) {
        const resourcesCollection = error.errors.resources?.sole_owner;
        if (resourcesCollection?.items.some(resourceEntity => !resourceEntity.isMetadataDecrypted())) {
          const passphrase = this.getPassphraseService.getPassphrase(this.worker);
          await this.decryptMetadataService.decryptAllFromForeignModels(error.errors.resources.sole_owner, passphrase);
        }
      }
      throw error;
    }
  }
}

export default DeleteUserController;
