/**
 * Progress dialog pagemod.
 *
 * This pagemod drives the progress bar iframe
 * It is used when the add-on is encrypting something
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
var pageMod = require('../sdk/page-mod');
var Worker = require('../model/worker');

var ProgressDialog = function () {};
ProgressDialog._pageMod = undefined;

ProgressDialog.init = function () {

  if (typeof ProgressDialog._pageMod !== 'undefined') {
    ProgressDialog._pageMod.destroy();
    ProgressDialog._pageMod = undefined;
  }

  ProgressDialog._pageMod = pageMod.PageMod({
    name: 'Progress',
    include: 'about:blank?passbolt=passbolt-iframe-progress-dialog*',

    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// chrome/data/passbolt-iframe-progress-dialog.html
    ],
    contentScriptWhen: 'ready',
    onAttach: function (worker) {
      Worker.add('Progress', worker);
      app.events.template.listen(worker);
    }
  });
};
exports.ProgressDialog = ProgressDialog;