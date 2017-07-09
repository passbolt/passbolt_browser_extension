/**
 * Setup bootstrap listener
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var { setInterval, clearInterval } = require('../sdk/timers');
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
    var tabId = worker.tab.id;

    // Once the tab is ready, init the setup with the information already gathered.
    var interval = setInterval(function () {
      if (Worker.exists('Setup', tabId)) {
        Worker.get('Setup', tabId).port.emit('passbolt.setup.init', info);
        clearInterval(interval);
      }
    }, 500);

    // Redirect the user to the second step.
    tabsController.setActiveTabUrl(data.url('setup.html'));
  });

};
exports.listen = listen;
