/**
 * Progress iframe events.
 *
 * It has for aim to control the the progress iframe.
 *  - Add the iframe to the application page. the progressDialogPagemod
 * 	  will detect it and will display the iframe content.
 * 	- Close the iframe.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Worker = require('../model/worker');

var listen = function (worker) {

	// Open the progress dialog.
	//
	// @responseSuccess The dialog has been opened
	// @todo @responseError
	worker.port.on('passbolt.progress.open-dialog', function (requestId, title, goals) {
		Worker.get('App', worker.tab.id).port.emit('passbolt.progress.open-dialog', requestId, title, goals);
		// When the dialog is opened, answer to the request caller.
		Worker.get('App', worker.tab.id).port.once('passbolt.progress.open-dialog.complete', function() {
			worker.port.emit('passbolt.progress.open-dialog.complete', requestId, 'SUCCESS');
		});
	});

	// Close the progress dialog.
	worker.port.on('passbolt.progress.close-dialog', function (requestId) {
		Worker.get('App', worker.tab.id).port.emit('passbolt.progress.close-dialog');
	});

};
exports.listen = listen;
