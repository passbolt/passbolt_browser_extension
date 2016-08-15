/**
 * App events.
 *
 * Used to handle the events related to main application page.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../main');
var __ = require("sdk/l10n").get;
var Worker = require('../model/worker');

var listen = function (worker) {
    var workerContext = Worker.getContext(worker);

    // Listen to the application window resize event.
    // Broadcast the event to all the workers, to let them adapt their view
    // if necessary.
    worker.port.on('passbolt.html_helper.app_window_resized', function (cssClasses) {
        var workersIds = Worker.getAllKeys(workerContext);
        for (var i in workersIds) {
            Worker.get(workersIds[i], workerContext).port.emit('passbolt.html_helper.app_window_resized', cssClasses);
        }
    });

};

exports.listen = listen;
