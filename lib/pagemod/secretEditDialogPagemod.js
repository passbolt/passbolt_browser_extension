/**
 * Decrypt dialog pagemod.
 *
 * This pagemod drives the iframe used when the user enter a password to be stored by passbolt
 * It is used when creating/editing a new password
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 *
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

var secretEditDialog = pageMod.PageMod({
  include: 'about:blank?passbolt=secretEdit*',
  contentStyleFile: [
    self.data.url('css/main_ff.min.css')
  ],
  contentScriptFile: [
    self.data.url('vendors/jquery.min.js'),
    self.data.url('vendors/ejs_production.js'),
    self.data.url('js/lib/message.js'),
    self.data.url('js/lib/request.js'),
    self.data.url('js/lib/secretComplexity.js'),
    self.data.url('js/lib/html.js'),
    self.data.url('js/lib/securityToken.js'),
    self.data.url('js/secret/edit.js')
  ],
  contentScriptWhen: 'ready',
  contentScriptOptions: {
    expose_messaging: false,
    addonDataPath: self.data.url()
  },
  onAttach: function (worker) {
    Worker.add('Secret', worker, {
      // on destroy, clean.
      onDestroy: function() {
        TabStorage.remove(worker.tab.id, 'editedPassword');
      }
    });

    app.events.config.listen(worker);
    app.events.dispatch.listen(worker);
    app.events.editPassword.listen(worker);
    app.events.passboltPage.listen(worker);
    app.events.secret.listen(worker);
    app.events.template.listen(worker);
    app.events.user.listen(worker);
  }
});
exports.secretEditDialog = secretEditDialog;
