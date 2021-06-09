/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
// Without jQuery. Define a convenience method and use it
const clipboardReady = (callback) => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
};

clipboardReady(() => {
  /**
   * Copy a string into the clipboard.
   * @param text {string} The text to copy
   */
  const copyToClipboard = text => {
    // ref. https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Interact_with_the_clipboard
    const copyElement = document.getElementById('ClipboardText');
    copyElement.value = text;
    copyElement.select();
    document.execCommand("Copy");
  };

  // Ask the passbolt page to copy a string into the clipboard
  passbolt.message.on('passbolt.clipboard-iframe.copy', function (text) {
    copyToClipboard(text);
  });
});
