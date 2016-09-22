/**
 * Share autocomplete dialog pagemod.
 *
 * This pagemod drives the iframe used when the user shares a password
 * and he is looking for new users to grant.
 *
 * This pagemod works jointly with the shareDialog Pagemod.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 *
 */
var self = require('sdk/self');
var app = require('../main');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');

var shareAutocompleteDialog = pageMod.PageMod({
  include: 'about:blank?passbolt=shareAutocompleteInline*',
  contentStyleFile: [
    self.data.url('css/main_ff.min.css')
  ],
  contentScriptFile: [
    self.data.url('js/vendors/jquery-2.2.4.min.js'),
    self.data.url('js/vendors/ejs_production.js'),
    self.data.url('js/inc/message.js'),
    self.data.url('js/inc/request.js'),
    self.data.url('js/inc/event.js'),
    self.data.url('js/inc/helper/html.js'),
    self.data.url('js/secret/shareAutocomplete.js')
  ],
  contentScriptWhen: 'ready',
  contentScriptOptions: {
    expose_messaging: false,
    addonDataPath: self.data.url()
  },
  onAttach: function (worker) {
    Worker.add('ShareAutocomplete', worker, {
      removeOnTabUrlChange: true
    });

    app.events.config.listen(worker);
    app.events.dispatch.listen(worker);
    app.events.passboltPage.listen(worker);
    app.events.shareAutocomplete.listen(worker);
    app.events.template.listen(worker);
  }
});
exports.shareAutocompleteDialog = shareAutocompleteDialog;
