/**
 * Master password dialog pagemod.
 *
 * This pagemod drives the dialog/iframe where the user enters the secret key passphrase,
 * also called master password. It is used when encrypting, decrypting, signing, etc.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');

var masterPasswordDialog = pageMod.PageMod({
  include: 'about:blank?passbolt=masterPasswordDialog*',
  contentStyleFile: [
    self.data.url('css/main_ff.min.css')
  ],
  contentScriptFile: [
    self.data.url('js/vendors/jquery-2.1.1.min.js'),
    self.data.url('js/vendors/ejs_production.js'),
    self.data.url('js/inc/message.js'),
    self.data.url('js/inc/request.js'),
    self.data.url('js/inc/event.js'),
    self.data.url('js/inc/helper/html.js'),
    self.data.url('js/inc/securityToken.js'),
    self.data.url('js/masterPassword/masterPassword.js')
  ],
  contentScriptWhen: 'ready',
  contentScriptOptions: {
    expose_messaging: false,
    addonDataPath: self.data.url()
  },
  onAttach: function (worker) {
    Worker.add('MasterPassword', worker, {
      removeOnTabUrlChange: true
    });

    app.events.config.listen(worker);
    app.events.dispatch.listen(worker);
    app.events.masterPasswordIframe.listen(worker);
    app.events.masterPassword.listen(worker);
    app.events.template.listen(worker);
    app.events.passboltPage.listen(worker);
    app.events.user.listen(worker);
  }
});
exports.masterPasswordDialog = masterPasswordDialog;
