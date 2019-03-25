/**
 * QuickAccess pagemod.
 *
 * This page mod drives the quick access default popup.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const app = require('../app');
const Worker = require('../sdk/worker').Worker;

/*
 * This page mod drives the quick access default popup
 */
var QuickAccess = function () {
  // The current active worker.
  this._worker = null;
};

QuickAccess.init = function () {

  chrome.runtime.onConnect.addListener(function (port) {
    if (port.name == "quickaccess") {
      this._worker = new Worker(port);

      // Destroy the worker when the quickacess poppup is destroyed.
      port.onDisconnect.addListener(() => {
        this._worker.destroy('Quickaccess popup got destroyed');
      });

      app.events.auth.listen(this._worker);
      app.events.config.listen(this._worker);
      app.events.keyring.listen(this._worker);
      app.events.masterPassword.listen(this._worker);
      app.events.quickAccess.listen(this._worker);
      app.events.resource.listen(this._worker);
      app.events.secret.listen(this._worker);
      app.events.tab.listen(this._worker);
    }
  });
};

exports.QuickAccess = QuickAccess;
