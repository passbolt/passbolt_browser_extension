/**
 * QuickAccess pagemod.
 *
 * This page mod drives the quick access default popup.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const app = require('../app');
const {Worker} = require('../sdk/worker');
const WorkerModel = require('../model/worker');

/*
 * This page mod drives the quick access default popup
 */
const QuickAccess = function () {
  // The current active worker.
  this._worker = null;
};

QuickAccess.init = function () {

  chrome.runtime.onConnect.addListener(async function (port) {
    if (port.name === "quickaccess") {
      this._worker = new Worker(port, port.sender.tab);

      app.events.auth.listen(this._worker);
      app.events.config.listen(this._worker);
      app.events.keyring.listen(this._worker);
      app.events.quickAccess.listen(this._worker);
      app.events.group.listen(this._worker);
      app.events.tag.listen(this._worker);
      app.events.resource.listen(this._worker);
      app.events.secret.listen(this._worker);
      app.events.organizationSettings.listen(this._worker);
      app.events.tab.listen(this._worker);
      app.events.locale.listen(this._worker);
      app.events.passwordGenerator.listen(this._worker);

      // Keep the pagemod event listeners at the end of the list.
      app.events.pagemod.listen(this._worker);

      WorkerModel.add('QuickAccess', this._worker);
    }
  });
};

exports.QuickAccess = QuickAccess;
