/**
 * Debug Listeners
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
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
		Config.flush();
	});

    // Listen to app pagemod init event.
    worker.port.on('passbolt.debug.appPagemod.init', function(token) {
        var app = require('../main');
        app.pageMods.passboltApp.init();
    });
};
exports.listen = listen;
