/**
 * Core Listeners
 */
var Config = require('../model/config');
var data = require('sdk/self').data;
var app = require('../main');

var listen = function (worker) {

    // Listen to get workers event.
	// Return a list of workers identifiers.
    worker.port.on('passbolt.get_workers', function(token) {
		var workersIds = Object.keys(app.workers);
        worker.port.emit('passbolt.get_workers.complete', token, 'SUCCESS', workersIds);
    });

};
exports.listen = listen;