/**
 * Passbolt Auth pagemod.
 *
 * This pagemod help with the authentication
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
var User = require('../model/user').User;
const {PageMod} = require('../sdk/page-mod');
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
  // ✓ https://demo.passbolt.com/auth/login?redirect=%2somewhere
  // ✓ https://demo.passbolt.com/auth/login?redirect=%2somewhere#nice
  // ✗ https://demoxpassbolt.com/auth/login
  // ✗ https://demo.passbolt.com/auth/login/nope
  var user = User.getInstance();
  var escapedDomain = user.settings.getDomain().replace(/\W/g, "\\$&");
  var url = '^' + escapedDomain + '/auth/login/?(#.*)?(\\?.*)?$';
  var regex = new RegExp(url);

  PassboltAuth._pageMod = new PageMod({
    name: 'Auth',
    include: regex,
    contentScriptWhen: 'ready',
    contentStyleFile: [
      'data/css/themes/default/ext_external.min.css'
    ],
    contentScriptFile: [
      'data/vendors/jquery.js',
      'data/tpl/login.js',
      'data/js/lib/port.js',
      'data/js/lib/message.js',
      'data/js/lib/request.js',
      'data/js/lib/html.js',
      'content_scripts/js/login/login.js'
    ],
    attachTo: {existing: true, reload: true},
    onAttach: function (worker) {
      user.flushMasterPassword();
      Worker.add('Auth', worker);
      app.events.keyring.listen(worker);
      app.events.user.listen(worker);
      app.events.auth.listen(worker);
    }
  });
};
exports.PassboltAuth = PassboltAuth;
