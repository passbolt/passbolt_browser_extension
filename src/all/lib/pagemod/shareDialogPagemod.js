/**
 * Share dialog pagemod.
 *
 * This pagemod drives the iframe used when the user shares a password.
 * It is used when sharing a new password.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
var pageMod = require('../sdk/page-mod');
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

var ShareDialog = function () {};
ShareDialog._pageMod = undefined;

ShareDialog.init = function () {

  if (typeof ShareDialog._pageMod !== 'undefined') {
    ShareDialog._pageMod.destroy();
    ShareDialog._pageMod = undefined;
  }

  ShareDialog._pageMod = pageMod.PageMod({
    name: 'Share',
    include: 'about:blank?passbolt=passbolt-iframe-password-share',
    contentScriptFile: [
			// Warning: script and styles need to be modified in
			// chrome/data/passbolt-iframe-password-share.html
    ],
    contentScriptWhen: 'ready',
    onAttach: function (worker) {
      Worker.add('Share', worker, {
        onDestroy: function () {
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
};
exports.ShareDialog = ShareDialog;
