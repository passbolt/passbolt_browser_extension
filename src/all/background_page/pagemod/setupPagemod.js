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
import BuildAccountSetupService from "../service/setup/buildAccountSetupService";
import BuildAccountApiClientOptionsService from "../service/account/buildApiClientOptionsService";

/*
 * This pagemod help bootstrap the first step of the setup process from a passbolt server app page
 * The pattern for this url, driving the setup bootstrap, is defined in config.json
 */
const Setup = function() {};
Setup._pageMod = undefined;

Setup.init = function() {
  if (typeof Setup._pageMod !== 'undefined') {
    Setup._pageMod.destroy();
    Setup._pageMod = undefined;
  }

  Setup._pageMod = new PageMod({
    name: 'Setup',
    include: 'about:blank?passbolt=passbolt-iframe-setup',
    contentScriptWhen: 'ready',
    contentScriptFile: [
      /*
       * Warning: script and styles need to be modified in
       * chrome/data/passbolt-iframe-setup.html
       */
    ],
    onAttach: async function(worker) {
      let account, apiClientOptions;
      try {
        account = BuildAccountSetupService.buildFromSetupUrl(worker.tab.url);
        apiClientOptions = await BuildAccountApiClientOptionsService.build(account);
      } catch (error) {
        // Unexpected error, this pagemod shouldn't have been initialized as the bootstrapSetupPagemod should have raised an exception and not inject this iframe.
        console.error(error);
        return;
      }

      // @todo account-recovery-refactoring check to remove all the listener, they expose confidential services.
      app.events.config.listen(worker);
      app.events.setup.listen(worker, apiClientOptions, account);

      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);
    }
  });
};

export default Setup;
