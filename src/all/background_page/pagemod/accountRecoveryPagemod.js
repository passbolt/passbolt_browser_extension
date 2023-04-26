/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import Pagemod from "./pagemod";
import BuildApiClientOptionsService
  from "../service/account/buildApiClientOptionsService";
import {AccountRecoveryEvents} from "../event/accountRecoveryEvents";
import GetRequestLocalAccountService
  from "../service/accountRecovery/getRequestLocalAccountService";

class AccountRecovery extends Pagemod {
  /**
   * @inheritDoc
   * @returns {string}
   */
  get appName() {
    return "AccountRecovery";
  }

  /**
   * Get events
   * @returns {[]}
   */
  get events() {
    return [AccountRecoveryEvents];
  }

  /**
   * Attach events
   * @param port the port
   */
  async attachEvents(port) {
    try {
      const tab = port._port.sender.tab;
      const account = await GetRequestLocalAccountService.getAccountMatchingContinueUrl(tab.url);
      const apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
      for (const event of this.events) {
        event.listen({port, tab}, apiClientOptions, account);
      }
    } catch (error) {
      /*
       * This is an unexpected error, the iframe shouldn't have been injected in the page by the bootstrap if no
       * account was found in the local storage or if the url could not be parsed @see accountRecoveryBootstrapPagemod.
       */
      console.error(error);
      port.disconnect();
    }
  }
}

export default new AccountRecovery();
