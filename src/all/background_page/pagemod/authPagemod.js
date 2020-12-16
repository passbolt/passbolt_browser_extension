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

var Auth = function () {};
Auth._pageMod = undefined;

Auth.init = function () {

  if (typeof Auth._pageMod !== 'undefined') {
    Auth._pageMod.destroy();
    Auth._pageMod = undefined;
  }
  Auth._pageMod = new PageMod({
    name: 'Auth',
    include: 'about:blank?passbolt=passbolt-iframe-login',
    contentScriptWhen: 'ready',
    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// chrome/data/passbolt-iframe-login-form.html
    ],
    onAttach: function (worker) {
      Worker.add('Auth', worker);
      app.events.user.listen(worker);
      app.events.keyring.listen(worker);
      app.events.auth.listen(worker);
      app.events.siteSettings.listen(worker);

      /*
       * Keep the pagemod event listeners at the end of the list, it answers to an event that allows
       * the content code to know when the background page is ready.
       */
      app.events.pagemod.listen(worker);
    }
  });
};
exports.Auth = Auth;
