/**
 * Passbolt Auth pagemod.
 *
 * This pagemod help with the authentication
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../app');
var user = new (require('../model/user').User)();
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');

var PassboltAuth = function () {};
PassboltAuth._pageMod = undefined;

PassboltAuth.init = function () {

  if (typeof PassboltAuth._pageMod !== 'undefined') {
    PassboltAuth._pageMod.destroy();
    PassboltAuth._pageMod = undefined;
  }

  // Define which url to run the pagemod on
  var url = '^' + user.settings.getDomain() + '/auth/login';
  var domain = new RegExp(url);

  PassboltAuth._pageMod = pageMod.PageMod({
    name: 'PassboltAuth',
    include: domain,
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
      self.data.url('js/login/login.js')
    ],
    attachTo: ["existing", "top"],
    onAttach: function (worker) {
      Worker.add('Auth', worker);
      app.events.config.listen(worker);
      app.events.bootstrap.listen(worker);
      app.events.template.listen(worker);
      app.events.keyring.listen(worker);
      app.events.secret.listen(worker);
      app.events.user.listen(worker);
      app.events.auth.listen(worker);
    }
  });
};
exports.PassboltAuth = PassboltAuth;
