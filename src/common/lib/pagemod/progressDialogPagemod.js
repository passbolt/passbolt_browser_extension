/**
 * Progress dialog pagemod.
 *
 * This pagemod drives the progress bar iframe
 * It is used when the add-on is encrypting something
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../app');
var pageMod = require('sdk/page-mod');
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
    // Warning:
    // If you modify the following script and styles don't forget to also modify then in
    // chrome/data/passbolt-iframe-progress-dialog.html
    contentStyleFile: [
      self.data.url('css/main_ff.min.css')
    ],
    contentScriptFile: [
      self.data.url('vendors/jquery.min.js'),
      self.data.url('vendors/ejs_production.js'),
      self.data.url('js/lib/message.js'),
      self.data.url('js/lib/request.js'),
      self.data.url('js/lib/html.js'),
      self.data.url('js/progress/progress.js')
    ],
    contentScriptWhen: 'ready',
    onAttach: function (worker) {
      Worker.add('Progress', worker);
      app.events.template.listen(worker);
    }
  });
}
exports.ProgressDialog = ProgressDialog;