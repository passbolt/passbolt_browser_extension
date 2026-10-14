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
 * @since         2.13.0
 */
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import ProgressService from "../../service/progress/progressService";
import MoveResourcesService, { PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL } from "../../service/move/moveResourcesService";
import { assertArrayUUID, assertUuid } from "passbolt-styleguide/src/shared/utils/assertions";
import GetOrFindFoldersService from "../../service/folder/getOrFindFoldersService";
import i18n from "../../sdk/i18n";
import VerifyOrTrustMetadataKeyService from "../../service/metadata/verifyOrTrustMetadataKeyService";
import deserializeConfirmedMovePermissions from "../../service/move/deserializeConfirmedMovePermissions";

class MoveResourcesController {
  /**
   * MoveResourcesController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account the account associated to the worker
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.progressService = new ProgressService(this.worker);
    this.getPassphraseService = new GetPassphraseService(account);
    this.moveResourcesService = new MoveResourcesService(apiClientOptions, account, this.progressService);
    this.getOrFindFoldersService = new GetOrFindFoldersService(account, apiClientOptions);
    this.verifyOrTrustMetadataKeyService = new VerifyOrTrustMetadataKeyService(worker, account, apiClientOptions);
  }

  /**
   * Move content.
   *
   * @param {Array<string>} resourcesIds
   * @param {string|null} destinationFolderId
   * @param {Object<string, Array<object>>|null} permissionsDto The permissions the operator confirmed, keyed by resource id, or null.
   */
  async _exec(resourcesIds, destinationFolderId, permissionsDto) {
    try {
      const result = await this.exec(resourcesIds, destinationFolderId, permissionsDto);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }

  /**
   * @param {Array<string>} resourcesIds The resources ids to move
   * @param {string} [destinationFolderId=null] The target destination folder, or null if root.
   * @param {Object<string, Array<object>>|null} [permissionsDto=null] The permissions the operator confirmed, keyed by resource id. Null to keep the permissions as they are.
   * @returns {Promise<{skippedResourceIds: Array<string>}>} The ids of the resources that could not be moved.
   */
  async exec(resourcesIds, destinationFolderId = null, permissionsDto = null) {
    assertArrayUUID(resourcesIds, "The resourceIds should be a valid array of UUID");
    if (destinationFolderId !== null) {
      assertUuid(destinationFolderId, "The destinationFolderId should be a valid UUID");
    }
    const confirmedPermissions = deserializeConfirmedMovePermissions(permissionsDto, resourcesIds);
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    await this.verifyOrTrustMetadataKeyService.verifyTrustedOrTrustNewMetadataKey(passphrase);

    this.progressService.title = i18n.t("Moving {{count}} resources", { count: resourcesIds.length });
    // One extra step for the closing "Done!" message.
    this.progressService.start(PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL + 1, i18n.t("Initializing ..."));
    try {
      const result = await this.moveResourcesService.moveAll(
        resourcesIds,
        destinationFolderId,
        confirmedPermissions,
        passphrase,
      );
      this.progressService.finishStep(i18n.t("Done!"), true);
      return result;
    } finally {
      this.progressService.close();
    }
  }
}

export default MoveResourcesController;
