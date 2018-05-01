/**
 * progress iframe control.
 *
 * It has for aim to control the progress dialog iframe.
 * 	- Add the iframe to the application page. The progressDialogPagemod
 * 	  will detect it and will control its DOM.
 * 	- Close the iframe.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
$(function () {
	/*
	 * Open the progress dialog.
	 * @listens passbolt.progress.open-dialog
	 */
  passbolt.message.on('passbolt.progress.open-dialog', function (title, goals) {
    var iframeId = 'passbolt-iframe-progress-dialog';
    var iframeUrl = chrome.runtime.getURL('data/' + iframeId + '.html') + '?passbolt=' + iframeId;
    iframeUrl += '&title=' + title;
    if (goals) {
      iframeUrl += '&goals=' + goals;
    }

    // Add the progress iframe.
    var $iframe = $('<iframe/>', {
      id: iframeId,
      src: iframeUrl,
      class: 'passbolt-plugin-dialog',
      frameBorder: 0
    });
    $iframe.appendTo('body');
  });

	/*
	 * Close the progress dialog.
	 * @listens passbolt.progress.close-dialog
	 */
  passbolt.message.on('passbolt.progress.close-dialog', function (wait) {
    setTimeout(function () {
      $('#passbolt-iframe-progress-dialog').fadeOut(300, function () {
        $(this).remove();
      });
    }, wait ? wait : 0);
  });
});
undefined; // result must be structured-clonable data