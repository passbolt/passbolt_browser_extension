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
console.log('debug pagemod');
var pageMod = require('sdk/page-mod');
var self = require('sdk/self');

var app = require('../main');
var Worker = require('../model/worker');

var Debug = function () {};
Debug._pageMod = undefined;

Debug.init = function () {

  if (typeof Debug._pageMod !== 'undefined') {
    Debug._pageMod.destroy();
  }
  Debug._pageMod = pageMod.PageMod({
    include: self.data.url('config-debug.html'),

    // Warning:
    // If you modify the following script and styles don't forget to also modify then in
    // chrome/data/config-debug.html and chrome/data/js/load/config-debug.js
    contentScriptWhen: 'end',
    contentScriptFile: [
      self.data.url('vendors/jquery.min.js'),
      self.data.url('js/lib/message.js'),
      self.data.url('js/lib/request.js'),
      self.data.url('js/debug.js')
    ],
    onAttach: function (worker) {
      Worker.add('debug', worker);
      app.events.config.listen(worker);
      app.events.file.listen(worker);
      app.events.keyring.listen(worker);
      app.events.template.listen(worker);
      app.events.user.listen(worker);
      app.events.debug.listen(worker);
    }
  });
};

exports.Debug = Debug;
