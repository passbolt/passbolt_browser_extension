/**
 * Passbolt App pagemod.
 *
 * This pagemod drives the main addon app
 * It is inserted in all the pages of a domain that is trusted.
 * Such trust is defined during the first step of the setup process.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import GpgAuth from "../model/gpgauth";
import User from "../model/user";
import {Worker} from "../model/worker";
import PageMod from "../sdk/page-mod";
import ParseAppUrlService from "../service/app/parseAppUrlService";
import {AppBootstrapEvents} from "../event/appBootstrapEvents";

const AppBootstrapPagemod = function() {};
AppBootstrapPagemod._pageMod = null;

AppBootstrapPagemod.exists = function() {
  return AppBootstrapPagemod._pageMod !== null;
};

AppBootstrapPagemod.destroy = function() {
  if (AppBootstrapPagemod.exists()) {
    AppBootstrapPagemod._pageMod.destroy();
    AppBootstrapPagemod._pageMod = null;
  }
};

AppBootstrapPagemod.initPageMod = function() {
  /*
   * Attach on passbolt application pages.
   * By instance if your application domain is : https://demo.passbolt.com
   * The pagemod will be attached to the following pages :
   * ✓ https://demo.passbolt.com
   * ✓ https://demo.passbolt.com/
   * ✓ https://demo.passbolt.com/#user
   * ✓ https://demo.passbolt.com/#workspace
   * ✗ https://demoxpassbolt.com
   * ✗ https://demo.passbolt.com.attacker.com
   * ✗ https://demo.passbolt.com/auth/login
   */

  return new PageMod({
    name: "AppBootstrap",
    include: new RegExp(ParseAppUrlService.getRegex()),
    contentScriptWhen: "ready",
    contentStyleFile: [
      /*
       * @deprecated when support for v2 is dropped
       * used to control iframe styling without inline style in v3
       */
      "webAccessibleResources/css/themes/default/ext_external.min.css"
    ],
    contentScriptFile: [
      "contentScripts/js/dist/vendors.js",
      "contentScripts/js/dist/app.js",
    ],
    attachTo: {existing: true, reload: true},
    onAttach: async function(worker) {
      const auth = new GpgAuth();
      if (!(await auth.isAuthenticated()) || (await auth.isMfaRequired())) {
        console.error("Can not attach application if user is not logged in.");
        return;
      }

      AppBootstrapEvents.listen(worker);

      Worker.add("AppBootstrap", worker);
    },
  });
};

AppBootstrapPagemod.init = function() {
  return new Promise(resolve => {
    /*
     * According to the user status :
     * * the pagemod should be initialized if the user is valid and logged in;
     * * the pagemod should be destroyed otherwise;
     */
    const user = User.getInstance();
    if (user.isValid()) {
      AppBootstrapPagemod.destroy();
      AppBootstrapPagemod._pageMod = AppBootstrapPagemod.initPageMod();
      resolve();
    }
  });
};

export default AppBootstrapPagemod;
