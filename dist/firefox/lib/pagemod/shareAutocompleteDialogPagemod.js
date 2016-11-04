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
var app = require('../app');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');

var ShareAutocompleteDialog = function () {};
ShareAutocompleteDialog._pageMod = undefined;

ShareAutocompleteDialog.init = function () {

  if (typeof ShareAutocompleteDialog._pageMod !== 'undefined') {
    ShareAutocompleteDialog._pageMod.destroy();
    ShareAutocompleteDialog._pageMod = undefined;
  }

  ShareAutocompleteDialog._pageMod = pageMod.PageMod({
    name: 'ShareAutocompleteDialog',
    include: 'about:blank?passbolt=passbolt-iframe-password-share-autocomplete',
    // Warning:
    // If you modify the following script and styles don't forget to also modify then in
    // chrome/data/passbolt-iframe-password-share-autocomplete.html
    contentStyleFile: [
      self.data.url('css/main_ff.min.css')
    ],
    contentScriptFile: [
      self.data.url('vendors/jquery.min.js'),
      self.data.url('vendors/ejs_production.js'),
      self.data.url('js/lib/message.js'),
      self.data.url('js/lib/request.js'),
      self.data.url('js/lib/html.js'),
      self.data.url('js/secret/shareAutocomplete.js')
    ],
    contentScriptWhen: 'ready',
    onAttach: function (worker) {
      Worker.add('ShareAutocomplete', worker);
      app.events.config.listen(worker);
      app.events.passboltPage.listen(worker);
      app.events.shareAutocomplete.listen(worker);
      app.events.template.listen(worker);
    }
  });
}
exports.ShareAutocompleteDialog = ShareAutocompleteDialog;
