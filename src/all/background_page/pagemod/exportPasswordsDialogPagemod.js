/**
 * Export passwords dialog pagemod.
 *
 * This pagemod drives the dialog/iframe where the user exports his passwords.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
const {PageMod} = require('../sdk/page-mod');
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

var ExportPasswordsDialog = function () {};
ExportPasswordsDialog._pageMod = undefined;

ExportPasswordsDialog.init = function () {

  if (typeof ExportPasswordsDialog._pageMod !== 'undefined') {
    ExportPasswordsDialog._pageMod.destroy();
    ExportPasswordsDialog._pageMod = undefined;
  }

  ExportPasswordsDialog._pageMod = new PageMod({
    name: 'ExportPasswords',
    include: 'about:blank?passbolt=passbolt-iframe-export-passwords',
    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// src/chrome/data/passbolt-iframe-export-passwords.html
    ],
    contentScriptWhen: 'ready',
    onAttach: function (worker) {
      Worker.add('ExportPasswords', worker, {
        onDestroy: function () {
          TabStorage.remove(worker.tab.id, 'itemsToExport');
        }
      });
      app.events.config.listen(worker);
      app.events.exportPasswordsIframe.listen(worker);
      app.events.exportPasswords.listen(worker);
      app.events.passboltPage.listen(worker);
      app.events.user.listen(worker);
    }
  });
};
exports.ExportPasswordsDialog = ExportPasswordsDialog;
