/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import GeneratePortIdController from "../controller/port/generatePortIdController";


const listen = function(worker) {
  /*
   * Generate a port id for the sign-in application.
   *
   * @listens passbolt.port.generate-id
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.port.generate-id', async(requestId, applicationName) => {
    const controller = new GeneratePortIdController(worker, requestId);
    await controller._exec(applicationName);
  });
};

export const PortEvents = {listen};
