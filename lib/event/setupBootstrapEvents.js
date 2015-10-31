/**
 * Setup bootstrap listener
 * @param worker
 */
var { setInterval, clearInterval } = require('sdk/timers');
var tabs = require('sdk/tabs');
var data = require('sdk/self').data;
var app = require('../main');

var listen = function (worker) {

    worker.port.on('passbolt.setup.plugin_check', function (info) {

        console.log('passbolt.setup.plugin_check');

        // Once the tab is ready, init the setup with the information already gathered.
        tabs.activeTab.on('ready', function () {
            var interval = setInterval(function () {
                if (app.workers['Setup']) {
                    app.workers['Setup'].port.emit('passbolt.setup.init', info);
                    clearInterval(interval);
                }
            }, 150);
        });

        // Redirect the user to the second step.
        tabs.activeTab.url = data.url('setup.html');
    });
};
exports.listen = listen;