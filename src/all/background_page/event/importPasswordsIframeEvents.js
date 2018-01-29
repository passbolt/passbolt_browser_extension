/**
 * Import Passwords iframe events.
 *
 * It has for aim to control the import passwords dialog.
 * 	- Add the iframe to the application page. The importPasswordsDialogPagemod
 * 	  will detect it and will display the iframe content.
 * 	- Close the iframe.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Worker = require('../model/worker');

var listen = function (worker) {

	/*
	 * Open the import passwords dialog.
	 * @listens passbolt.import-passwords.open-dialog
	 */
	worker.port.on('passbolt.import-passwords.open-dialog', function () {
		Worker.get('App', worker.tab.id).port.emit('passbolt.import-passwords.open-dialog');
	});

	/*
	 * Close the import passwords dialog.
	 * @listens passbolt.import-passwords.close-dialog
	 */
	worker.port.on('passbolt.import-passwords.close-dialog', function () {
		Worker.get('App', worker.tab.id).port.emit('passbolt.import-passwords.close-dialog');
	});

};
exports.listen = listen;
