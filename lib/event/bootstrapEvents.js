/**
 * Bootstrap events
 * Used to handle the events reloading pagemods or launching add
 */
var self = require('sdk/self');
var app = require('../main');
var User = require('../model/user').User;
var Config = require('../model/config');
var tabs = require("sdk/tabs");
var __ = require("sdk/l10n").get;

var listen = function (worker) {

    // Try to set the security token
    worker.port.on('passbolt.bootstrap.login', function (token) {
        // Destroy the passbolt application authentication pageMod.
        // And trigger a page refresh to restart it to make it work on the current page if changed
        if(app.pageMods.passboltAuth.init()) {
            worker.port.emit('passbolt.bootstrap.login.complete', token, 'SUCCESS', true);
        } else {
            worker.port.emit('passbolt.bootstrap.login.complete', token, 'ERROR', true);
        }
    });

    // Listen to debug the config
    worker.port.on('passbolt.bootstrap.debug', function(token) {
        if (Config.isDebug() == true) {
            tabs.activeTab.url = self.data.url('config-debug.html');
            worker.port.emit('passbolt.config.debug.complete', token, 'SUCCESS');
        } else {
            worker.port.emit('passbolt.config.debug.complete', token, 'ERROR');
        }
    });

};
exports.listen = listen;
