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
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');

progressDialog = pageMod.PageMod({
  include: 'about:blank?passbolt=progressDialog*',
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
  contentScriptOptions: {
    expose_messaging: false,
    addonDataPath: self.data.url()
  },
  onAttach: function (worker) {
    Worker.add('Progress', worker);
    app.events.template.listen(worker);
  }
});
exports.progressDialog = progressDialog;