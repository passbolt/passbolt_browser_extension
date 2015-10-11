/**
 * Event Dispatchers
 * Allow brokering events from one content code to the another since a
 * content code must use the app to communicate with another content code
 */

var app = require('../main');

var listen = function (worker) {

    // Set context variables on the target worker.
    worker.port.on('passbolt.context.dispatch', function (toWorker, name, value) {
        app.workers[toWorker].port.emit('passbolt.context.set', name, value);
    });

    // Dispatch an event to another worker.
    worker.port.on('passbolt.event.dispatch', function (toWorker, eventName) {
        var args = Array.slice(arguments, 1);
        app.workers[toWorker].port.emit.apply(null, args);
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
            app.workers[callbacks[token].toWorker].port.removeListener(request + '.complete', callbacks[token].completedCallback);
            // Remove the listener on the progress event.
            app.workers[callbacks[token].toWorker].port.removeListener(request + '.progress', callbacks[token].progressCallback);
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
        // @todo For now the common behavior is : if the worker doesn't exist, don't dispatch.
        // No error, no exception.
        if (!app.workers[toWorker]) {
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
        app.workers[toWorker].port.on(request + '.complete', completedCallback);

        // Listen to the progress message on the worker we emit the request.
        app.workers[toWorker].port.on(request + '.progress', progressCallback);

        // Emit the message on the target worker.
        app.workers[toWorker].port.emit.apply(null, Array.slice(arguments, 1));
    });
};
exports.listen = listen;