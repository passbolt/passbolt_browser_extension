/**
 * Share autocomplete dialog pagemod.
 *
 * This pagemod drives the iframe used when the user shares a password
 * and he is looking for new users to grant.
 *
 * This pagemod works jointly with the shareDialog Pagemod.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 *
 */
var app = require('../app');
var pageMod = require('../sdk/page-mod');
var Worker = require('../model/worker');

var ShareAutocompleteDialog = function () {};
ShareAutocompleteDialog._pageMod = undefined;

ShareAutocompleteDialog.init = function () {

  if (typeof ShareAutocompleteDialog._pageMod !== 'undefined') {
    ShareAutocompleteDialog._pageMod.destroy();
    ShareAutocompleteDialog._pageMod = undefined;
  }

  ShareAutocompleteDialog._pageMod = pageMod.PageMod({
    name: 'ShareAutocomplete',
    include: 'about:blank?passbolt=passbolt-iframe-password-share-autocomplete',
    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// chrome/data/passbolt-iframe-password-share-autocomplete.html
    ],
    contentScriptWhen: 'ready',
    onAttach: function (worker) {
      Worker.add('ShareAutocomplete', worker);
      app.events.config.listen(worker);
      app.events.passboltPage.listen(worker);
      app.events.shareAutocomplete.listen(worker);
    }
  });
};
exports.ShareAutocompleteDialog = ShareAutocompleteDialog;
