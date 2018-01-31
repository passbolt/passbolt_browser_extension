/**
 * Import passwords dialog pagemod.
 *
 * This pagemod drives the dialog/iframe where the user imports his passwords.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
var pageMod = require('../sdk/page-mod');
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

var ImportPasswordsDialog = function () {};
ImportPasswordsDialog._pageMod = undefined;

ImportPasswordsDialog.init = function () {

  if (typeof ImportPasswordsDialog._pageMod !== 'undefined') {
    ImportPasswordsDialog._pageMod.destroy();
    ImportPasswordsDialog._pageMod = undefined;
  }

  ImportPasswordsDialog._pageMod = pageMod.PageMod({
    name: 'ImportPasswords',
    include: 'about:blank?passbolt=passbolt-iframe-import-passwords',
    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// src/chrome/data/passbolt-iframe-import-passwords.html
    ],
    contentScriptWhen: 'ready',
    onAttach: function (worker) {
      Worker.add('ImportPasswords', worker, {});
      app.events.config.listen(worker);
      app.events.importPasswordsIframe.listen(worker);
      app.events.importPasswords.listen(worker);
      app.events.passboltPage.listen(worker);
      app.events.user.listen(worker);
    }
  });
};
exports.ImportPasswordsDialog = ImportPasswordsDialog;
