/**
 * Export Passwords iframe events.
 *
 * It has for aim to control the export passwords dialog.
 * 	- Add the iframe to the application page. The exportPasswordsDialogPagemod
 * 	  will detect it and will display the iframe content.
 * 	- Close the iframe.
 *
 * @copyright (c) 2017-2018 Passbolt SARL, 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Worker = require('../model/worker');

var listen = function (worker) {

	/*
	 * Open the export passwords dialog.
	 * @listens passbolt.export-passwords.open-dialog
   * @todo might be @deprecated
	 */
	worker.port.on('passbolt.export-passwords.open-dialog', function () {
		Worker.get('App', worker.tab.id).port.emit('passbolt.export-passwords.open-dialog');
	});

	/*
	 * Close the export passwords dialog.
	 * @listens passbolt.export-passwords.close-dialog
	 */
	worker.port.on('passbolt.export-passwords.close-dialog', function () {
		Worker.get('App', worker.tab.id).port.emit('passbolt.export-passwords.close-dialog');
	});

};
exports.listen = listen;
