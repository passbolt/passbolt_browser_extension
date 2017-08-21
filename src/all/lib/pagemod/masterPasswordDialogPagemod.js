/**
 * Master password dialog pagemod.
 *
 * This pagemod drives the dialog/iframe where the user enters the secret key passphrase,
 * also called master password. It is used when encrypting, decrypting, signing, etc.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
var pageMod = require('../sdk/page-mod');
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

var MasterPasswordDialog = function () {};
MasterPasswordDialog._pageMod = undefined;

MasterPasswordDialog.init = function () {

  if (typeof MasterPasswordDialog._pageMod !== 'undefined') {
    MasterPasswordDialog._pageMod.destroy();
    MasterPasswordDialog._pageMod = undefined;
  }

  MasterPasswordDialog._pageMod = pageMod.PageMod({
    name: 'MasterPassword',
    include: 'about:blank?passbolt=passbolt-iframe-master-password',
    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// src/chrome/data/passbolt-iframe-master-password.html
    ],
    contentScriptWhen: 'ready',
    onAttach: function (worker) {
      Worker.add('MasterPassword', worker, {
        // on destroy, clean.
        onDestroy: function() {
          TabStorage.remove(worker.tab.id, 'masterPasswordRequest');
        }
      });
      app.events.config.listen(worker);
      app.events.masterPasswordIframe.listen(worker);
      app.events.masterPassword.listen(worker);
      app.events.passboltPage.listen(worker);
      app.events.user.listen(worker);
    }
  });
};
exports.MasterPasswordDialog = MasterPasswordDialog;
