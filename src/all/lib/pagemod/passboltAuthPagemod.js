/**
 * Passbolt Auth pagemod.
 *
 * This pagemod help with the authentication
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
var user = new (require('../model/user').User)();
var pageMod = require('../sdk/page-mod');
var Worker = require('../model/worker');

var PassboltAuth = function () {};
PassboltAuth._pageMod = undefined;

PassboltAuth.init = function () {

  if (typeof PassboltAuth._pageMod !== 'undefined') {
    PassboltAuth._pageMod.destroy();
    PassboltAuth._pageMod = undefined;
  }

  // The pagemod will be attached to the following pages:
  // ✓ https://demo.passbolt.com/auth/login
  // ✓ https://demo.passbolt.com/auth/login/
  // ✓ https://demo.passbolt.com/auth/login#checkthis
  // ✗ https://demo.passbolt.com/auth/login/nope
  var url = '^' + user.settings.getDomain() + '/auth/login/?(#.*)?$';
  var domain = new RegExp(url);

  PassboltAuth._pageMod = pageMod.PageMod({
    name: 'Auth',
    include: domain,
    contentScriptWhen: 'ready',
    contentStyleFile: [
      'data/css/external.min.css'
    ],
    contentScriptFile: [
      'data/vendors/jquery.min.js',
      'data/vendors/ejs_production.js',
      'data/js/lib/message.js',
      'data/js/lib/request.js',
      'data/js/lib/html.js',
      'data/js/login/login.js'
    ],
    attachTo: ["existing", "top"],
    onAttach: function (worker) {
      Worker.add('Auth', worker);
      app.events.config.listen(worker);
      app.events.template.listen(worker);
      app.events.keyring.listen(worker);
      app.events.secret.listen(worker);
      app.events.user.listen(worker);
      app.events.auth.listen(worker);
    }
  });
};
exports.PassboltAuth = PassboltAuth;
