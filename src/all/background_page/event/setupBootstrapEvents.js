/**
 * Setup bootstrap listener
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var tabsController = require('../controller/tabsController');
var data = require('../sdk/self').data;
var Worker = require('../model/worker');

var listen = function (worker) {
  /*
   * If the plugin is installed, init the setup.
   *
   * @listens passbolt.setup.completeRecovery
   * @param info {array} The initial setup information
   */
  worker.port.on('passbolt.setup.plugin_check', function (info) {
    // Redirect the user to the second step.
    tabsController.setActiveTabUrl(data.url('setup.html?data=' + encodeURIComponent(JSON.stringify(info))));
  });

};
exports.listen = listen;
