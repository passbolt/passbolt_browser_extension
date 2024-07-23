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
import i18n from "../../sdk/i18n";
import KeyIsExpiredError from "../../error/keyIsExpiredError";
import ServerKeyChangedError from "../../error/serverKeyChangedError";
import WorkerService from "../../service/worker/workerService";
import CompareGpgKeyService from "../../service/crypto/compareGpgKeyService";
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";
import AuthVerifyServerChallengeService from "../../service/auth/authVerifyServerChallengeService";
import AuthVerifyServerKeyService from "../../service/api/auth/authVerifyServerKeyService";

class AuthVerifyServerKeyController {
  /**
   * AuthVerifyServerKeyController Constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.authVerifyServerChallengeService = new AuthVerifyServerChallengeService(apiClientOptions);
    this.authVerifyServerKeyService = new AuthVerifyServerKeyService(apiClientOptions);
    this.account = account;
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
   * Perform a GPGAuth to verify the server identity
   *
   * @returns {Promise<void>}
   */
  async exec() {
    try {
      await this.authVerifyServerChallengeService.verifyAndValidateServerChallenge(this.account.userKeyFingerprint, this.account.serverPublicArmoredKey);
    } catch (error) {
      await this.onVerifyError(error);
    }
  }

  /**
   * Whenever the verify fail
   * @param {Error} error The error
   * @returns {Promise<void>}
   * @throws {ServerKeyChangedError} If the key cannot be parsed
   * @throws {ServerKeyChangedError} If the server key has changed
   * @throws {serverKeyIsExpired} If the server key has expired
   * @throws {Error} If an unexpected error occurred
   */
  async onVerifyError(error) {
    if (error.data?.code === 500) {
      /*
       * If something wrong happens on the server, we do an early exit.
       * The other errors (no user associated, server key changed etc ) don't produce an error 500.
       */
      throw error;
    }

    if (error.message && error.message.indexOf('no user associated') !== -1) {
      /*
       * If the user has been deleted from the API, remove the authentication iframe served by the
       * browser extension, and let the user continue its journey through the triage app served by the API.
       */
      (await WorkerService.get('AuthBootstrap', this.worker.tab.id)).port.emit('passbolt.auth-bootstrap.remove-iframe');
    } else {
      try {
        if (!await this.canParseServerKey()) {
          // @deprecated with v3.6.0. Fix an issue users encounter while using an armored server key with multiple keys https://github.com/passbolt/passbolt_browser_extension/issues/150
          error = new ServerKeyChangedError(i18n.t('The server key cannot be parsed.'));
        } else if (await this.serverKeyChanged()) {
          error = new ServerKeyChangedError(i18n.t('The server key has changed.'));
        } else if (await this.serverKeyIsExpired()) {
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
   * @returns {Promise<boolean>}
   */
  async canParseServerKey() {
    try {
      await OpenpgpAssertion.readKeyOrFail(this.account.serverPublicArmoredKey);
    } catch (error) {
      return false;
    }
    return true;
  }

  /**
   * Check if the server key has changed
   * @return {Promise<boolean>} true if key has changed
   */
  async serverKeyChanged() {
    const remoteServerArmoredKey = (await this.authVerifyServerKeyService.getServerKey()).armored_key;
    const remoteServerKey = await OpenpgpAssertion.readKeyOrFail(remoteServerArmoredKey);
    const serverLocalKey = await OpenpgpAssertion.readKeyOrFail(this.account.serverPublicArmoredKey);
    return !await CompareGpgKeyService.areKeysTheSame(remoteServerKey, serverLocalKey);
  }

  /**
   * Check if the server key is expired
   * @return {Promise<boolean>} true if key has expired
   */
  async serverKeyIsExpired() {
    const publicServerKey = await OpenpgpAssertion.readKeyOrFail(this.account.serverPublicArmoredKey);
    const serverKey = await GetGpgKeyInfoService.getKeyInfo(publicServerKey);
    return serverKey.isExpired;
  }
}

export default AuthVerifyServerKeyController;
