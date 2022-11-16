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
 * @since         3.7.0
 */
import {Worker} from "../model/worker";
import GetLegacyAccountService from "../service/account/getLegacyAccountService";
import {App as app} from "../app";
import PageMod from "../sdk/page-mod";
import ParsePublicWebsiteUrlService from "../service/publicWebsite/parsePublicWebsiteUrlService";

const PublicWebsiteSignIn = function() {};
PublicWebsiteSignIn._pageMod = undefined;

PublicWebsiteSignIn.init = function() {
  if (typeof PublicWebsiteSignIn._pageMod !== 'undefined') {
    PublicWebsiteSignIn._pageMod.destroy();
    PublicWebsiteSignIn._pageMod = undefined;
  }

  PublicWebsiteSignIn._pageMod = new PageMod({
    name: 'PublicWebsiteSignIn',
    include: ParsePublicWebsiteUrlService.regex,
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
      'contentScripts/js/dist/public-website-sign-in/public-website-sign-in.js'
    ],
    attachTo: {existing: true, reload: false},
    onAttach: async function(worker) {
      Worker.add('PublicWebsiteSignIn', worker);

      /*
       * Retrieve the account associated with this worker.
       * @todo This method comes to replace the User.getInstance().get().
       */
      let account;
      try {
        account = await GetLegacyAccountService.get();
      } catch (error) {
        console.error('PublicWebsiteSignIn::attach legacy account cannot be retrieved, please contact your administrator.');
        console.error(error);
        return;
      }

      app.events.publicWebsiteSignIn.listen(worker, account);
    }
  });
};

export default PublicWebsiteSignIn;
