/**
 * Config Listeners
 */
var tabs = require('sdk/tabs');
var Config = require('../model/config');
var data = require('sdk/self').data;

var listen = function (worker) {

    // Listen to config read all events.
    worker.port.on('passbolt.debug.config.readAll', function(token) {
        worker.port.emit('passbolt.debug.config.readAll.complete', token, 'SUCCESS', Config.readAll());
    });

	// Listen to flush local storage events.
	worker.port.on('passbolt.debug.config.flush', function(token) {
		console.log('flush the local storage');
		Config.flush();
	});
};
exports.listen = listen;
