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
 * @since         5.8.0
 */

import GetAutofillSettingController from "../controller/autofillSetting/getAutofillSettingController";
import SetAutofillSettingController from "../controller/autofillSetting/setAutofillSettingController";

const listen = function(worker, _, account) {
  /*
   * Get the autofill settings
   *
   * @listens passbolt.autofill-setting.get
   */
  worker.port.on('passbolt.autofill-setting.get', async requestId => {
    const controller = new GetAutofillSettingController(worker, requestId, account);
    await controller._exec();
  });

  /*
   * Set the autofill settings
   *
   * @listens passbolt.autofill-setting.set
   */
  worker.port.on('passbolt.autofill-setting.set', async(requestId, autofillSettingDto) => {
    const controller = new SetAutofillSettingController(worker, requestId, account);
    await controller._exec(autofillSettingDto);
  });
};

export const AutofillSettingEvents = {listen};
