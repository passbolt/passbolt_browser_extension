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
var TabStorage = require('../model/tabStorage').TabStorage;

var masterPasswordDialog = pageMod.PageMod({
  include: 'about:blank?passbolt=masterPasswordDialog*',
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
    self.data.url('js/masterPassword/masterPassword.js')
  ],
  contentScriptWhen: 'ready',
  contentScriptOptions: {
    expose_messaging: false,
    addonDataPath: self.data.url()
  },
  onAttach: function (worker) {
    Worker.add('MasterPassword', worker, {
      // on destroy, clean.
      onDestroy: function() {
        TabStorage.remove(worker.tab.id, 'masterPasswordRequest');
      }
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
