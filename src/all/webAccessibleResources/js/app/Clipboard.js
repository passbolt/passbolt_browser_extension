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
/* eslint-disable no-unused-vars */
import Port from "../lib/port";
/* eslint-enable no-unused-vars */

// Wait the document to be ready before executing the script given in parameter.
const iframeReady = callback => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
};

iframeReady(() => {
  /**
   * Copy a string into the clipboard.
   * @param text {string} The text to copy
   */
  function copyToClipboard(text) {
    // ref. https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Interact_with_the_clipboard
    const copyElement = document.getElementById('ClipboardText');
    copyElement.value = text;
    copyElement.select();
    document.execCommand("Copy");
  }

  // Ask the passbolt page to copy a string into the clipboard
  port.on('passbolt.clipboard-iframe.copy', text => {
    copyToClipboard(text);
  });
});
