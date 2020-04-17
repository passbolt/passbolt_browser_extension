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
var app = require('../app');
var pageMod = require('../sdk/page-mod');
var Worker = require('../model/worker');
var GpgAuth = require('../model/gpgauth').GpgAuth;
var User = require('../model/user').User;
var TabStorage = require('../model/tabStorage').TabStorage;

var PassboltApp = function () {
};
PassboltApp._pageMod = null;

PassboltApp.exists = function () {
  return PassboltApp._pageMod !== null;
};

PassboltApp.destroy = function () {
  if (PassboltApp.exists()) {
    PassboltApp._pageMod.destroy();
    PassboltApp._pageMod = null;
  }
};

PassboltApp.initPageMod = function () {
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
  var user = User.getInstance();
  var escapedDomain = user.settings.getDomain().replace(/\W/g, "\\$&");
  var url = '^' + escapedDomain + '/?(/app.*)?(#.*)?$';
  var regex = new RegExp(url);
  return pageMod.PageMod({
    name: 'PassboltApp',
    include: regex,
    contentScriptWhen: 'ready',
    contentStyleFile: [
      'data/css/themes/default/ext_external.min.css'
    ],
    contentScriptFile: [
      'data/vendors/jquery.js',
      'data/vendors/validator.js',
      'data/vendors/browser-polyfill.js',

      // Templates
      'data/tpl/group.js',
      'data/tpl/resource.js',
      'data/tpl/secret.js',
      'data/tpl/import.js',

      // Lib
      'data/js/lib/port.js',
      'data/js/lib/message.js',
      'data/js/lib/request.js',
      'data/js/lib/html.js',
      'content_scripts/js/clipboard/clipboardIframe.js',
      'data/js/file/file.js',

      // App
      'content_scripts/js/group/editIframe.js',
      'content_scripts/js/import/importPasswordsIframe.js',
      'content_scripts/js/export/exportPasswordsIframe.js',
      'content_scripts/js/app.js',
      'content_scripts/js/react-app.js'
    ],
    attachTo: ["existing", "top"],
    onAttach: async function (worker) {
      const auth = new GpgAuth();
      if (!await auth.isAuthenticated() || await auth.isMfaRequired()) {
        console.error('Can not attach application if user is not logged in.');
        return;
      }

      TabStorage.initStorage(worker.tab);

      app.events.auth.listen(worker);
      app.events.clipboard.listen(worker);
      app.events.editPassword.listen(worker);
      app.events.exportPasswordsIframe.listen(worker);
      app.events.favorite.listen(worker);
      app.events.keyring.listen(worker);
      app.events.secret.listen(worker);
      app.events.group.listen(worker);
      app.events.importPasswordsIframe.listen(worker);
      app.events.siteSettings.listen(worker);
      app.events.user.listen(worker);
      app.events.resource.listen(worker);
      app.events.app.listen(worker);
      app.events.share.listen(worker);

      Worker.add('App', worker);
    }
  });
};

PassboltApp.init = function () {
  return new Promise(function (resolve, reject) {
    // According to the user status :
    // * the pagemod should be initialized if the user is valid and logged in;
    // * the pagemod should be destroyed otherwise;
    var user = User.getInstance();
    if (user.isValid()) {
      PassboltApp.destroy();
      PassboltApp._pageMod = PassboltApp.initPageMod();
      resolve();
    }
  });
};

exports.PassboltApp = PassboltApp;
