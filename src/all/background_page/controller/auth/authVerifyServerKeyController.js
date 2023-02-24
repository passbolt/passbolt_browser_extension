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
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import GpgAuth from "../../model/gpgauth";
import AuthModel from "../../model/auth/authModel";
import {Uuid} from "../../utils/uuid";
import i18n from "../../sdk/i18n";
import KeyIsExpiredError from "../../error/keyIsExpiredError";
import ServerKeyChangedError from "../../error/serverKeyChangedError";
import WorkerService from "../../service/worker/workerService";

class AuthVerifyServerKeyController {
  /**
   * AuthController Constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   * @param {string} userDomain
   */
  constructor(worker, requestId, apiClientOptions, userDomain) {
    this.worker = worker;
    this.requestId = requestId;
    this.apiClientOptions = apiClientOptions;
    this.userDomain = userDomain;
    this.keyring = new Keyring();
    this.authLegacy = new GpgAuth(this.keyring);
    this.authModel = new AuthModel(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec();
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Perform a GPGAuth verify
   *
   * @returns {Promise<void>}
   */
  async exec() {
    const serverKey = this.keyring.findPublic(Uuid.get(this.userDomain)).armoredKey;
    const userFingerprint = this.keyring.findPrivate().fingerprint;

    try {
      await this.authModel.verify(serverKey, userFingerprint);
    } catch (error) {
      await this.onVerifyError(error, serverKey);
    }
  }

  /**
   * Whenever the verify fail
   * @param {Error} error The error
   * @param {string} serverArmoredKey The server armored public key.
   * @returns {Promise<void>}
   */
  async onVerifyError(error, serverArmoredKey) {
    if (error.message && error.message.indexOf('no user associated') !== -1) {
      /*
       * If the user has been deleted from the API, remove the authentication iframe served by the
       * browser extension, and let the user continue its journey through the triage app served by the API.
       */
      (await WorkerService.get('AuthBootstrap', this.worker.tab.id)).port.emit('passbolt.auth-bootstrap.remove-iframe');
    } else {
      try {
        if (!await this.canParseServerKey(serverArmoredKey)) {
          // @deprecated with v3.6.0. Fix an issue users encounter while using an armored server key with multiple keys https://github.com/passbolt/passbolt_browser_extension/issues/150
          error = new ServerKeyChangedError(i18n.t('The server key cannot be parsed.'));
        } else if (await this.authLegacy.serverKeyChanged()) {
          error = new ServerKeyChangedError(i18n.t('The server key has changed.'));
        } else if (this.authLegacy.isServerKeyExpired()) {
          error = new KeyIsExpiredError(i18n.t('The server key is expired.'));
        }
      } catch (e) {
        // Cannot ask for old server key, maybe server is misconfigured
        error = new Error(i18n.t('Server internal error. Check with your administrator.'));
      }
    }

    error.message = `${i18n.t('Could not verify the server key.')} ${error.message}`;
    throw error;
  }

  /**
   * Can parse the server key
   * @param {string} serverArmoredKey The server armored public key.
   * @returns {Promise<boolean>}
   */
  async canParseServerKey(serverArmoredKey) {
    try {
      await OpenpgpAssertion.readKeyOrFail(serverArmoredKey);
    } catch (error) {
      return false;
    }
    return true;
  }
}

export default AuthVerifyServerKeyController;
