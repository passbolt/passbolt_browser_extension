/**
 * Core Listeners
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Config = require('../model/config');
var data = require('sdk/self').data;
var app = require('../main');
var Worker = require('../model/worker');

var listen = function (worker) {
    var workerContext = Worker.getContext(worker);

    // Listen to get workers event.
	  // Return a list of workers identifiers.
    worker.port.on('passbolt.get_workers', function(token) {
		var workersIds = Worker.getAllKeys(workerContext);
        worker.port.emit('passbolt.get_workers.complete', token, 'SUCCESS', workersIds);
    });

};
exports.listen = listen;
