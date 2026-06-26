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
 * @since         5.13.0
 */
import GroupUpdateSecretsCollection from "../../../../all/background_page/model/entity/secret/groupUpdate/groupUpdateSecretsCollection";
import NeededSecretsCollection from "../../../../all/background_page/model/entity/secret/needed/neededSecretsCollection";
import DecryptPrivateKeyService from "../../../../all/background_page/service/crypto/decryptPrivateKeyService";
import GroupUpdateSecretsCryptoService from "../../../../all/background_page/service/group/groupUpdateSecretsCryptoService";

export const SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN = "add-user-to-group-offscreen";
export const SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_HANDLER =
  "service-worker-add-user-to-group-offscreen-response-handler";
export const SEND_MESSAGE_TARGET_OFFSCREEN_PROGRESS_SERVICE_HANDLER =
  "service-worker-offscreen-progress-service-handler";
export const ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_SUCCESS = "success";
export const ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_ERROR = "error";
export const ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_PROGRESS = "progress";

const PROGRESS_INTERVAL_MS = 80; // send progress message every 80ms

export default class AddUsersToGroupOffscreenService {
  /**
   * Handle decryption and encryption of add user to group.
   * @param {{requestId: string, addUsersToGroupContent: object}} message arguments to pass to decrypt and encrypt secrets for users.
   * @returns {Promise<object>}
   */
  static async handleRequest({ requestId, addUsersToGroupContent }) {
    try {
      const groupUpdateSecrets = await AddUsersToGroupOffscreenService._handleDecryptAndEncryptRequest(
        requestId,
        addUsersToGroupContent,
      );
      return await AddUsersToGroupOffscreenService.handleSuccessResponse(groupUpdateSecrets);
    } catch (error) {
      return AddUsersToGroupOffscreenService.handleErrorResponse(error);
    }
  }

  /**
   * Handles decrypt and encrypt secrets
   * @param {string} requestId The offscreen request id, used to route progress messages.
   * @param {object} addUsersToGroupContent
   * @returns {Promise<GroupUpdateSecretsCollection>}
   * @private
   */
  static async _handleDecryptAndEncryptRequest(requestId, addUsersToGroupContent) {
    const privateKey = await DecryptPrivateKeyService.decryptArmoredKey(
      addUsersToGroupContent.privateKey.armoredKey,
      addUsersToGroupContent.privateKey.passphrase,
    );
    const secrets = new GroupUpdateSecretsCollection(addUsersToGroupContent.secrets, { validate: false });
    const neededSecrets = new NeededSecretsCollection(addUsersToGroupContent.neededSecrets, { validate: false });

    /*
     * Throttle progress messages to the service worker. Sending a message also keeps the app progress
     * dialog refreshed while the offscreen processes the cryptographic operations.
     */
    let lastYield = Date.now();
    const onProgress = async (message) => {
      if (Date.now() - lastYield >= PROGRESS_INTERVAL_MS) {
        await AddUsersToGroupOffscreenService.handleProgressResponse(requestId, { message });
        lastYield = Date.now();
      }
    };

    const decryptedSecrets = await GroupUpdateSecretsCryptoService.decryptSecrets(privateKey, secrets, onProgress);
    return await GroupUpdateSecretsCryptoService.encryptSecrets(
      privateKey,
      addUsersToGroupContent.usersPublicKeys,
      neededSecrets,
      decryptedSecrets,
      onProgress,
    );
  }

  /**
   * Build the success response sent back to the service worker.
   * @param {GroupUpdateSecretsCollection} groupUpdateSecrets The groupUpdateSecrets
   * @returns {Promise<object>}
   * @private
   */
  static async handleSuccessResponse(groupUpdateSecrets) {
    return {
      data: groupUpdateSecrets.toDto(),
      type: ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_SUCCESS,
      target: SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_HANDLER,
    };
  }

  /**
   * Build the error response sent back to the service worker.
   * @param {Error} error The error
   * @returns {object}
   * @private
   */
  static handleErrorResponse(error) {
    console.error(error);
    return {
      data: {
        name: error?.name,
        message: error?.message || "AddUsersToGroupOffscreenService: an unexpected error occurred",
      },
      type: ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_ERROR,
      target: SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_HANDLER,
    };
  }

  /**
   * Send a progress message to the service worker so it can update the app progress dialog.
   * @param {string} requestId The offscreen request id, used to route the progress to the right progress service.
   * @param {{message: string}} progress
   * @returns {Promise<void>}
   * @private
   */
  static async handleProgressResponse(requestId, progress) {
    await chrome.runtime.sendMessage({
      id: requestId,
      data: progress,
      type: ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_PROGRESS,
      target: SEND_MESSAGE_TARGET_OFFSCREEN_PROGRESS_SERVICE_HANDLER,
    });
  }
}
