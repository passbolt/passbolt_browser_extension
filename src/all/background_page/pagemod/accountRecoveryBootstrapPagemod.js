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
import {Worker} from "../model/worker";
import PageMod from "../sdk/page-mod";
import GetRequestLocalAccountService from "../service/accountRecovery/getRequestLocalAccountService";
import {PortEvents} from "../event/portEvents";


const AccountRecoveryBootstrap = function() {};
AccountRecoveryBootstrap._pageMod = undefined;

AccountRecoveryBootstrap.init = function() {
  if (typeof AccountRecoveryBootstrap._pageMod !== 'undefined') {
    AccountRecoveryBootstrap._pageMod.destroy();
    AccountRecoveryBootstrap._pageMod = undefined;
  }

  const uuidRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[0-5][a-fA-F0-9]{3}-[089aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}";
  const accountRecoveryBootstrapRegex = `(.*)\/account-recovery\/continue\/(${uuidRegex})\/(${uuidRegex})`;

  AccountRecoveryBootstrap._pageMod = new PageMod({
    name: 'AccountRecoveryBootstrap',
    include: new RegExp(accountRecoveryBootstrapRegex),
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
      'contentScripts/js/dist/vendors.js',
      'contentScripts/js/dist/account-recovery.js',
    ],
    onAttach: async function(worker) {
      try {
        await GetRequestLocalAccountService.getAccountMatchingContinueUrl(worker.tab.url);
        PortEvents.listen(worker);
      } catch (error) {
        console.error(error);
        worker.port.disconnect();
        return;
      }

      Worker.add('AccountRecoveryBootstrap', worker);
    }
  });
};

export default AccountRecoveryBootstrap;
