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
import {App as app} from "../app";
import PageMod from "../sdk/page-mod";

const AppBoostrapPagemod = function() {
};
AppBoostrapPagemod._pageMod = null;

AppBoostrapPagemod.exists = function() {
  return AppBoostrapPagemod._pageMod !== null;
};

AppBoostrapPagemod.destroy = function() {
  if (AppBoostrapPagemod.exists()) {
    AppBoostrapPagemod._pageMod.destroy();
    AppBoostrapPagemod._pageMod = null;
  }
};

AppBoostrapPagemod.initPageMod = function() {
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
  const user = User.getInstance();
  const escapedDomain = user.settings.getDomain().replace(/\W/g, "\\$&");
  const url = `^${escapedDomain}/?(/app.*)?(#.*)?$`;
  const regex = new RegExp(url);

  return new PageMod({
    name: 'AppBoostrap',
    include: regex,
    contentScriptWhen: 'ready',
    contentStyleFile: [
      /*
       * @deprecated when support for v2 is dropped
       * used to control iframe styling without inline style in v3
       */
      'webAccessibleResources/css/themes/default/ext_external.min.css'
    ],
    contentScriptFile: [
      'contentScripts/js/dist/vendors.js',
      'contentScripts/js/dist/app.js',
    ],
    attachTo: {existing: true, reload: true},
    onAttach: async function(worker) {
      const auth = new GpgAuth();
      if (!await auth.isAuthenticated() || await auth.isMfaRequired()) {
        console.error('Can not attach application if user is not logged in.');
        return;
      }

      app.events.appBootstrap.listen(worker);

      // Keep the pagemod event listeners at the end of the list.
      app.events.pagemod.listen(worker);

      Worker.add('AppBootstrap', worker);
    }
  });
};

AppBoostrapPagemod.init = function() {
  return new Promise(resolve => {
    /*
     * According to the user status :
     * * the pagemod should be initialized if the user is valid and logged in;
     * * the pagemod should be destroyed otherwise;
     */
    const user = User.getInstance();
    if (user.isValid()) {
      AppBoostrapPagemod.destroy();
      AppBoostrapPagemod._pageMod = AppBoostrapPagemod.initPageMod();
      resolve();
    }
  });
};

export default AppBoostrapPagemod;
