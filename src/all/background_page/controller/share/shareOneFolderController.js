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
 * @since         2.8.0
 */
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import i18n from "../../sdk/i18n";
import ProgressService from "../../service/progress/progressService";
import ShareFoldersService from "../../service/share/shareFoldersService";
import {assertArray, assertNonEmptyArray, assertUuid} from "../../utils/assertions";
import GetOrFindFoldersService from "../../service/folder/getOrFindFoldersService";
import VerifyOrTrustMetadataKeyService from "../../service/metadata/verifyOrTrustMetadataKeyService";

class ShareOneFolderController {
  /**
   * Controller constructor
   *
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.progressService = new ProgressService(this.worker);
    this.shareFoldersService = new ShareFoldersService(apiClientOptions, account, this.progressService);
    this.getPassphraseService = new GetPassphraseService(account);
    this.getOrFindFoldersService = new GetOrFindFoldersService(account, apiClientOptions);
    this.verifyOrTrustMetadataKeyService = new VerifyOrTrustMetadataKeyService(worker, account, apiClientOptions);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   * @return {Promise<void>}
   */
  async _exec(folderId, permissionsChanges) {
    try {
      await this.exec(folderId, permissionsChanges);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Share one folder.
   *
   * @param {string} folderId The folder id to share
   * @param {array} permissionChangesDto The permissions changes
   * @return {Promise}
   */
  async exec(folderId, permissionChangesDto) {
    assertUuid(folderId, 'The parameter "folderId" should be a UUID');
    assertArray(permissionChangesDto, 'The parameter "permissionChangesDto" should be an array');
    assertNonEmptyArray(permissionChangesDto, 'The parameter "permissionChangesDto" should be a non empty array');

    const permissionChanges = new PermissionChangesCollection(permissionChangesDto);
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    await this.verifyOrTrustMetadataKeyService.verifyTrustedOrTrustNewMetadataKey(passphrase);

    const folder = (await this.getOrFindFoldersService.getOrFindAll()).getById(folderId);
    this.progressService.title = i18n.t('Sharing folder {{name}}', {name: folder.name});
    /*
     * 14 steps are required to share a folder and its content:
     * - Retrieving folders permissions
     * - Retrieving resources permission
     * - Calculating the folders permissions changes
     * - Calculating the resources permissions changes
     * - Sharing folder
     * - Updating the resources metadata
     * - Calculating the secrets requirements
     * - Retrieving the secrets
     * - Decrypting the secrets
     * - Synchronizing keyring
     * - Encrypting the secrets
     * - Sharing resources
     * - Updating resources local storage
     * - Updating folders local storage
     */
    const goals = 14;
    this.progressService.start(goals, i18n.t('Initialize'));

    try {
      await this.shareFoldersService.shareOneWithContent(folderId, permissionChanges, passphrase);
      this.progressService.finishStep(i18n.t('Done!'), true);
    } finally {
      this.progressService.close();
    }
  }
}

export default ShareOneFolderController;
