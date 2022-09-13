/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.3.0
 */
import User from "../model/user";
import PasswordGeneratorModel from "../model/passwordGenerator/passwordGeneratorModel";


const listen = function(worker) {
  /*
   * Get the password generator settings from the local storage.
   *
   * @listens passbolt.password-generator.settings
   */
  worker.port.on('passbolt.password-generator.settings', async requestId => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const passwordGeneratorModel = new PasswordGeneratorModel(apiClientOptions);
      const passwordGenerator = await passwordGeneratorModel.getOrFindAll();
      worker.port.emit(requestId, 'SUCCESS', passwordGenerator);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const PasswordGeneratorEvents = {listen};
