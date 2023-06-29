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
 * @since         4.2.0
 */

import GetLastRememberMeChoiceController from "../controller/rememberMe/getLastRememberMeChoiceController";

const listen = function(worker, _, account) {
  /*
   * Get the last rememberMe choice made by the user
   *
   * @listens passbolt.remember-me.get
   */
  worker.port.on('passbolt.remember-me.get', async requestId => {
    const controller = new GetLastRememberMeChoiceController(worker, requestId, account);
    await controller._exec();
  });
};

export const RememberMeEvents = {listen};
