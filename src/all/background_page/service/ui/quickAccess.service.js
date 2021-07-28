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
 * @since         3.4
 */

/** The default quickaccesss window heigth */
const QUICKACCESS_WINDOW_HEIGHT = 380;

/** The default quickaccesss window heigth */
const QUICKACCESS_WINDOW_WIDTH = 400;

/**
 * Open the quick access in a detached mode
 * @param {array<{name: string, value: string}>} queryParameters The query paramenters to attach to the quick access detached popup url
 */
async function openInDetachedMode(queryParameters = []) {
  const popupUrl = await browser.browserAction.getPopup({});
  const popupUrlWithQueryParameters = new URL(popupUrl);
  queryParameters.forEach(queryParameter => popupUrlWithQueryParameters.searchParams.append(queryParameter.name, queryParameter.value));
  const windowFeatures = `width=${QUICKACCESS_WINDOW_WIDTH},height=${QUICKACCESS_WINDOW_HEIGHT},scrollbars=0,toolbar=0,location=0,resizable=0,status=0, noopener`;
  const detachedQuickAccess = window.open(popupUrlWithQueryParameters.href, "extension_popup", windowFeatures);
  detachedQuickAccess.document.title = "Passbolt";
}

exports.QuickAccessService = {
  openInDetachedMode: openInDetachedMode
}