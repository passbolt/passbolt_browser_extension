/**
 * React application pagemod.
 *
 * @copyright (c) 2020 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {PageMod} = require('../sdk/page-mod');
const app = require('../app');
const Worker = require('../model/worker');
const GpgAuth = require('../model/gpgauth').GpgAuth;

/*
 * This pagemod help bootstrap the first step of the setup process from a passbolt server app page
 * The pattern for this url, driving the setup bootstrap, is defined in config.json
 */
const ReactApp = function () {};
ReactApp._pageMod = null;

ReactApp.init = function () {

  if (ReactApp._pageMod) {
    ReactApp._pageMod.destroy();
    ReactApp._pageMod = null;
  }

  ReactApp._pageMod = new PageMod({
    name: 'ReactApp',
    include: 'about:blank?passbolt=passbolt-iframe-app',
    contentScriptWhen: 'end',
    contentScriptFile: [
      // Warning: script and styles need to be modified in
      // chrome/data/passbolt-iframe-app.html
    ],
    onAttach: async function (worker) {
      const auth = new GpgAuth();
      if (!await auth.isAuthenticated() || await auth.isMfaRequired()) {
        console.error('Can not attach application if user is not logged in.');
        return;
      }

      // Initialize the events listeners.
      app.events.clipboard.listen(worker);
      app.events.folder.listen(worker);
      app.events.resource.listen(worker);
      app.events.keyring.listen(worker);
      app.events.secret.listen(worker);
      app.events.siteSettings.listen(worker);
      app.events.share.listen(worker);
      app.events.user.listen(worker);
      app.events.group.listen(worker);
      app.events.comment.listen(worker);
      app.events.tag.listen(worker);
      app.events.favorite.listen(worker);
      app.events.importPasswords.listen(worker);
      app.events.exportPasswords.listen(worker);

      // Keep the pagemod event listeners at the end of the list.
      app.events.pagemod.listen(worker);

      Worker.add('ReactApp', worker);
    }
  });
};

exports.ReactApp = ReactApp;
