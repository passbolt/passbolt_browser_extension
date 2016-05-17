/**
 * Config Listeners
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var tabs = require('sdk/tabs');
var Config = require('../model/config');
var User = require('../model/user').User;
var data = require('sdk/self').data;
var self = require("sdk/self");

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
    worker.port.on('passbolt.addon.isConfigured', function(token) {
        var user = new User();
        worker.port.emit('passbolt.addon.isConfigured.complete', token, 'SUCCESS', user.isValid());
    });

    // Check if the current domain matches the trusted domain defined in configuration.
    // Only works if the plugin is configured.
    worker.port.on('passbolt.addon.checkDomain', function(token) {
        var trustedDomain = Config.read('user.settings.trustedDomain');
        var currentDomain = tabs.activeTab.url;
        var domainOk = (trustedDomain != '' && currentDomain.indexOf(trustedDomain) != -1);
        //var domainOk = (trustedDomain != '' && has(currentDomain, trustedDomain));
        worker.port.emit('passbolt.addon.checkDomain.complete', token, 'SUCCESS', domainOk);
    });

    // Get trusted domain.
    worker.port.on('passbolt.addon.getDomain', function(token) {
        var trustedDomain = Config.read('user.settings.trustedDomain');
        worker.port.emit('passbolt.addon.getDomain.complete', token, 'SUCCESS', trustedDomain);
    });

    // Listen to config read events.
    worker.port.on('passbolt.config.write', function(token, name, value) {
        var write = Config.write(name, value);
        if (write) {
            worker.port.emit('passbolt.config.write.complete', token, 'SUCCESS');
        }
    });

    // List to application config check
    worker.port.on('passbolt.addon.getVersion', function(token) {
        worker.port.emit('passbolt.addon.getVersion.complete', token, 'SUCCESS', self.version);
    });
};
exports.listen = listen;