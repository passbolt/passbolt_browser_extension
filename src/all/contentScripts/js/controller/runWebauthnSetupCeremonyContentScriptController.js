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
import { assertType } from "../../../background_page/utils/assertions";
import WebauthnSetupCeremonyContentScriptService from "../service/webauthnSetupCeremonyContentScriptService";
import WebauthnCredentialCreationOptionsEntity from "../../../background_page/model/entity/mfa/webauthnCredentialCreationOptionsEntity";

const RESULT_EVENT = "passbolt.app-bootstrap.webauthn-ceremony-result";

/**
 * Runs navigator.credentials.create() on the relying party origin on behalf of the background page.
 */
export default class RunWebauthnSetupCeremonyContentScriptController {
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
      const result = await this.exec(contentScriptControllerArguments);
      this.worker.port.emit(RESULT_EVENT, { success: true, result: result });
    } catch (error) {
      console.error(error);
      this.worker.port.emit(RESULT_EVENT, { success: false, result: error });
    }
  }

  /**
   * Store the credential or drop the record and notify the App worker of the tab.
   * @param {object} contentScriptControllerArguments the arguments to run this content script Controller
   * @param {string} contentScriptControllerArguments.id the id of the ceremony to run
   * @param {object} contentScriptControllerArguments.options the configuration of the ceremony
   * @returns {Promise<void>}
   */
  async exec(contentScriptControllerArguments) {
    const { id, options } = contentScriptControllerArguments;

    if (!Validator.isUUID(id)) {
      throw new Error("The given parameter is not a valid UUID");
    }
    assertType(options, Object);

    const webauthnCredentialCreationOptionsEntity = new WebauthnCredentialCreationOptionsEntity(options);
    return await WebauthnSetupCeremonyContentScriptService.run(id, webauthnCredentialCreationOptionsEntity);
  }
}
