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
import Validator from "validator";
import WebauthnSetupCeremonyContentScriptService from "../service/webauthnSetupCeremonyContentScriptService";

const RESULT_EVENT = "passbolt.app-bootstrap.webauthn-ceremony-result";

/**
 * Runs navigator.credentials.abort() on the relying party origin on behalf of the background page.
 */
class AbortWebauthnSetupCeremonyContentScriptController {
  /**
   * @constructor
   */
  constructor(worker) {
    this.worker = worker;
  }

  /**
   * Controller executor.
   * @param {object} resultDto
   * @returns {Promise<void>}
   */
  async _exec(contentScriptControllerArguments) {
    try {
      await this.exec(contentScriptControllerArguments);
      this.worker.port.emit(RESULT_EVENT, { success: true });
    } catch (error) {
      console.error(error);
      this.worker.port.emit(RESULT_EVENT, { success: false, result: error });
    }
  }

  /**
   * Abort the Webauthn setup ceremony given its id.
   * @param {object} contentScriptControllerArguments the arguments to run this content script Controller
   * @param {string} contentScriptControllerArguments.id the id of the ceremony to run
   * @returns {Promise<void>}
   */
  async exec(contentScriptControllerArguments) {
    const { id } = contentScriptControllerArguments;

    if (!Validator.isUUID(id)) {
      throw new Error("The given parameter is not a valid UUID");
    }

    WebauthnSetupCeremonyContentScriptService.abort(id);
  }
}

export default AbortWebauthnSetupCeremonyContentScriptController;
