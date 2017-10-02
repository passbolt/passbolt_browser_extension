/**
 * Debug Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var tabsController = require('../controller/tabsController');

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

};
exports.listen = listen;
