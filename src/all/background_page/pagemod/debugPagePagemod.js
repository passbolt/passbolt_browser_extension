/**
 * Debug pagemod.
 *
 * This page mod drives a convenience config page for debug
 * This allows to not have to go through the setup process steps
 * and perform changes useful for testing that would otherwise break things
 * Like for example changing the public key only on the client but not the server
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var pageMod = require('../sdk/page-mod');
var app = require('../app');
var Worker = require('../model/worker');
var Log = require('../model/log').Log;

var DebugPage = function () {};
DebugPage._pageMod = undefined;

DebugPage.init = function () {

  Log.write({level: 'warning', message: 'Warning: plugin debug mode is on!'});
  Log.write({level: 'warning', message: chrome.runtime.getURL('data/config-debug.html')});

  if (typeof DebugPage._pageMod !== 'undefined') {
    DebugPage._pageMod.destroy();
    DebugPage._pageMod = undefined;
  }

  DebugPage._pageMod = pageMod.PageMod({
    name: 'DebugPage',
    include: chrome.runtime.getURL('data/config-debug.html'),

    contentScriptWhen: 'end',
    contentScriptFile: [
			// Warning: modify the page scripts and styles in
			// chrome/data/config-debug.html and chrome/data/js/load/config-debug.js
      'content_scripts/js/test.js'
    ],
    onAttach: function (worker) {
      Worker.add('DebugPage', worker);
      app.events.config.listen(worker);
      app.events.file.listen(worker);
      app.events.keyring.listen(worker);
      app.events.user.listen(worker);
      app.events.debugPage.listen(worker);
    }
  });
};
exports.DebugPage = DebugPage;
