/**
 * Decrypt dialog pagemod.
 *
 * This pagemod drives the iframe used when the user enter a password to be stored by passbolt
 * It is used when creating/editing a new password
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 *
 */
var self = require('../sdk/self');
var app = require('../app');
var pageMod = require('../sdk/page-mod');
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;


var SecretEditDialog = function () {};
SecretEditDialog._pageMod = undefined;

SecretEditDialog.init = function () {

  if (typeof SecretEditDialog._pageMod !== 'undefined') {
    SecretEditDialog._pageMod.destroy();
    SecretEditDialog._pageMod = undefined;
  }

  SecretEditDialog._pageMod = pageMod.PageMod({
    name: 'Secret',
    include: 'about:blank?passbolt=passbolt-iframe-secret-edition*',
    // Warning:
    // If you modify the following script and styles don't forget to also modify then in
    // chrome/data/passbolt-iframe-secret-edition.html
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
    onAttach: function (worker) {
      app.events.config.listen(worker);
      app.events.editPassword.listen(worker);
      app.events.passboltPage.listen(worker);
      app.events.secret.listen(worker);
      app.events.template.listen(worker);
      app.events.user.listen(worker);

      Worker.add('Secret', worker, {
        // on destroy, clean.
        onDestroy: function () {
          TabStorage.remove(worker.tab.id, 'editedPassword');
        }
      });
    }
  });
};
exports.SecretEditDialog = SecretEditDialog;
