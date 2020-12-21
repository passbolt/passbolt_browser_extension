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
const Worker = require('../model/worker');

var AuthBootstrap = function () {};
AuthBootstrap._pageMod = undefined;

AuthBootstrap.init = function () {

  if (typeof AuthBootstrap._pageMod !== 'undefined') {
    AuthBootstrap._pageMod.destroy();
    AuthBootstrap._pageMod = undefined;
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

  AuthBootstrap._pageMod = new PageMod({
    name: 'AuthBootstrap',
    include: regex,
    contentScriptWhen: 'ready',
    contentStyleFile: [
      'data/css/themes/default/ext_external.min.css'
    ],
    contentScriptFile: [
      'content_scripts/js/dist/vendors.js',
      'content_scripts/js/dist/login.js',
    ],
    attachTo: {existing: true, reload: true},
    onAttach: function (worker) {
      user.flushMasterPassword();

      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);

      Worker.add('AuthBootstrap', worker);
    }
  });
};
exports.AuthBootstrap = AuthBootstrap;
