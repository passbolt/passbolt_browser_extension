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

import PageMod from "../sdk/page-mod";
import {App as app} from "../app";
import BuildAccountApiClientOptionsService from "../service/account/buildApiClientOptionsService";
import BuildAccountRecoverService from "../service/recover/buildAccountRecoverService";

/*
 * This pagemod help bootstrap the first step of the recover process from a passbolt server app page
 * The pattern for this url, driving the recover bootstrap, is defined in config.json
 */
const Recover = function() {};
Recover._pageMod = undefined;

Recover.init = function() {
  if (typeof Recover._pageMod !== 'undefined') {
    Recover._pageMod.destroy();
    Recover._pageMod = undefined;
  }

  Recover._pageMod = new PageMod({
    name: 'Setup',
    include: 'about:blank?passbolt=passbolt-iframe-recover',
    contentScriptWhen: 'ready',
    contentScriptFile: [
      /*
       * Warning: script and styles need to be modified in
       * chrome/data/passbolt-iframe-recover.html
       */
    ],
    onAttach: async function(worker) {
      let account, apiClientOptions;
      try {
        account = BuildAccountRecoverService.buildFromRecoverUrl(worker.tab.url);
        apiClientOptions = await BuildAccountApiClientOptionsService.build(account);
      } catch (error) {
        // Unexpected error, this pagemod shouldn't have been initialized as the bootstrapRecoverPagemod should have raised an exception and not inject this iframe.
        console.error(error);
        return;
      }

      // @todo account-recovery-refactoring check to remove all the listener, they expose confidential services.
      app.events.config.listen(worker);
      app.events.recover.listen(worker, apiClientOptions, account);
    }
  });
};

export default Recover;
