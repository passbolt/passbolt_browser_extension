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
 * @since         4.9.4
 */
import i18n from "../../sdk/i18n";
import {assertUuid} from "../../utils/assertions";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import ResourceModel from "../../model/resource/resourceModel";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import ProgressService from "../../service/progress/progressService";
import DecryptAndParseResourceSecretService from "../../service/secret/decryptAndParseResourceSecretService";
import FindSecretService from "../../service/secret/findSecretService";

class FindSecretByResourceIdController {
  /**
   * Secret decrypt controller constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account The account associated to the worker.
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceModel = new ResourceModel(apiClientOptions, account);
    this.findSecretService = new FindSecretService(account, apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
    this.progressService = new ProgressService(this.worker, i18n.t('Decrypting ...'));
    this.getPassphraseService = new GetPassphraseService(account);
  }

  /**
   * Wrapper of exec function to run it with worker.
   *
   */
  async _exec(resourceId) {
    try {
      const result = await this.exec(resourceId);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Execute the controller
   * @param {string} resourceId The resource uuid
   * @returns {Promise<PlaintextEntity>}
   */
  async exec(resourceId) {
    assertUuid(resourceId);

    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    const resourcePromise = this.resourceModel.getById(resourceId);
    const secret = await this.findSecretService.findByResourceId(resourceId);
    const decryptedPrivateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
    const resource = await resourcePromise;
    const secretSchema = await this.resourceTypeModel.getSecretSchemaById(resource.resourceTypeId);

    return DecryptAndParseResourceSecretService.decryptAndParse(secret, secretSchema, decryptedPrivateKey);
  }
}

export default FindSecretByResourceIdController;
