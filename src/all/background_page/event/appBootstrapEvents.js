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
import MfaSetupHandleWebauthnCeremonyResultController from "../controller/mfaSetup/MfaSetupHandleWebauthnCeremonyResultController";

/**
 * Listens the app bootstrap content script events
 * @param {Worker} worker
 */
const listen = function (worker) {
  /*
   * Whenever the content script has finished a WebAuthn setup ceremony
   * @listens passbolt.app-bootstrap.webauthn-ceremony-result
   * @param resultDto {object} The ceremony result
   */
  worker.port.on("passbolt.app-bootstrap.webauthn-ceremony-result", async (resultDto) => {
    const controller = new MfaSetupHandleWebauthnCeremonyResultController(worker);
    await controller._exec(resultDto);
  });
};

export const AppBootstrapEvents = { listen };
