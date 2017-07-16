/**
 * The passbolt clipboard iframe
 * Module that performs the copy to clipboard operation
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};

(function (passbolt) {

  // The clipboard module.
  var clipboard = {};

  /**
   * Copy a string into the clipboard.
   * @param txt {string} The text to copy
   * @return promise
   */
  clipboard.copy = function (secret) {
    // ref. https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Interact_with_the_clipboard
    $('#ClipboardText').val(secret).select();
    document.execCommand("Copy");
  };

  // Ask the passbolt page to release its focus
  passbolt.message.on('passbolt.clipboard-iframe.copy', function (secret) {
    console.log('Content code: passbolt.clipboard-iframe.copy ' + secret);
    clipboard.copy(secret);
  });

})(passbolt);
