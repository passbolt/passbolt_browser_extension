/**
 * Config Listeners
 * @TODO refactor debug
 */
var tabs = require('sdk/tabs');
var Config = require('../model/config');
var User = require('../model/user').User;
var data = require('sdk/self').data;

var listen = function (worker) {

    // Listen to config read events.
    worker.port.on('passbolt.config.read', function(token, name) {
        worker.port.emit('passbolt.config.read.complete', token, 'SUCCESS', Config.read(name));
    });

    // Listen to config read all events, and return several entries of config.
    worker.port.on('passbolt.config.readAll', function(token, names) {
        var conf = {};
        for (i in names) {
            conf[names[i]] = Config.read(names[i]);
        }
        worker.port.emit('passbolt.config.readAll.complete', token, 'SUCCESS', conf);
    });

    // List to application config check
    worker.port.on('passbolt.addon.isConfigured', function(token, names) {
        var user = new User();
        worker.port.emit('passbolt.addon.isConfigured.complete', token, 'SUCCESS', user.isValid());
    });

    // If config is in debug mode, we allow to write in the config.
    if (Config.isDebug() == true) {

        // Listen to debug the config
        worker.port.on('passbolt.config.debug', function(token) {
            if (Config.isDebug() == true) {
                tabs.activeTab.url = data.url('config-debug.html');
            }
            worker.port.emit('passbolt.config.debug.complete', token, 'SUCCESS');
        });

        // Listen to config read events.
        worker.port.on('passbolt.config.write', function(token, name, value) {
            var write = Config.write(name, value);
            if (write) {
                worker.port.emit('passbolt.config.write.complete', token, 'SUCCESS');
            }
        });
    }
};
exports.listen = listen;