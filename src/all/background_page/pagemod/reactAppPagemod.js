/**
 * React application pagemod.
 *
 * @copyright (c) 2020 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {PageMod} = require('../sdk/page-mod');
const app = require('../app');
const Worker = require('../model/worker');

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
    include: 'about:blank?passbolt=passbolt-iframe-react-app',
    contentScriptWhen: 'end',
    contentScriptFile: [
      // Warning: script and styles need to be modified in
      // chrome/data/passbolt-iframe-react-app.html
    ],
    onAttach: function (worker) {
      // Initialize the events listeners.
      app.events.folder.listen(worker);
      app.events.resource.listen(worker);
      app.events.keyring.listen(worker);
      app.events.reactApp.listen(worker);
      app.events.secret.listen(worker);
      app.events.siteSettings.listen(worker);
      app.events.share.listen(worker);
      app.events.user.listen(worker);
      app.events.group.listen(worker);
      app.events.comment.listen(worker);
      app.events.tag.listen(worker);

      Worker.add('ReactApp', worker);
    }
  });
};

exports.ReactApp = ReactApp;
