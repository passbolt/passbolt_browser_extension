/**
 * Setup pagemod.
 *
 * This page mod drives the reset of setup process
 * The reset of the setup process is driven on the add-on side, see in ../data/ setup.html and js/setup.js
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var pageMod = require('sdk/page-mod');
var app = require('../main');
var Worker = require('../model/worker');

/*
 * This pagemod help bootstrap the first step of the setup process from a passbolt server app page
 * The pattern for this url, driving the setup bootstrap, is defined in config.json
 */

var Setup = function () {
};
Setup._pageMod = undefined;
Setup.id = 0;
Setup.current;

Setup.init = function () {
  Setup.id++;

  if (typeof Setup._pageMod !== 'undefined') {
    Setup._pageMod.destroy();
  }

  Setup._pageMod = pageMod.PageMod({
    include: self.data.url('setup.html'),
    contentScriptWhen: 'end',
    contentScriptFile: [
      self.data.url('vendors/jquery.min.js'),
      self.data.url('vendors/ejs_production.js'),
      self.data.url('vendors/farbtastic.js'),
      self.data.url('js/lib/message.js'),
      self.data.url('js/lib/request.js'),
      self.data.url('js/lib/html.js'),
      self.data.url('js/lib/secretComplexity.js'),
      self.data.url('js/setup/workflow/installSetup.workflow.js'),
      self.data.url('js/setup/workflow/recoverSetup.workflow.js'),
      self.data.url('js/setup/step/domainCheck.js'),
      self.data.url('js/setup/step/defineKey.js'),
      self.data.url('js/setup/step/importKey.js'),
      self.data.url('js/setup/step/secret.js'),
      self.data.url('js/setup/step/generateKey.js'),
      self.data.url('js/setup/step/backupKey.js'),
      self.data.url('js/setup/step/keyInfo.js'),
      self.data.url('js/setup/step/securityToken.js'),
      self.data.url('js/setup/step/loginRedirection.js'),
      self.data.url('js/setup/setup.js')
    ],
    onAttach: function (worker) {
      Worker.add('Setup', worker);

      app.events.template.listen(worker);
      app.events.clipboard.listen(worker);
      app.events.setup.listen(worker);
      app.events.file.listen(worker);
      app.events.keyring.listen(worker);
      app.events.auth.listen(worker);
      app.events.user.listen(worker);
      app.events.config.listen(worker);
    }
  });
};

Setup.get = function () {
  Setup.init();
  return Setup._pageMod;
};

exports.Setup = Setup;
