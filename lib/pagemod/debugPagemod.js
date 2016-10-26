/**
 * Debug pagemod.
 *
 * This page mod drives a convenience config page for debug
 * This allows to not have to go through the setup process steps
 * and perform changes useful for testing that would otherwise break things
 * Like for example changing the public key only on the client but not the server
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');

var debug = pageMod.PageMod({
  include: self.data.url('config-debug.html'),
  contentScriptWhen: 'end',
  contentStyleFile: [
    self.data.url('css/config_debug_ff.min.css')
  ],
  contentScriptFile: [
    self.data.url('vendors/jquery.min.js'),
    self.data.url('js/lib/message.js'),
    self.data.url('js/lib/request.js'),
    self.data.url('js/debug.js')
  ],
  onAttach: function (worker) {
    Worker.add('debug', worker);
    app.events.config.listen(worker);
    app.events.dispatch.listen(worker);
    app.events.file.listen(worker);
    app.events.keyring.listen(worker);
    app.events.template.listen(worker);
    app.events.user.listen(worker);
    app.events.debug.listen(worker);
  }
});
exports.debug = debug;
