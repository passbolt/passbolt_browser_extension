/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since        3.9.0
 */
import WorkerService from "../worker/workerService";
import ScriptExecution from "../../sdk/scriptExecution";
import browser from "../../sdk/polyfill/browserPolyfill";

/**
 * File service
 */
class FileService {
  /**
   * Save file on disk using download
   *
   * @param {String} filename
   * @param {Blob|String} content
   * @param {String} mimeType mime type
   * @param {int} tabId
   * @return {Promise<void>}
   */
  static async saveFile(filename, content, mimeType, tabId) {
    if (!mimeType) {
      mimeType = "text/plain";
    }

    content = new Blob([content], {type: mimeType});
    const dataUrl = await this.blobToDataURL(content);

    if (chrome.downloads) {
      const scriptExecution = new ScriptExecution(tabId);
      // With MV3 API, it's not possible anymore to use the function URL.createObjectURL or URL.revokeObjectURL
      const url = await scriptExecution.injectBase64UrlToCreateObjectURL(dataUrl);
      await browser.downloads.download({url, filename});
      scriptExecution.injectURLToRevoke(url);
    } else {
      const fileWorker = await WorkerService.get('FileIframe', tabId);
      fileWorker.port.emit('passbolt.file-iframe.download', filename, dataUrl);
    }
  }

  /**
   * Blob to Data Url.
   * @private
   * @param blob
   * @return {Promise}
   */
  static blobToDataURL(blob) {
    return new Promise(resolve => {
      const a = new FileReader();
      a.onload = function(e) {
        resolve(e.target.result);
      };
      a.readAsDataURL(blob);
    });
  }
}

export default FileService;
