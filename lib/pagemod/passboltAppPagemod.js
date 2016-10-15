/**
 * Passbolt App pagemod.
 *
 * This pagemod drives the main addon app
 * It is inserted in all the pages of a domain that is trusted.
 * Such trust is defined during the first step of the setup process (or in config-debug)
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');
var user = new (require('../model/user').User)();
var TabStorage = require('../model/tabStorage').TabStorage;

var PassboltApp = function () {
};
PassboltApp._pageMod = null;
PassboltApp.id = 0;

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
  // Count the number of initializations.
  PassboltApp.id++;

  // Attach on passbolt application pages.
  // By instance if your application domain is : https://demo.passbolt.com
  // The pagemod will be attached to the following pages :
  // - https://demo.passbolt.com
  // - https://demo.passbolt.com/
  // - https://demo.passbolt.com/#user
  // - https://demo.passbolt.com/#workspace
  var regex = new RegExp(user.settings.getDomain() + '\/?(#.*)?');
  return pageMod.PageMod({
    include: regex,
    contentScriptWhen: 'ready',
    contentStyleFile: [
      self.data.url('css/external.min.css')
    ],
    contentScriptFile: [
      self.data.url('vendors/jquery.min.js'),
      self.data.url('vendors/ejs_production.js'),
      self.data.url('js/lib/message.js'),
      self.data.url('js/lib/request.js'),
      self.data.url('js/lib/html.js'),
      self.data.url('js/lib/clipboard.js'),
      self.data.url('js/masterPassword/iframe.js'),
      self.data.url('js/secret/editIframe.js'),
      self.data.url('js/secret/shareIframe.js'),
      self.data.url('js/progress/iframe.js'),
      self.data.url('js/app.js')
    ],
    contentScriptOptions: {
      baseUrl: user.settings.getDomain(),
      id: PassboltApp.id
    },
    attachTo: ["existing", "top"],
    onAttach: function (worker) {
      TabStorage.initStorage(worker.tab);

      Worker.add('App', worker, {
        // If the user is redirected to the login page, that means it is logged out.
        // Destroy the passbolt application pagemod.
        onTabUrlChange: function () {
          if (worker.tab.url == user.settings.getDomain() + '/auth/login') {
            PassboltApp.destroy();
          }
        }
      });

      app.events.clipboard.listen(worker);
      app.events.config.listen(worker);
      app.events.dispatch.listen(worker);
      app.events.editPassword.listen(worker);
      app.events.keyring.listen(worker);
      app.events.secret.listen(worker);
      app.events.template.listen(worker);
      app.events.masterPasswordIframe.listen(worker);
      app.events.app.listen(worker);
    }
  });
};

PassboltApp.init = function () {
  // According to the user status :
  // * the pagemod should be initialized if the user is valid and logged in;
  // * the pagemod should be destroyed otherwise;
  if (user.isValid()) {
    user.isLoggedIn().then(
      // If it is already logged-in.
      function success() {
        PassboltApp.destroy();
        PassboltApp._pageMod = PassboltApp.initPageMod();
      },
      // If it is logged-out.
      function error() {
        PassboltApp.destroy();
      }
    );
  }
};

exports.PassboltApp = PassboltApp;