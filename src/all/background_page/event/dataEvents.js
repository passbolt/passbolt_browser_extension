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
 * @since         4.6.0
 */

import GetPassboltDataConfigController from "../controller/dataConfig/getPassboltDataConfigController";


const listen = function(worker) {
  /*
   * Get legacy _passboltData account configuration.
   *
   * @listens passbolt.passbolt-data.get-config
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.passbolt-data.get-config', async requestId => {
    const controller = new GetPassboltDataConfigController(worker, requestId);
    await controller._exec();
  });
};
export const DataEvents = {listen};
