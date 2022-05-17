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
const {i18n} = require('../../sdk/i18n');
const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

const {ResourceModel} = require('../../model/resource/resourceModel');
const {DecryptMessageService} = require('../../service/crypto/decryptMessageService');
const {GetDecryptedUserPrivateKeyService} = require('../../service/account/getDecryptedUserPrivateKeyService');
const {readMessageOrFail} = require('../../utils/openpgp/openpgpAssertions');

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
        await progressController.open(this.worker, i18n.t('Decrypting ...'), 2, i18n.t("Decrypting private key"));
      }
      const privateKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);

      // Decrypt and deserialize the secret if needed
      if (showProgress) {
        await progressController.update(this.worker, 1, i18n.t("Decrypting secret"));
      }
      const resource = await resourcePromise;
      const resourceSecretMessage = await readMessageOrFail(resource.secret.data);
      let plaintext = await DecryptMessageService.decrypt(resourceSecretMessage, privateKey);
      plaintext = await this.resourceModel.deserializePlaintext(resource.resourceTypeId, plaintext);

      // Wrap up
      if (showProgress) {
        await progressController.update(this.worker, 2, i18n.t("Complete"));
        await progressController.close(this.worker);
      }
      return {plaintext: plaintext, resource: resource};
    } catch (error) {
      console.error(error);
      if (showProgress) {
        await progressController.close(this.worker);
      }
      throw error;
    }
  }
}

exports.SecretDecryptController = SecretDecryptController;
