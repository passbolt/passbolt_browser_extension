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
 */
import User from "../model/user";
import MultiFactorAuthenticationModel from "../model/multiFactorAuthentication/multiFactorAuthenticationModel";


const listen = function(worker) {
  /*
   * Disable mfa for a user
   *
   * @listens passbolt.mfa.disable-for-user
   * @param {string} requestId The request identifier uuid
   * @param {string} userId The user uuid
   */
  worker.port.on('passbolt.mfa.disable-for-user', async(requestId, userId) => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const mfaModel = new MultiFactorAuthenticationModel(clientOptions);
      await mfaModel.disableForUser(userId);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const MultiFactorAuthenticationEvents = {listen};
