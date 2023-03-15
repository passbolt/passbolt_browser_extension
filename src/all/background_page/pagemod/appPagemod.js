/**
 * React application pagemod.
 *
 * @copyright (c) 2020 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import GpgAuth from "../model/gpgauth";
import {Worker} from "../model/worker";
import GetLegacyAccountService from "../service/account/getLegacyAccountService";
import {App as app} from "../app";
import PageMod from "../sdk/page-mod";
import AppInitController from "../controller/app/appInitController";
import ParseAppUrlService from "../service/app/parseAppUrlService";
import User from "../model/user";


/*
 * This pagemod help bootstrap the passbolt application from a passbolt server app page
 */
const App = function() {};
App._pageMod = null;

App.init = function() {
  if (App._pageMod) {
    App._pageMod.destroy();
    App._pageMod = null;
  }

  App._pageMod = new PageMod({
    name: 'App',
    include: 'about:blank?passbolt=passbolt-iframe-app',
    contentScriptWhen: 'end',
    contentScriptFile: [
      /*
       * Warning: script and styles need to be modified in
       * chrome/data/passbolt-iframe-app.html
       */
    ],
    onAttach: async function(worker) {
      const user = User.getInstance();
      if (!user.isValid()) {
        console.error('appPagemod::attach can not attach application if user is not configured.');
        return;
      }

      const auth = new GpgAuth();
      if (!await auth.isAuthenticated() || await auth.isMfaRequired()) {
        console.error('appPagemod::attach can not attach application if user is not logged in.');
        return;
      }

      if (!ParseAppUrlService.test(worker.tab.url)) {
        console.error('appPagemod::attach cannot connect to untrusted parent frame.');
        return;
      }

      // Init the application.
      const appInitController = new AppInitController();
      await appInitController.main();

      /*
       * Retrieve the account associated with this worker.
       * @todo This method comes to replace the User.getInstance().get().
       */
      let account;
      try {
        account = await GetLegacyAccountService.get({role: true});
      } catch (error) {
        /*
         * Ensure the application does not crash completely if the legacy account cannot be retrieved.
         * The following controllers won't work as expected:
         * - AccountRecoverySaveUserSettingsController
         * - ReviewRequestController
         */
        console.error('appPagemod::attach legacy account cannot be retrieved, please contact your administrator.');
        console.error(error);
      }

      // Initialize the events listeners.
      app.events.app.listen(worker, account);
      app.events.auth.listen(worker);
      app.events.config.listen(worker);
      app.events.folder.listen(worker);
      app.events.resource.listen(worker);
      app.events.resourceType.listen(worker);
      app.events.role.listen(worker);
      app.events.keyring.listen(worker);
      app.events.secret.listen(worker);
      app.events.pownedPassword.listen(worker);
      app.events.organizationSettings.listen(worker);
      app.events.share.listen(worker);
      app.events.subscription.listen(worker);
      app.events.user.listen(worker, account);
      app.events.group.listen(worker);
      app.events.comment.listen(worker);
      app.events.tag.listen(worker);
      app.events.favorite.listen(worker);
      app.events.importResources.listen(worker);
      app.events.exportResources.listen(worker);
      app.events.actionLogs.listen(worker);
      app.events.multiFactorAuthentication.listen(worker);
      app.events.theme.listen(worker);
      app.events.locale.listen(worker);
      app.events.passwordGenerator.listen(worker);
      app.events.mobile.listen(worker);
      app.events.clipboard.listen(worker);
      app.events.mfaPolicy.listen(worker);

      Worker.add('App', worker);
    }
  });
};

export const AppPagemod = App;
