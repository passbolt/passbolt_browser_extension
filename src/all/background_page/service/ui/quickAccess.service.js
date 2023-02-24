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
import WorkersSessionStorage from "../../../../chrome-mv3/service/sessionStorage/workersSessionStorage";
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
  // Only for MV3 to register the worker in the session storage
  let workerId = null;
  if (browser.runtime.getManifest().manifest_version === 3) {
    workerId = uuidv4();
    queryParameters.push({name: "passbolt", value: workerId});
  }

  const url = await buildDetachedQuickacessUrl(queryParameters);
  const {top, left} = await buildDetachedQuickaccessPosition();

  const type = "popup";
  const width = QUICKACCESS_WINDOW_WIDTH;
  const height = QUICKACCESS_WINDOW_HEIGHT;
  const windowCreateData = {url: url, type: type, left: left, top: top, width: width, height: height};
  const quickAccessWindow = await browser.windows.create(windowCreateData);

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
  if (workerId) {
    const worker = {
      id: workerId,
      name: "QuickAccess",
      tabId: tabId,
      frameId: 0
    };
    await WorkersSessionStorage.addWorker(new WorkerEntity(worker));
  }
}

/**
 * Build the detached quickaccess url.
 * @param {array<{name: string, value: string}>} queryParameters The query parameters to attach to the quick access detached popup url
 * @returns {Promise<string>}
 */
async function buildDetachedQuickacessUrl(queryParameters) {
  const browserExtensionUrl = await browser.action.getPopup({});
  const quickaccessUrl = new URL(browserExtensionUrl);
  // For MV3 we need to remove the parameter passbolt to avoid duplicate
  if (queryParameters.find(parameter => parameter.name === "passbolt")) {
    quickaccessUrl.searchParams.delete("passbolt");
  }
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
