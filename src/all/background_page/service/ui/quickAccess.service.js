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

/** The default quickaccesss window height */
const QUICKACCESS_WINDOW_HEIGHT = 400;

/** The default quickaccesss window width */
const QUICKACCESS_WINDOW_WIDTH = 380;

/**
 * Open the quick access in a detached mode
 * @param {array<{name: string, value: string}>} queryParameters The query parameters to attach to the quick access detached popup url
 * @return {Promise<windows.Window>}
 */
async function openInDetachedMode(queryParameters = []) {
  const url = await buildDetachedQuickacessUrl(queryParameters);
  const {top, left} = await buildDetachedQuickaccessPosition();

  const type = "panel";
  const width = QUICKACCESS_WINDOW_WIDTH;
  const height = QUICKACCESS_WINDOW_HEIGHT;
  const windowCreateData = {url, type, left, top, width, height};

  return browser.windows.create(windowCreateData);
}

/**
 * Build the detached quickaccess url.
 * @param {array<{name: string, value: string}>} queryParameters The query parameters to attach to the quick access detached popup url
 * @returns {Promise<string>}
 */
async function buildDetachedQuickacessUrl(queryParameters) {
  const browserExtensionUrl = await browser.browserAction.getPopup({});
  const quickaccessUrl = new URL(browserExtensionUrl);
  queryParameters.forEach(queryParameter => quickaccessUrl.searchParams.append(queryParameter.name, queryParameter.value));
  return quickaccessUrl.href;
}

/**
 * Build the detached quickaccess position.
 * @returns {Promise<{top: number, left: number}>}
 */
async function buildDetachedQuickaccessPosition() {
  const currentWindow = await browser.windows.getCurrent();
  const left = currentWindow.left + currentWindow.width - QUICKACCESS_WINDOW_WIDTH;
  const top = currentWindow.top;
  return {top, left};
}

exports.QuickAccessService = {
  openInDetachedMode: openInDetachedMode
};
