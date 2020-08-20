/**
 * Passbolt Auth Form pagemod.
 *
 * This pagemod help with the authentication
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {PageMod} = require('../sdk/page-mod');
var app = require('../app');
var Worker = require('../model/worker');

var PassboltAuthForm = function () {};
PassboltAuthForm._pageMod = undefined;

PassboltAuthForm.init = function () {

  if (typeof PassboltAuthForm._pageMod !== 'undefined') {
    PassboltAuthForm._pageMod.destroy();
    PassboltAuthForm._pageMod = undefined;
  }
  PassboltAuthForm._pageMod = new PageMod({
    name: 'AuthForm',
    include: 'about:blank?passbolt=passbolt-iframe-login-form',
    contentScriptWhen: 'ready',
    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// chrome/data/passbolt-iframe-login-form.html
    ],
    onAttach: function (worker) {
      Worker.add('AuthForm', worker);
      app.events.user.listen(worker);
      app.events.keyring.listen(worker);
      app.events.auth.listen(worker);
      app.events.siteSettings.listen(worker);
    }
  });
};
exports.PassboltAuthForm = PassboltAuthForm;
