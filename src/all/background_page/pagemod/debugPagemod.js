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
const {PageMod} = require('../sdk/page-mod');
var app = require('../app');
var Worker = require('../model/worker');

var Debug = function () {};
Debug._pageMod = undefined;

Debug.init = function () {

  if (typeof Debug._pageMod !== 'undefined') {
    Debug._pageMod.destroy();
    Debug._pageMod = undefined;
  }

  Debug._pageMod = new PageMod({
    name: 'Debug',
    include: chrome.runtime.getURL('data/config-debug.html'),

    contentScriptWhen: 'end',
    contentScriptFile: [
			// Warning: modify the page scripts and styles in
			// chrome/data/config-debug.html and chrome/data/js/load/config-debug.js
    ],
    onAttach: function (worker) {
      Worker.add('Debug', worker);
      app.events.config.listen(worker);
      app.events.file.listen(worker);
      app.events.keyring.listen(worker);
      app.events.user.listen(worker);
      app.events.debug.listen(worker);
    }
  });
};
exports.Debug = Debug;
