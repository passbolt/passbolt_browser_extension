/**
 * Passbolt App pagemod.
 *
 * This pagemod drives the main addon app
 * It is inserted in all the pages of a domain that is trusted.
 * Such trust is defined during the first step of the setup process (or in config-debug)
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
var pageMod = require('../sdk/page-mod');
const { defer } = require('../sdk/core/promise');
var Worker = require('../model/worker');
var user = new (require('../model/user').User)();
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
  // ✗ https://demo.passbolt.com.attacker.com
  // ✗ https://demo.passbolt.com/auth/login
  var url = '^' + user.settings.getDomain() + '/?(#.*)?$';
  var regex = new RegExp(url);
  return pageMod.PageMod({
    name: 'PassboltApp',
    include: regex,
    contentScriptWhen: 'ready',
    contentStyleFile: [
      'data/css/external.min.css'
    ],
    contentScriptFile: [
      'data/vendors/jquery.min.js',

      // Templates
      'data/tpl/group.js',
      'data/tpl/master.js',
      'data/tpl/progress.js',
      'data/tpl/resource.js',
      'data/tpl/secret.js',

      // Lib
      'data/js/lib/port.js',
      'data/js/lib/message.js',
      'data/js/lib/request.js',
      'data/js/lib/html.js',
      'data/js/clipboard/clipboard.js',
      'data/js/file/file.js',

      // App
      'data/js/masterPassword/masterPasswordIframe.js',
      'data/js/secret/editIframe.js',
      'data/js/secret/shareIframe.js',
      'data/js/group/editIframe.js',
      'data/js/progress/progressIframe.js',
      'data/js/app.js'
    ],
    attachTo: ["existing", "top"],
    onAttach: function (worker) {
      TabStorage.initStorage(worker.tab);

      app.events.clipboard.listen(worker);
      app.events.config.listen(worker);
      app.events.editPassword.listen(worker);
      app.events.keyring.listen(worker);
      app.events.secret.listen(worker);
      app.events.group.listen(worker);
      app.events.masterPasswordIframe.listen(worker);
      app.events.app.listen(worker);

      Worker.add('App', worker);
    }
  });
};

PassboltApp.init = function () {
  var deferred = defer();

  // According to the user status :
  // * the pagemod should be initialized if the user is valid and logged in;
  // * the pagemod should be destroyed otherwise;
  if (user.isValid()) {
    user.isLoggedIn().then(
      // If it is already logged-in.
      function success() {
        PassboltApp.destroy();
        PassboltApp._pageMod = PassboltApp.initPageMod();
        deferred.resolve();
      },
      // If it is logged-out.
      function error() {
        PassboltApp.destroy();
      }
    );
  } else {
    deferred.reject();
  }

  return deferred.promise;
};

exports.PassboltApp = PassboltApp;
