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
const Uuid = require('../utils/uuid');
const Worker = require('../model/worker');
const {User} = require('../model/user');
const {AuthModel} = require("../model/auth/authModel");
const {Crypto} = require('../model/crypto');
const {Keyring} = require('../model/keyring');
const {KeyIsExpiredError} = require('../error/keyIsExpiredError');
const {ServerKeyChangedError} = require('../error/serverKeyChangedError');
const {PassboltApiFetchError} = require('../error/passboltApiFetchError');
const {GpgAuth} = require('../model/gpgauth');

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
    this.authLegacy = new GpgAuth(this.keyring);
  }

  /**
   * Perform a GPGAuth verify
   *
   * @returns {Promise<void>}
   */
  async verify() {
    const user = User.getInstance();
    const clientOptions = await user.getApiClientOptions({requireCsrfToken: false});
    const authModel = new AuthModel(clientOptions);
    const serverKey = this.keyring.findPublic(Uuid.get(user.settings.getDomain())).key;
    const userFingerprint = this.keyring.findPrivate().fingerprint;

    try {
      await authModel.verify(serverKey, userFingerprint);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      await this.onVerifyError(error)
    }
  }

  /**
   * Whenever the verify fail
   * @param {Error} error The error
   * @returns {Promise<void>}
   */
  async onVerifyError(error) {
    if (error.message && error.message.indexOf('no user associated') !== -1) {
      /*
       * If the user has been deleted from the API, remove the authentication iframe served by the
       * browser extension, and let the user continue its journey through the triage app served by the API.
       */
      Worker.get('AuthBootstrap', this.worker.tab.id).port.emit('passbolt.auth-bootstrap.remove-iframe');
    } else {
      try {
        if (await this.authLegacy.serverKeyChanged()) {
          error = new ServerKeyChangedError(__('The server key has changed.'));
        } else if (await this.authLegacy.isServerKeyExpired()) {
          error = new KeyIsExpiredError(__('The server key is expired.'));
        }
      } catch (e) {
        // Cannot ask for old server key, maybe server is misconfigured
        console.error(e);
        error = new Error(__('Server internal error. Check with your administrator.'));
      }
    }

    error.message = `${__('Could not verify the server key.')} ${error.message}`;
    this.worker.port.emit(this.requestId, 'ERROR', error);
  }
}

exports.AuthController = AuthController;