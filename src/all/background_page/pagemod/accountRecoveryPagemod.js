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
 * @since         3.6.0
 */

import PageMod from "../sdk/page-mod";
import {App as app} from "../app";
import GetRequestLocalAccountService from "../service/accountRecovery/getRequestLocalAccountService";
import BuildApiClientOptionsService from "../service/account/buildApiClientOptionsService";

/*
 * This pagemod handles the account recovery process served into an iframe controlled by the browser extension.
 */
const AccountRecovery = function() {};
AccountRecovery._pageMod = undefined;

AccountRecovery.init = function() {
  if (typeof AccountRecovery._pageMod !== 'undefined') {
    AccountRecovery._pageMod.destroy();
    AccountRecovery._pageMod = undefined;
  }

  AccountRecovery._pageMod = new PageMod({
    name: 'AccountRecovery',
    include: 'about:blank?passbolt=passbolt-iframe-accountrecovery',
    contentScriptWhen: 'ready',
    contentScriptFile: [
      /*
       * Warning: script and styles need to be modified in
       * chrome/data/passbolt-iframe-account-recovery.html
       */
    ],
    onAttach: async function(worker) {
      let account;
      try {
        account = await GetRequestLocalAccountService.getAccountMatchingContinueUrl(worker.tab.url);
      } catch (error) {
        /*
         * This is an unexpected error, the iframe shouldn't have been injected in the page by the bootstrap if no
         * account was found in the local storage or if the url could not be parsed @see accountRecoveryBootstrapPagemod.
         */
        console.error(error);
        worker.port.disconnect();
        return;
      }

      const apiClientOptions = await BuildApiClientOptionsService.buildFromAccount(account);
      app.events.accountRecovery.listen(worker, apiClientOptions, account);
    }
  });
};

export default AccountRecovery;
