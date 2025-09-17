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
 * @since         5.6.0
 */


import {assertString} from "../../../utils/assertions";
import i18n from "../../../sdk/i18n";
import EncryptMetadataService from "../encryptMetadataService";
import MetadataRotateKeysResourcesApiService from "../../api/metadata/metadataRotateKeysResourcesApiService";
import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";
import DecryptMetadataService from "../decryptMetadataService";

const MAX_PROCESS_REPLAY = 3;

/**
 * The service aims to rotate resources metadata key.
 */
export default class RotateResourcesMetadataKeyService {
  /**
   * @constructor
   * @param {AccountEntity} account the account associated to the worker
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {ProgressService} progressService The progress service
   */
  constructor(account, apiClientOptions, progressService) {
    this.decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);
    this.encryptMetadataService = new EncryptMetadataService(apiClientOptions, account);
    this.progressService = progressService;
    this.metadataRotateKeysResourcesApiService = new MetadataRotateKeysResourcesApiService(apiClientOptions);
  }

  /**
   * Runs a process that could fail for any reason but restarts it until a maximum attempt is reach.
   * @param {Function} callback the process that could fail to be played and replayed
   * @param {object} replayOption an object containing the replay state.
   */
  async _runReplayableProcess(callback, replayOption) {
    try {
      await callback();
    } catch (error) {
      if (error?.data?.code !== 404 && error?.data?.code !== 409) {
        throw error;
      }

      replayOption.count++;
      if (replayOption.count >= MAX_PROCESS_REPLAY) {
        const errorExceeded = new Error("Too many attempts to run a process. Aborting");
        errorExceeded.cause = error;
        throw errorExceeded;
      }

      await this._runReplayableProcess(callback, replayOption);
    }
  }

  /**
   * Rotate resources metadata with the last active metadata key.
   *
   * @param {string} passphrase The user passphrase.
   * @param {Object} [replayOptions] The replay options
   * @returns {Promise<void>}
   * @throws {TypeError} if the `metadataKeyPair` argument is not of type ExternalGpgKeyPairEntity
   * @throws {TypeError} if passphrase argument is not a string
   */
  async rotate(passphrase, replayOptions = {count: 0}) {
    assertString(passphrase);
    await this._runReplayableProcess(() => this._rotateResources(passphrase), replayOptions);
  }

  /**
   * Run the rotation of the resource metadata.
   * @param {string} passphrase
   * @returns {Promise<void>}
   * @private
   */
  async _rotateResources(passphrase) {
    let resourcePage = 0;
    this.progressService.finishStep(i18n.t('Retrieving resources'));
    let passboltResponseEntity = await this.metadataRotateKeysResourcesApiService.findAll();
    const totalPagesCount = passboltResponseEntity.header.pagination.pageCount;
    this.progressService.updateGoals(totalPagesCount + 3); // total pages + start + retrieving + done
    let resourcesCollection = new ResourcesCollection(passboltResponseEntity.body);

    while (resourcesCollection.length > 0) {
      this.progressService.finishStep(i18n.t('Rotating resources metadata page {{number}}/{{totalPagesCount}}', {number: ++resourcePage, totalPagesCount: totalPagesCount}));
      await this.decryptMetadataService.decryptAllFromForeignModels(resourcesCollection, passphrase);
      await this.encryptMetadataService.encryptAllFromForeignModels(resourcesCollection, passphrase);
      passboltResponseEntity = await this.metadataRotateKeysResourcesApiService.rotate(resourcesCollection);
      resourcesCollection = new ResourcesCollection(passboltResponseEntity.body);
    }
  }
}
