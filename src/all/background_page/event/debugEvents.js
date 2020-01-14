/**
 * Debug Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Log = require('../model/log').Log;
var tabsController = require('../controller/tabsController');
const User = require('../model/user').User;

var listen = function (worker) {

  /*
   * Open a new tab.
   *
   * @listens passbolt.debug.open-tab
   * @param requestId {uuid} The request identifier
   * @param url {string} The url to open in the new tab.
   */
  worker.port.on('passbolt.debug.open-tab', function (url) {
    tabsController.open(url);
  });

  /*
   * Log.
   *
   * @listens passbolt.debug.log
   * @param requestId {uuid} The request identifier
   * @param data {mixed} The data to log.
   */
  worker.port.on('passbolt.debug.log', function (data) {
    Log.write({level: 'error', message: data});
  });

  /*
   * Csrf token.
   *
   * @listens passbolt.debug.init-csrf-token
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.debug.init-csrf-token', async function () {
    let {csrfToken} = await browser.storage.local.get(["csrfToken"]);
    const user = User.getInstance();

    if (csrfToken) {
      user.setCsrfToken(csrfToken);
    } else {
      await user.retrieveAndStoreCsrfToken();
      csrfToken = user.getCsrfToken();
      await browser.storage.local.set({csrfToken});
    }
  });

};
exports.listen = listen;
