/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.0.0
 */
const __ = require('../sdk/l10n').get;
const Worker = require('../model/worker');
const {UserNotFoundError} = require("../error/UserNotFoundError");

const {GpgAuth} = require('../model/gpgauth');
const {Crypto} = require('../model/crypto');
const {Keyring} = require('../model/keyring');
const {KeyIsExpiredError} = require('../error/keyIsExpiredError');
const {ServerKeyChangedError} = require('../error/serverKeyChangedError');

class AuthController {
   /**
   * AuthController Constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   */
  constructor(worker, requestId) {
    this.worker = worker;
    this.requestId = requestId;
    this.keyring = new Keyring();
    this.crypto = new Crypto(this.keyring);
    this.auth = new GpgAuth(this.keyring);
  }

  /**
   * Perform a GPGAuth verify
   *
   * @returns {Promise<void>}
   */
  async verify() {
    let msg;
    try {
      await this.auth.verify();
      msg = __('The server key is verified. The server can use it to sign and decrypt content.');
      this.worker.port.emit(this.requestId, 'SUCCESS', msg);
    } catch (error) {
      if (error.message.indexOf('no user associated') !== -1) {
        error = new UserNotFoundError(__('There is no user associated with this key.'));
      } else if (await this.auth.serverKeyChanged()) {
        error = new ServerKeyChangedError(__('The server key has changed.'));
      } else if (await this.auth.isServerKeyExpired()) {
        error = new KeyIsExpiredError(__('The server key is expired.'));
      }

      error.message = `${__('Could not verify server key.')} ${error.message}`;
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }
}

exports.AuthController = AuthController;