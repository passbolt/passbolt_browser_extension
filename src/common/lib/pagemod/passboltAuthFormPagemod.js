/**
 * Passbolt Auth Form pagemod.
 *
 * This pagemod help with the authentication
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var pageMod = require('sdk/page-mod');
var app = require('../main');
var Worker = require('../model/worker');

var passboltAuthForm = pageMod.PageMod({
  include: 'about:blank?passbolt=passbolt-iframe-login-form',
  contentScriptWhen: 'ready',
  // Warning:
  // If you modify the following script and styles don't forget to also modify then in
  // chrome/data/passbolt-iframe-login-form.html
  contentStyleFile: [
    self.data.url('css/main_ff.min.css')
  ],
  contentScriptFile: [
    self.data.url('vendors/jquery.min.js'),
    self.data.url('vendors/ejs_production.js'),
    self.data.url('js/lib/message.js'),
    self.data.url('js/lib/request.js'),
    self.data.url('js/lib/html.js'),
    self.data.url('js/lib/securityToken.js'),
    self.data.url('js/login/loginForm.js')
  ],
  contentScriptOptions: {
    addonDataPath: self.data.url()
  },
  onAttach: function (worker) {
    Worker.add('AuthForm', worker);
    app.events.template.listen(worker);
    app.events.user.listen(worker);
    app.events.keyring.listen(worker);
    app.events.auth.listen(worker);
  }
});

exports.passboltAuthForm = passboltAuthForm;
