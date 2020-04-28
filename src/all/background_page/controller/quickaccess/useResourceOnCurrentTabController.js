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
const browser = require("webextension-polyfill/dist/browser-polyfill");
const Crypto = require('../../model/crypto').Crypto;
const passphraseController = require('../passphrase/passphraseController');
const {ResourceService} = require('../../service/resource');
const {Secret} = require('../../model/secret').Secret;
const Worker = require('../../model/worker');

/**
 * UserResourceOnCurrentTabController
 */
class UseResourceOnCurrentTabController {

  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
  }

  /**
   * Execute the controller
   * @param {array} resourceId The resource identifier to decrypt the secret of.
   * @param {tab} browser's current active tab
   * @return {Promise}
   */
  async main(resourceId, tab) {
    const crypto = new Crypto();
    const { resources } = await browser.storage.local.get("resources");
    const resource = resources.find(resource => resource.id == resourceId);

    try {
      const secretPromise = this._getSecret(resourceId);
      const masterPassword = await passphraseController.get(this.worker);
      const secret = await secretPromise;
      const message = await crypto.decrypt(secret.data, masterPassword);
      // Return username as an empty string, when `resource.name` is null
      const username = resource.username || '';
      // Current active tab's url is passing to quickaccess to check the same origin request
      await Worker.get('Bootstrap', tab.id).port.request('passbolt.quickaccess.fill-form', username, message, tab.url);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      this.worker.port.emit(this.requestId, 'ERROR', this.worker.port.getEmitableError(error));
    }
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

}

exports.UseResourceOnCurrentTabController = UseResourceOnCurrentTabController;
