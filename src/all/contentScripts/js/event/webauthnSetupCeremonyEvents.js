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
import RunWebauthnSetupCeremonyContentScriptController from "../controller/runWebauthnSetupCeremonyContentScriptController";
import AbortWebauthnSetupCeremonyContentScriptController from "../controller/abortWebauthnSetupCeremonyContentScriptController";

/**
 * Listens the WebAuthn setup ceremony events sent by the background page
 * @param {Port} port
 */
const listen = function (port) {
  port.on("passbolt.app-bootstrap.run-webauthn-ceremony", async (dto) => {
    const controller = new RunWebauthnSetupCeremonyContentScriptController({ port });
    await controller._exec(dto);
  });

  port.on("passbolt.app-bootstrap.abort-webauthn-ceremony", async (dto) => {
    const controller = new AbortWebauthnSetupCeremonyContentScriptController({ port });
    await controller._exec(dto);
  });
};

export const WebauthnSetupCeremonyEvents = { listen };
