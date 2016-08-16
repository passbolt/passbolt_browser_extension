/**
 * Master password iframe events.
 *
 * It has for aim to control the master password iframe.
 * 	- Add the iframe to the application page. The masterPasswordDialogPagemod
 * 	  will detect it and will display the iframe content.
 * 	- Close the iframe.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../main');
var Worker = require('../model/worker');

var listen = function (worker) {
	var workerContext = Worker.getContext(worker);

	// Open the master password dialog.
	// Listen to the event : passbolt.master-password.open-dialog
	worker.port.on('passbolt.master-password.open-dialog', function () {
		Worker.get('App', workerContext).port.emit('passbolt.master-password.open-dialog');
	});

	// Close the master password dialog.
	// Listen to the event : passbolt.master-password.close-dialog
	worker.port.on('passbolt.master-password.close-dialog', function () {
		Worker.get('App', workerContext).port.emit('passbolt.master-password.close-dialog');
	});
};
exports.listen = listen;
