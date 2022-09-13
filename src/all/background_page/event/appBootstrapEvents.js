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
import AuthModel from "../model/auth/authModel";

const listen = function(worker) {
  /*
   * Navigate to logout
   *
   * @listens passbolt.app-boostrap.navigate-to-logout
   * @deprecated will be removed with v4. Helps to support legacy appjs logout.
   */
  worker.port.on('passbolt.app-boostrap.navigate-to-logout', async() => {
    const user = User.getInstance();
    const apiClientOptions = await user.getApiClientOptions();
    const auth = new AuthModel(apiClientOptions);
    const url = `${user.settings.getDomain()}/auth/logout`;

    try {
      await chrome.tabs.update(worker.tab.id, {url: url});
      await auth.postLogout();
    } catch (error) {
      console.error(error);
    }
  });
};
export const AppBootstrapEvents = {listen};
