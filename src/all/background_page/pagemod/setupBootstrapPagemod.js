/**
 * Setup bootstrap pagemod.
 *
 * This pagemod help bootstrap the first step of the setup process from a passbolt server app page
 * The pattern for this url, driving the setup bootstrap, is defined in config.json
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
var pageMod = require('../sdk/page-mod');
var Worker = require('../model/worker');
var Config = require('../model/config');

var SetupBootstrap = function () {
};
SetupBootstrap._pageMod = undefined;

SetupBootstrap.init = function () {
  if (typeof SetupBootstrap._pageMod !== 'undefined') {
    SetupBootstrap._pageMod.destroy();
    SetupBootstrap._pageMod = undefined;
  }
  const uuidRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[0-5][a-fA-F0-9]{3}-[089aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}";
  const setupBootstrapRegex = `(.*)\/setup\/(install|recover)\/(${uuidRegex})\/(${uuidRegex})`;
  SetupBootstrap._pageMod = pageMod.PageMod({
    name: 'SetupBootstrap',
		include: new RegExp(setupBootstrapRegex),
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
      'data/vendors/jquery.js',
      'data/js/lib/port.js',
      'data/js/lib/message.js',
      'data/js/lib/request.js',
      'content_scripts/js/setup/bootstrap.js'
    ],
    onAttach: function (worker) {
      Worker.add('SetupBootstrap', worker);
      app.events.setupbootstrap.listen(worker);
    }
  });
};

exports.SetupBootstrap = SetupBootstrap;
