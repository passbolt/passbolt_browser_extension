/**
 * The passbolt clipboard iframe
 * Module that performs the copy to clipboard operation
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
$(function () {

  // The clipboard module.
  var clipboard = {};

  /**
   * Copy a string into the clipboard.
   * @param text {string} The text to copy
   * @return promise
   */
  clipboard.copy = function (text) {
    // ref. https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Interact_with_the_clipboard
    $('#ClipboardText').val(text).select();
    document.execCommand("Copy");
  };

  // Ask the passbolt page to copy a string into the clipboard
  passbolt.message.on('passbolt.clipboard-iframe.copy', function (text) {
    clipboard.copy(text);
  });

});
