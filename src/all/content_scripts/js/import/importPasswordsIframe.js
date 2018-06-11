/**
 * Import passwords iframe control.
 *
 * It has for aim to control the import passwords dialog iframe.
 * 	- Add the iframe to the application page. The importPasswordsDialogPagemod
 * 	  will detect it and will control it.
 * 	- Close the iframe.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
$(function () {
  /**
   * Open the import passwords dialog.
   * @listens passbolt.import-passwords.open-dialog
   */
  passbolt.message.on('passbolt.import-passwords.open-dialog', function () {
    // Add the master password iframe to the application page.
    const iframeId = 'passbolt-iframe-import-passwords';
    const className = 'passbolt-plugin-dialog loading';
    const appendTo = '#container';
    passbolt.html.insertThemedIframe(iframeId, appendTo, className);
  });

  /**
   * Close the import passwords dialog.
   * @listens passbolt.import-passwords.close-dialog
   */
  passbolt.message.on('passbolt.import-passwords.close-dialog', function () {
    $('#passbolt-iframe-import-passwords').remove();
  });
});
undefined; // result must be structured-clonable data