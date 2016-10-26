/**
 * Setup bootstrap listener
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var { setInterval, clearInterval } = require('sdk/timers');
var tabs = require('sdk/tabs');
var data = require('sdk/self').data;
var Worker = require('../model/worker');

var listen = function (worker) {

    worker.port.on('passbolt.setup.plugin_check', function (info) {
        // Once the tab is ready, init the setup with the information already gathered.
        var interval = setInterval(function () {
            if (Worker.exists('Setup', worker.tab.id)) {
                Worker.get('Setup', worker.tab.id).port.emit('passbolt.setup.init', info);
                clearInterval(interval);
            }
        }, 150);

        // Redirect the user to the second step.
        tabs.activeTab.url = data.url('setup.html');
    });

};
exports.listen = listen;
