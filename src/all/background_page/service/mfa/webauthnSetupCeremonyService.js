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
 * @since         5.17.0
 */
import { v4 as uuidv4 } from "uuid";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import WebauthnApiService from "../api/mfa/webauthnApiService";
import WebauthnSetupCeremonySessionStorageService from "../sessionStorage/webauthnSetupCeremonySessionStorageService";
import WebauthnCredentialCreationOptionsEntity from "../../model/entity/mfa/webauthnCredentialCreationOptionsEntity";
import WebauthnRegistrationResponseEntity from "../../model/entity/mfa/webauthnRegistrationResponseEntity";
import WebauthnSetupCeremonyEntity from "../../model/entity/mfa/webauthnSetupCeremonyEntity";
import ValidateWebauthnCreationOptionsService from "./validateWebauthnCreationOptionsService";
import WorkerService from "../worker/workerService";
import WebauthnCeremonyNotFoundError from "../../error/webauthnCeremonyNotFoundError";
import WebauthnCeremonyAbortedError from "../../error/webauthnCeremonyAbortedError";

const APP_BOOTSTRAP_WORKER = "AppBootstrap";
const APP_WORKER = "App";

export const RUN_CEREMONY_EVENT = "passbolt.app-bootstrap.run-webauthn-ceremony";
export const ABORT_CEREMONY_EVENT = "passbolt.app-bootstrap.abort-webauthn-ceremony";
export const CEREMONY_DONE_EVENT = "passbolt.mfa-setup.webauthn-ceremony-done";

/**
 * Runs the restartable WebAuthn setup ceremony: begin and finish against the API, create() delegated to the
 * AppBootstrap content script, state kept in session storage so a service worker restart does not lose it.
 * A single ceremony is pending at a time; beginning a new one aborts the previous one.
 */
class WebauthnSetupCeremonyService {
  /**
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account
   */
  constructor(apiClientOptions, account) {
    this.account = account;
    this.webauthnApiService = new WebauthnApiService(apiClientOptions);
  }

  /**
   * Begin a ceremony for a tab and hand the creation options to its content script.
   * An unexpired ceremony pending on any tab is aborted and replaced.
   * @param {number} tabId
   * @throws {EntityValidationError} if the creation options are malformed
   * @throws {WebauthnCeremonyError} if the creation options do not match the account
   * @returns {Promise<void>}
   */
  async begin(tabId) {
    const response = await this.webauthnApiService.begin();
    const { handle, credentialCreationOptions } = response.body;
    const options = new WebauthnCredentialCreationOptionsEntity(credentialCreationOptions);
    ValidateWebauthnCreationOptionsService.validate(options, this.account);
    const worker = await WorkerService.get(APP_BOOTSTRAP_WORKER, tabId);
    const ceremony = new WebauthnSetupCeremonyEntity({
      id: uuidv4(),
      tab_id: tabId,
      handle: handle,
      started_at: new Date().toISOString(),
    });
    const previous = await WebauthnSetupCeremonySessionStorageService.get();
    if (previous && !previous.isExpired) {
      await this.emitAbort(previous);
      if (previous.tabId !== tabId) {
        await this.emitSuperseded(previous);
      }
    }
    await WebauthnSetupCeremonySessionStorageService.set(ceremony);
    try {
      worker.port.emit(RUN_CEREMONY_EVENT, { id: ceremony.id, options: options.toDto() });
    } catch (error) {
      await WebauthnSetupCeremonySessionStorageService.flush();
      throw error;
    }
  }

  /**
   * Handle the ceremony result sent by the content script and forward the outcome to the App worker.
   * A result for an expired ceremony is reported to the App worker as an error.
   * @param {number} tabId the tab the result came from
   * @param {object} resultDto
   * @param {boolean} resultDto.success true if the webauthn ceremony succeeded, false otherwise
   * @param {{id: string, credential: object, aaguid: string|null}|{name: string, message: string}} [resultDto.result] the ceremony result details
   * @throws {WebauthnCeremonyNotFoundError} if no ceremony is pending or the result does not match it (id or tab)
   * @returns {Promise<void>}
   */
  async handleResult(tabId, resultDto) {
    const ceremony = await WebauthnSetupCeremonySessionStorageService.get();
    if (!ceremony) {
      throw new WebauthnCeremonyNotFoundError();
    }

    const { success, result: webauthnCeremonyResult, result: webauthnCeremonyError } = resultDto;
    if (ceremony.tabId !== tabId || (success && ceremony.id !== webauthnCeremonyResult.id)) {
      throw new WebauthnCeremonyNotFoundError("The result does not match the pending passkey ceremony.");
    }

    if (ceremony.isExpired) {
      const error = new WebauthnCeremonyNotFoundError("The pending passkey ceremony has expired.");
      await this._emitCeremonyDoneResponse(tabId, error);
      return;
    }

    if (!success) {
      await this._emitCeremonyDoneResponse(tabId, webauthnCeremonyError);
      return;
    }

    const credential = new WebauthnRegistrationResponseEntity(webauthnCeremonyResult.credential);
    const completed = new WebauthnSetupCeremonyEntity({
      ...ceremony.toDto(),
      credential: credential.toDto(),
      aaguid: webauthnCeremonyResult.aaguid ?? null,
    });
    await WebauthnSetupCeremonySessionStorageService.set(completed);
    await this._emitCeremonyDoneResponse(tabId, { aaguid: completed.aaguid }, true);
  }

  /**
   * Sends a `webauthn ceremony done` response back to the content script
   * @param {number} tabId the tab id where to find the worker to answer to
   * @param {object|error} result the data to send to the worker
   * @param {boolean} success should the content script treat the response as a success or not
   * @returns {Promise<void>}
   */
  async _emitCeremonyDoneResponse(tabId, result, success = false) {
    if (!success) {
      await WebauthnSetupCeremonySessionStorageService.flush();
    }

    const appWorker = await WorkerService.get(APP_WORKER, tabId);
    const responseDto = { success, result };
    await appWorker.port.emit(CEREMONY_DONE_EVENT, responseDto);
  }

  /**
   * Finish the ceremony with the stored credential. The record is kept on a name error so the finish can be
   * retried with another name; any other error ends the ceremony.
   * @param {number} tabId
   * @param {string} name the credential name chosen by the user
   * @throws {WebauthnCeremonyNotFoundError} if no ceremony with a credential is pending for the tab, or if the API
   *   rejected the handle as expired
   * @returns {Promise<{verified: string}>} the finish response body
   */
  async finish(tabId, name) {
    const ceremony = await this.getPendingCeremony();
    if (ceremony.tabId !== tabId || !ceremony.hasCredential) {
      throw new WebauthnCeremonyNotFoundError();
    }
    let response;
    try {
      response = await this.webauthnApiService.finish({
        handle: ceremony.handle,
        credential: ceremony.credential,
        name: name,
      });
    } catch (error) {
      if (this.isNameError(error)) {
        throw error;
      }
      await WebauthnSetupCeremonySessionStorageService.flush();
      if (this.isExpiredHandleError(error)) {
        throw new WebauthnCeremonyNotFoundError("The pending passkey ceremony has expired.");
      }
      throw error;
    }
    await WebauthnSetupCeremonySessionStorageService.flush();
    return response.body;
  }

  /**
   * Is the finish error a validation error on the credential name
   * @private
   * @param {Error} error
   * @returns {boolean}
   */
  isNameError(error) {
    return error instanceof PassboltApiFetchError && error.data?.code === 400 && Boolean(error.data.body?.name);
  }

  /**
   * Is the finish error the API rejecting the ceremony handle as expired
   * @private
   * @param {Error} error
   * @returns {boolean}
   */
  isExpiredHandleError(error) {
    return (
      error instanceof PassboltApiFetchError && error.data?.code === 400 && Boolean(error.data.body?.token?.expired)
    );
  }

  /**
   * Abort the ceremony pending on a tab: drop the record and close the prompt in the content script.
   * @param {number} tabId
   * @returns {Promise<void>}
   */
  async abort(tabId) {
    const ceremony = await WebauthnSetupCeremonySessionStorageService.get();
    if (ceremony?.tabId !== tabId) {
      return;
    }
    await WebauthnSetupCeremonySessionStorageService.flush();
    await this.emitAbort(ceremony);
  }

  /**
   * Tell the app worker of a superseded ceremony's tab that its ceremony ended, since handleResult drops the
   * abort result the content script reports for it; an unreachable worker is logged, not thrown.
   * @private
   * @param {WebauthnSetupCeremonyEntity} ceremony
   * @returns {Promise<void>}
   */
  async emitSuperseded(ceremony) {
    const error = new WebauthnCeremonyAbortedError("The passkey ceremony was superseded by a new one.");
    try {
      const appWorker = await WorkerService.get(APP_WORKER, ceremony.tabId);
      appWorker.port.emit(CEREMONY_DONE_EVENT, { success: false, result: error });
    } catch (error) {
      console.warn("WebauthnSetupCeremonyService: could not reach the app worker of the superseded ceremony.", error);
    }
  }

  /**
   * Tell the content script of the ceremony's tab to abort the ceremony; an unreachable content script is logged,
   * not thrown.
   * @private
   * @param {WebauthnSetupCeremonyEntity} ceremony
   * @returns {Promise<void>}
   */
  async emitAbort(ceremony) {
    try {
      const worker = await WorkerService.get(APP_BOOTSTRAP_WORKER, ceremony.tabId);
      worker.port.emit(ABORT_CEREMONY_EVENT, { id: ceremony.id });
    } catch (error) {
      console.warn("WebauthnSetupCeremonyService: could not reach the content script to abort the ceremony.", error);
    }
  }

  /**
   * Load the pending ceremony, removing an expired one.
   * @private
   * @throws {WebauthnCeremonyNotFoundError} if there is no unexpired ceremony
   * @returns {Promise<WebauthnSetupCeremonyEntity>}
   */
  async getPendingCeremony() {
    const ceremony = await WebauthnSetupCeremonySessionStorageService.get();
    if (!ceremony) {
      throw new WebauthnCeremonyNotFoundError();
    }
    if (ceremony.isExpired) {
      await WebauthnSetupCeremonySessionStorageService.flush();
      throw new WebauthnCeremonyNotFoundError("The pending passkey ceremony has expired.");
    }
    return ceremony;
  }
}

export default WebauthnSetupCeremonyService;
