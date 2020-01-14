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
const Crypto = require('../../model/crypto').Crypto;
const masterPasswordController = require('../masterPasswordController');
const progressDialogController = require('../progressDialogController');
const reactProgressDialogController = require('../progress/progressDialogController');
const ResourceService = require('../../service/resource').ResourceService;
const Secret = require('../../model/secret').Secret;
const Worker = require('../../model/worker');

/**
 * Secret decrypt controller
 */
class SecretDecryptController {

  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Execute the controller
   * @param {array} resourceId The resource identifier to decrypt the secret of.
   * @return {Promise}
   */
  async decrypt(resourceId) {
    const crypto = new Crypto();

    try {
      const secretPromise = this._getSecret(resourceId);
      const masterPassword = await masterPasswordController.get(this.worker);
      await this._showProgress();
      const secret = await secretPromise;
      const message = await crypto.decrypt(secret.data, masterPassword);
      this.worker.port.emit(this.requestId, 'SUCCESS', message);
    } catch (error) {
      this.worker.port.emit(this.requestId, 'ERROR', this.worker.port.getEmitableError(error));
    }

    this._hideProgress();
  }

  /**
   * Get the resource secret to decrypt
   * @param {string} resourceId The resource identifier to decrypt the secret of.
   * @param {object} tabStorageEditedPassword
   * @return {Promise}
   */
  async _getSecret(resourceId) {
    let secret;
    try {
      secret = await Secret.findByResourceId(resourceId);
    } catch (error) {
      // Before v2.7.0, the secret entry point was not available.
      // Use the resource entry point to retrieve the secret.
      // @deprecated since v2.7.0 will be removed with v2.3.0
      const resource = await ResourceService.findOne(resourceId, { contain: { secret: 1 } });
      secret = resource.secrets[0];
    }

    return secret;
  }

  /**
   * Display progress.
   */
  async _showProgress() {
    // @todo the quickaccess worker should have a pagemod too
    // Display the progress dialog if the requester is not the quickaccess.
    if (this.worker.pageMod) {
      await progressDialogController.open(Worker.get('App', this.worker.tab.id), 'Decrypting...');
    } else {
      await reactProgressDialogController.open(this.worker, 'Decrypting...');
    }
  }

  /**
   * Hide progress.
   */
  _hideProgress() {
    // @todo the quickaccess worker should have a pagemod too
    // Hide the progress dialog if the requester is not the quickaccess.
    if (this.worker.pageMod) {
      progressDialogController.close(Worker.get('App', this.worker.tab.id));
    } else {
      reactProgressDialogController.close(this.worker);
    }
  }
}

exports.SecretDecryptController = SecretDecryptController;
