/**
 * Export passwords iframe control.
 *
 * It has for aim to control the export passwords dialog iframe.
 * 	- Add the iframe to the application page. The exportPasswordsDialogPagemod
 * 	  will detect it and will control it.
 * 	- Close the iframe.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
$(function () {
  /**
   * Open the export passwords dialog.
   * @listens passbolt.export-passwords.open-dialog
   */
  passbolt.message.on('passbolt.export-passwords.open-dialog', function () {
    // Add the master password iframe to the application page.
    var iframeId = 'passbolt-iframe-export-passwords';
    var iframeUrl = chrome.runtime.getURL('data/' + iframeId + '.html') + '?passbolt=' + iframeId;
    var $iframe = $('<iframe/>', {
      id: iframeId,
      src: iframeUrl,
      class: 'passbolt-plugin-dialog loading',
      frameBorder: 0
    });
    $iframe.appendTo('body');
  });

  /**
   * Close the export passwords dialog.
   * @listens passbolt.export-passwords.close-dialog
   */
  passbolt.message.on('passbolt.export-passwords.close-dialog', function () {
    $('#passbolt-iframe-export-passwords').remove();
  });
});