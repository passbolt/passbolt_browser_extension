/**
 * The passbolt clipboard
 * Module used on content code side to create / delete clipboard iframes
 * See. passboltClipboardPageMod and clipboard events in app code
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
$(function () {

  let clipboard = {
    iframeId: 'passbolt-iframe-clipboard',
  };

  /* ==================================================================================
   *  Create / Delete iframe
   * ================================================================================== */

  clipboard.init = function () {
    clipboard._createIframe();
  };

  /**
  * Create secure clipboard iframe
  * @private
  */
  clipboard._createIframe = function () {
    const iframeId = clipboard.iframeId;
    const appendTo = 'body';
    const style = 'position:absolute;bottom:0;right:0;width:1px;height:1px;'; // tu me vois, tu me vois plus
    passbolt.html.insertIframe(iframeId, appendTo, undefined, undefined, 'append', style);
  };

  /**
   * Delete secure clipboard iframe
   */
  clipboard._deleteIframe = function () {
    $(`#${clipboard.iframeId}`).remove();
  };

  // init by default
  clipboard.init();

  /* ==================================================================================
   *  Main
   * ================================================================================== */
  /**
   * Copy a string into the clipboard.
   * @param secret {string} The text to copy
   * @return promise
   */
  clipboard.copy = function (txt, type) {
    return new Promise(function(resolve, reject) {
      passbolt.request('passbolt.clipboard.copy', txt)
        .then(function () {
          passbolt.message.emitToPage('passbolt_notify', {
            status: 'success',
            title: 'plugin_clipboard_copy_success',
            data: type
          });
          resolve();
        });
    });
  };

  // The application asks the plugin to store a string into the clipboard.
  window.addEventListener('passbolt.clipboard', function (event) {
    passbolt.clipboard.copy(event.detail.data, event.detail);
  });

  passbolt.clipboard = clipboard;

});
undefined; // result must be structured-clonable data
