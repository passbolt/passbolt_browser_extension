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
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import ResourceModel from "../../model/resource/resourceModel";
import {PassphraseController as passphraseController} from "../passphrase/passphraseController";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import i18n from "../../sdk/i18n";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import ProgressService from "../../service/progress/progressService";


class SecretDecryptController {
  /**
   * Secret decrypt controller constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.resourceModel = new ResourceModel(apiClientOptions);
    this.progressService = new ProgressService(this.worker, i18n.t('Decrypting ...'));
  }

  /**
   * Execute the controller
   * @param {string} resourceId the resource uuid
   * @return {Promise<Object>} e.g. {resource: <ResourceEntity>, plaintext:<PlaintextEntity|string>}
   */
  async main(resourceId, showProgress) {
    // Start downloading secret
    const resourcePromise = this.resourceModel.findForDecrypt(resourceId);

    // Capture the passphrase if needed
    const passphrase = await passphraseController.get(this.worker);

    try {
      // Decrypt the private key
      if (showProgress) {
        this.progressService.start(2, i18n.t("Decrypting private key"));
      }
      const privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);

      // Decrypt and deserialize the secret if needed
      if (showProgress) {
        await this.progressService.finishStep(i18n.t("Decrypting secret"), true);
      }
      const resource = await resourcePromise;
      const resourceSecretMessage = await OpenpgpAssertion.readMessageOrFail(resource.secret.data);
      let plaintext = await DecryptMessageService.decrypt(resourceSecretMessage, privateKey);
      plaintext = await this.resourceModel.deserializePlaintext(resource.resourceTypeId, plaintext);

      // Wrap up
      if (showProgress) {
        await this.progressService.finishStep(i18n.t("Complete"), true);
        await this.progressService.close();
      }
      return {plaintext: plaintext, resource: resource};
    } catch (error) {
      console.error(error);
      if (showProgress) {
        await this.progressService.close();
      }
      throw error;
    }
  }
}

export default SecretDecryptController;
