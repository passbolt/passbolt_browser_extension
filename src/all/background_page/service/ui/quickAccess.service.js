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
import browser from "../../sdk/polyfill/browserPolyfill";
import {v4 as uuidv4} from "uuid";
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import WorkerEntity from "../../model/entity/worker/workerEntity";

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
  // Generate the worker id
  const workerId = uuidv4();

  const url = await buildDetachedQuickacessUrl(queryParameters, workerId);
  const {top, left} = await buildDetachedQuickaccessPosition();

  const type = "popup";
  const width = QUICKACCESS_WINDOW_WIDTH;
  const height = QUICKACCESS_WINDOW_HEIGHT;
  const windowCreateData = {url: url, type: type, left: left, top: top, width: width, height: height};
  const quickAccessWindow = await browser.windows.create(windowCreateData);

  // Register the worker in the session storage
  await addWorkerQuickAccess(workerId, quickAccessWindow.tabs[0].id);

  // On firefox 90, with dual screen, the window is not positioned properly and it requires to be moved manually.
  browser.windows.update(quickAccessWindow.id, {left: left, top: top});
  return quickAccessWindow;
}

/**
 * Add worker quickaccess in session storage
 * @param {string} workerId The worker id
 * @param {number} tabId The tab id
 * @return {Promise<void>}
 */
async function addWorkerQuickAccess(workerId, tabId) {
  const worker = {
    id: workerId,
    name: "QuickAccess",
    tabId: tabId,
    frameId: 0
  };
  await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
}

/**
 * Build the detached quickaccess url.
 * @param {array<{name: string, value: string}>} queryParameters The query parameters to attach to the quick access detached popup url
 * @param {string} workerId The worker id
 * @returns {Promise<string>}
 */
async function buildDetachedQuickacessUrl(queryParameters, workerId) {
  const browserExtensionUrl = await browser.action.getPopup({});
  const quickaccessUrl = new URL(browserExtensionUrl);
  quickaccessUrl.searchParams.set("passbolt", workerId);
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
  return {top: top, left: left};
}

export const QuickAccessService = {
  openInDetachedMode: openInDetachedMode,
};
