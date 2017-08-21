/**
 * Setup pagemod.
 *
 * This page mod drives the reset of setup process
 * The reset of the setup process is driven on the add-on side, see in ../data/ setup.html and js/setup.js
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var pageMod = require('../sdk/page-mod');

var app = require('../app');
var Worker = require('../model/worker');

/*
 * This pagemod help bootstrap the first step of the setup process from a passbolt server app page
 * The pattern for this url, driving the setup bootstrap, is defined in config.json
 */
var Setup = function () {};
Setup._pageMod = undefined;

Setup.init = function () {

  if (typeof Setup._pageMod !== 'undefined') {
    Setup._pageMod.destroy();
    Setup._pageMod = undefined;
  }

  Setup._pageMod = pageMod.PageMod({
    name: 'Setup',
    include: chrome.runtime.getURL('data/setup.html'),
    contentScriptWhen: 'end',
    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// chrome/data/setup.html and chrome/data/js/load/setup.js
		],
    onAttach: function (worker) {
      app.events.clipboard.listen(worker);
      app.events.setup.listen(worker);
      app.events.file.listen(worker);
      app.events.keyring.listen(worker);
      app.events.auth.listen(worker);
      app.events.user.listen(worker);
      app.events.config.listen(worker);

      Worker.add('Setup', worker);
    }
  });
};

exports.Setup = Setup;
