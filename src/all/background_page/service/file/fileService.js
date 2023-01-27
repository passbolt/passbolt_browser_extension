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

import {Config} from "../../model/config";
import {Worker} from "../../model/worker";
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
   * @param {int} tabid
   * @return {Promise}
   */
  static saveFile(filename, content, mimeType, tabid) {
    if (!mimeType) {
      mimeType = "text/plain";
    }
    content = new Blob([content], {type: mimeType});

    return new Promise(resolve => {
      if (chrome.downloads) {
        const url = self.URL.createObjectURL(content);
        /*
         * Don't propose the "save as dialog" if running the test, the tests need the file to be automatically saved
         * in the default downloads directory.
         */
        const saveAs = !Config.isDebug();
        browser.downloads.download({url: url, filename: filename, saveAs: saveAs})
          .then(() => {
            self.URL.revokeObjectURL(url);
            resolve();
          });
      } else {
        this.blobToDataURL(content)
          .then(dataUrl => {
            const fileWorker = Worker.get('FileIframe', tabid);
            fileWorker.port.emit('passbolt.file-iframe.download', filename, dataUrl);
            resolve();
          });
      }
    });
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
