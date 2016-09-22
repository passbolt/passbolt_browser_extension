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

var shareDialog = pageMod.PageMod({
  include: 'about:blank?passbolt=shareInline*',
  contentStyleFile: [
    self.data.url('css/main_ff.min.css')
  ],
  contentScriptFile: [
    self.data.url('vendors/jquery-2.1.1.min.js'),
    self.data.url('vendors/ejs_production.js'),
    self.data.url('js/lib/message.js'),
    self.data.url('js/lib/request.js'),
    self.data.url('js/lib/event.js'),
    self.data.url('js/lib/helper/html.js'),
    self.data.url('js/lib/securityToken.js'),
    self.data.url('js/secret/share.js')
  ],
  contentScriptWhen: 'ready',
  contentScriptOptions: {
    expose_messaging: false,
    addonDataPath: self.data.url()
  },
  onAttach: function (worker) {
    Worker.add('Share', worker, {
      removeOnTabUrlChange: true
    });

    app.events.config.listen(worker);
    app.events.dispatch.listen(worker);
    app.events.editPassword.listen(worker);
    app.events.passboltPage.listen(worker);
    app.events.secret.listen(worker);
    app.events.share.listen(worker);
    app.events.user.listen(worker);
    app.events.template.listen(worker);
  }
});
exports.shareDialog = shareDialog;
