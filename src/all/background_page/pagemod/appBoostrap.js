/**
 * Passbolt App pagemod.
 *
 * This pagemod drives the main addon app
 * It is inserted in all the pages of a domain that is trusted.
 * Such trust is defined during the first step of the setup process (or in config-debug)
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {PageMod} = require('../sdk/page-mod');
const Worker = require('../model/worker');
const GpgAuth = require('../model/gpgauth').GpgAuth;
const User = require('../model/user').User;
const AppInitController = require("../controller/app/appInitController").AppInitController;

const AppBoostrap = function () {
};
AppBoostrap._pageMod = null;

AppBoostrap.exists = function () {
  return AppBoostrap._pageMod !== null;
};

AppBoostrap.destroy = function () {
  if (AppBoostrap.exists()) {
    AppBoostrap._pageMod.destroy();
    AppBoostrap._pageMod = null;
  }
};

AppBoostrap.initPageMod = function () {
  // Attach on passbolt application pages.
  // By instance if your application domain is : https://demo.passbolt.com
  // The pagemod will be attached to the following pages :
  // ✓ https://demo.passbolt.com
  // ✓ https://demo.passbolt.com/
  // ✓ https://demo.passbolt.com/#user
  // ✓ https://demo.passbolt.com/#workspace
  // ✗ https://demoxpassbolt.com
  // ✗ https://demo.passbolt.com.attacker.com
  // ✗ https://demo.passbolt.com/auth/login
  const user = User.getInstance();
  const escapedDomain = user.settings.getDomain().replace(/\W/g, "\\$&");
  const url = '^' + escapedDomain + '/?(/app.*)?(#.*)?$';
  const regex = new RegExp(url);

  return new PageMod({
    name: 'AppBoostrap',
    include: regex,
    contentScriptWhen: 'ready',
    contentStyleFile: [
      'data/css/themes/default/ext_external.min.css'
    ],
    contentScriptFile: [
      'content_scripts/js/dist/vendors.js',
      'content_scripts/js/dist/app.js',
    ],
    attachTo: {existing: true, reload: true},
    onAttach: async function (worker) {
      const auth = new GpgAuth();
      if (!await auth.isAuthenticated() || await auth.isMfaRequired()) {
        console.error('Can not attach application if user is not logged in.');
        return;
      }

      const appInitController = new AppInitController(worker);
      await appInitController.main();

      Worker.add('App', worker);
    }
  });
};

AppBoostrap.init = function () {
  return new Promise(function (resolve, reject) {
    // According to the user status :
    // * the pagemod should be initialized if the user is valid and logged in;
    // * the pagemod should be destroyed otherwise;
    const user = User.getInstance();
    if (user.isValid()) {
      AppBoostrap.destroy();
      AppBoostrap._pageMod = AppBoostrap.initPageMod();
      resolve();
    }
  });
};

exports.AppBoostrap = AppBoostrap;
