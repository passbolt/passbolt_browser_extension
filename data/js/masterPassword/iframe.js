/**
 * Master password iframe control.
 *
 * It has for aim to control the master password dialog iframe.
 * 	- Add the iframe to the application page. The masterPasswordDialogPagemod
 * 	  will detect it and will display the iframe content.
 * 	- Close the iframe.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

// Open the master password dialog.
// Listen to the event : passbolt.master-password.open-dialog
passbolt.message.on('passbolt.master-password.open-dialog', function (token) {
	// Add the master password iframe to the application page.
	var $iframe = $('<iframe/>', {
		id: 'passbolt-iframe-master-password',
		src: 'about:blank?passbolt=masterPasswordDialog',
		class: 'passbolt-plugin-dialog',
		frameBorder: 0
	});
	$iframe.appendTo('body');

	// When the master password iframe is ready.
	// Send
	$iframe.on('load', function () {
		passbolt.event.dispatchContext('MasterPassword', 'token', token);
	});
});

// Close the master password dialog.
// Listen to the event : passbolt.master-password.close-dialog
passbolt.message.on('passbolt.master-password.close-dialog', function () {
	$('#passbolt-iframe-master-password').remove();
});
