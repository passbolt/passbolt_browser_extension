/**
 * Debug pagemod.
 *
 * This page mod allow inserting the debug tools needed by developers on all
 * pages. By This page mod drives a convenience config page for debug
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

var Debug = function () {};
Debug._pageMod = undefined;

Debug.init = function () {

  if (typeof Debug._pageMod !== 'undefined') {
    Debug._pageMod.destroy();
    Debug._pageMod = undefined;
  }

  Debug._pageMod = pageMod.PageMod({
    name: 'Debug',
    include: new RegExp('.*'),

    contentScriptFile: [
      'data/vendors/jquery.js',
      'data/js/lib/port.js',
      'data/js/lib/request.js',
      'data/js/lib/message.js',
      'data/js/debug/common.js'
    ],
    onAttach: function (worker) {
      Worker.add('Debug', worker);
      app.events.config.listen(worker);
      app.events.debug.listen(worker);
    }
  });

};
exports.Debug = Debug;
