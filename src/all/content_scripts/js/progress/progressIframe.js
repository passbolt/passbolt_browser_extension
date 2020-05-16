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
    const iframeId = 'passbolt-iframe-progress-dialog';
    const appendTo = '#container';
    const className = 'passbolt-plugin-dialog';
    const urlOptions = {'title': title};
    if (goals) {
      urlOptions['goals'] = goals;
    }
    passbolt.html.insertThemedIframe(iframeId, appendTo, className, urlOptions);
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
// result must be structured-clonable data
undefined;