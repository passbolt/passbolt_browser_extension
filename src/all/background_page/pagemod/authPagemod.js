/**
 * Passbolt Auth Form pagemod.
 *
 * This pagemod help with the authentication
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {PageMod} = require('../sdk/page-mod');
const app = require('../app');
const Worker = require('../model/worker');
const {GetLegacyAccountService} = require("../service/account/getLegacyAccountService");

const Auth = function() {};
Auth._pageMod = undefined;

Auth.init = function() {
  if (typeof Auth._pageMod !== 'undefined') {
    Auth._pageMod.destroy();
    Auth._pageMod = undefined;
  }
  Auth._pageMod = new PageMod({
    name: 'Auth',
    include: 'about:blank?passbolt=passbolt-iframe-login',
    contentScriptWhen: 'ready',
    contentScriptFile: [
      /*
       * Warning: script and styles need to be modified in
       * chrome/data/passbolt-iframe-login-form.html
       */
    ],
    onAttach: async function(worker) {
      Worker.add('Auth', worker);

      /*
       * Retrieve the account associated with this worker.
       * @todo This method comes to replace the User.getInstance().get()
       */
      let account;
      try {
        account = await GetLegacyAccountService.get();
      } catch (error) {
        /*
         * Ensure the application does not crash completely if the legacy account cannot be retrieved.
         * The following controllers won't work as expected:
         * - RequestHelpCredentialsLostController
         */
        console.error('authPagemod::attach legacy account cannot be retrieved, please contact your administrator.');
        console.error(error);
      }

      app.events.user.listen(worker);
      app.events.keyring.listen(worker);
      app.events.auth.listen(worker, account);
      app.events.config.listen(worker);
      app.events.organizationSettings.listen(worker);
      app.events.locale.listen(worker);

      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);
    }
  });
};
exports.Auth = Auth;
