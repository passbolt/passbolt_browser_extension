/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.3
 */

import browser from "../../sdk/polyfill/browserPolyfill";

/** Default Passbolt browser extension icon file path  */
const DEFAULT_BROWSER_EXTENSION_ICON_FILEPATH = '/webAccessibleResources/img/icons/icon-32.png';

/**
 * Set a new browser extension icon given an icon file path. If empty, set the default icon
 * @param path
 */
function setIcon(path) {
  browser.action.setIcon({
    path: {
      32: path || DEFAULT_BROWSER_EXTENSION_ICON_FILEPATH
    }
  });
}

/**
 * Set the browser extension icon in an active mode
 */
function activate() {
  setIcon('/webAccessibleResources/img/icons/icon-32.png');
}

/**
 * Set the browser extension icon in an inactive mode
 */
function deactivate() {
  setIcon('/webAccessibleResources/img/icons/icon-32-signout.png');
}

/**
 * Set the count of resources to suggest on the browser extension icon
 * @param count The count to display
 */
function setSuggestedResourcesCount(count) {
  const hasAtLeastOneResourceToSuggest = count > 0;
  if (hasAtLeastOneResourceToSuggest) {
    const hasLessThanFiveResourcesToSuggest = count <= 5;
    if (hasLessThanFiveResourcesToSuggest) {
      setIcon(`/webAccessibleResources/img/icons/icon-32-badge-${count}.png`);
    } else {
      setIcon(`/webAccessibleResources/img/icons/icon-32-badge-5+.png`);
    }
  } else {
    setIcon('/webAccessibleResources/img/icons/icon-32.png');
  }
}

export const BrowserExtensionIconService = {
  activate: activate,
  deactivate: deactivate,
  setSuggestedResourcesCount: setSuggestedResourcesCount
};
