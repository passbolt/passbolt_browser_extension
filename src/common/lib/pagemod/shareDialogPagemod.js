/**
 * Share dialog pagemod.
 *
 * This pagemod drives the iframe used when the user shares a password.
 * It is used when sharing a new password.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

var shareDialog = pageMod.PageMod({
  include: 'about:blank?passbolt=passbolt-iframe-password-share',
  // Warning:
  // If you modify the following script and styles don't forget to also modify then in
  // chrome/data/passbolt-iframe-password-share.html
  contentStyleFile: [
    self.data.url('css/main_ff.min.css')
  ],
  contentScriptFile: [
    self.data.url('vendors/jquery.min.js'),
    self.data.url('vendors/ejs_production.js'),
    self.data.url('js/lib/message.js'),
    self.data.url('js/lib/request.js'),
    self.data.url('js/lib/html.js'),
    self.data.url('js/lib/securityToken.js'),
    self.data.url('js/secret/share.js')
  ],
  contentScriptWhen: 'ready',
  onAttach: function (worker) {
    Worker.add('Share', worker, {
      // on destroy, clean.
      onDestroy: function() {
        TabStorage.remove(worker.tab.id, 'sharedPassword');
        TabStorage.remove(worker.tab.id, 'shareWith');
      }
    });

    app.events.config.listen(worker);
    app.events.editPassword.listen(worker);
    app.events.passboltPage.listen(worker);
    app.events.secret.listen(worker);
    app.events.share.listen(worker);
    app.events.user.listen(worker);
    app.events.template.listen(worker);
  }
});
exports.shareDialog = shareDialog;
