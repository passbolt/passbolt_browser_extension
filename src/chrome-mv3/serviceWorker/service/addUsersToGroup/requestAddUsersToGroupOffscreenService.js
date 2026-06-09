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
import CreateOffscreenDocumentService from "../offscreen/createOffscreenDocumentService";
import HandleOffscreenResponseService from "../offscreen/handleOffscreenResponseService";
import { SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN } from "../../../offscreens/service/group/addUsersToGroupOffscreenService";
import ResponseAddUsersToGroupOffscreenService from "./responseAddUsersToGroupOffscreenService";
import { assertPassphrase, assertType } from "../../../../all/background_page/utils/assertions";
import AccountEntity from "../../../../all/background_page/model/entity/account/accountEntity";
import GroupUpdateDryRunResultEntity from "../../../../all/background_page/model/entity/group/update/groupUpdateDryRunResultEntity";
import ProgressService from "../../../../all/background_page/service/progress/progressService";

export class RequestAddUsersToGroupOffscreenService {
  /**
   * Run the decryption and encryption of the secrets through offscreen.
   * @param {AccountEntity} account
   * @param {string} passphrase
   * @param {GroupUpdateDryRunResultEntity} groupUpdateDryRunResultEntity
   * @param {object} usersPublicKeys
   * @param {ProgressService} progressService the progress service
   * @returns {Promise<object[]>} The encrypted group update secrets as DTOs.
   */
  static async decryptAndEncryptSecrets(
    account,
    passphrase,
    groupUpdateDryRunResultEntity,
    usersPublicKeys,
    progressService,
  ) {
    assertType(account, AccountEntity);
    assertPassphrase(passphrase);
    assertType(groupUpdateDryRunResultEntity, GroupUpdateDryRunResultEntity);
    assertType(progressService, ProgressService);
    await CreateOffscreenDocumentService.createIfNotExistOffscreenDocument();

    const requestId = crypto.randomUUID();
    const offscreenAddUsersToGroupData = {
      requestId: requestId,
      addUsersToGroupContent: {
        privateKey: {
          armoredKey: account.userPrivateArmoredKey,
          passphrase: passphrase,
        },
        secrets: groupUpdateDryRunResultEntity.secrets.toDto(),
        neededSecrets: groupUpdateDryRunResultEntity.neededSecrets.toDto(),
        usersPublicKeys: usersPublicKeys,
      },
    };
    // Register the progress service for this request so progress messages can be routed back to the app
    ResponseAddUsersToGroupOffscreenService.setProgressService(requestId, progressService);
    return new Promise((resolve, reject) => {
      // Stack the response listener callbacks.
      HandleOffscreenResponseService.setResponseCallback(requestId, { resolve, reject });
      return RequestAddUsersToGroupOffscreenService.sendOffscreenMessage(requestId, offscreenAddUsersToGroupData).catch(
        reject,
      );
    });
  }

  /**
   * Send message to the offscreen document for add users to group decryption and encryption operations.
   * @param {string} id The id.
   * @param {object} data The data to handle.
   * @returns {Promise<*>}
   */
  static async sendOffscreenMessage(id, data) {
    return chrome.runtime.sendMessage({
      id: id,
      data: data,
      target: SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN,
    });
  }
}
