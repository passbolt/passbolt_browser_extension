/**
 * Event Dispatchers
 * Allow brokering events from one content code to the another since a
 * content code must use the app to communicate with another content code
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var app = require('../main');
var Worker = require('../model/worker');

var listen = function (worker) {

    // Set context variables on the target worker.
    worker.port.on('passbolt.context.dispatch', function (toWorker, name, value) {
        Worker.get(toWorker, worker).port.emit('passbolt.context.set', name, value);
    });

    // Dispatch an event to another worker.
    worker.port.on('passbolt.event.dispatch', function (toWorker, eventName) {
        var args = Array.slice(arguments, 1);
        if (Worker.exists(toWorker, worker)) {
            Worker.get(toWorker, worker).port.emit.apply(null, args);
        }
		else {
            console.warn('try to dispatch an event on an worker ' + toWorker + ' that doesn\' exist.');
		}
    });

    // Dispatch a request to another worker.
    // @todo callbacks variable scope issue
    var callbacks = {};
    var completedCallback = function (token) {
        // If a callback exists for the given token, execute it.s
        if (callbacks[token]) {
            var request = callbacks[token].request,
                args = Array.slice(arguments);
            // Add the message to the message's arguments.
            args.unshift(request + '.complete');
            // Launch the callback associated to the request.
            callbacks[token].completedCallback.apply(null, args);
            // Remove the listener on the complete event.
            Worker.get(callbacks[token].toWorker, worker).port.removeListener(request + '.complete', callbacks[token].completedCallback);
            // Remove the listener on the progress event.
            Worker.get(callbacks[token].toWorker, worker).port.removeListener(request + '.progress', callbacks[token].progressCallback);
            // Delete the callback in the callback stack.
            delete(callbacks[token]);
        }
    };

    var progressCallback = function (token) {
        // If a callback exists for the given token, execute it
        if (callbacks[token]) {
            var request = callbacks[token].request,
                args = Array.slice(arguments);
            // Add the message to the message's arguments.
            args.unshift(request + '.progress');
            // Launch the callback associated to the request.
            callbacks[token].progressCallback.apply(null, args);
        }
    };

    worker.port.on('passbolt.request.dispatch', function (toWorker, request, token) {
        // If the worker doesn't exist, display a warning
        if (!Worker.exists(toWorker, worker)) {
            console.warn('try to dispatch a request on an worker ' + toWorker + ' that doesn\' exist.');
            return;
        }
        callbacks[token] = {
            request: request,
            toWorker: toWorker,
            completedCallback: function () {
                worker.port.emit.apply(null, Array.slice(arguments));
            },
            progressCallback: function () {
                worker.port.emit.apply(null, Array.slice(arguments));
            }
        };

        // Listen to the complete message on the worker we emit the request.
        Worker.get(toWorker, worker).port.on(request + '.complete', completedCallback);

        // Listen to the progress message on the worker we emit the request.
        Worker.get(toWorker, worker).port.on(request + '.progress', progressCallback);

        // Emit the message on the target worker.
        Worker.get(toWorker, worker).port.emit.apply(null, Array.slice(arguments, 1));
    });
};
exports.listen = listen;