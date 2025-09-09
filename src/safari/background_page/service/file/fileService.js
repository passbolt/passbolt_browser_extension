/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.6.0
 */

const SAFARI_APP_ID = "com.passbolt.Passbolt-Safari-Extension";

/**
 * File service
 */
export default class FileService {
  /**
   * Save file on disk with MacOS Safari"s native app.
   *
   * @param {String} filename
   * @param {Blob|String} content
   * @param {String} mimeType mime type
   * @return {Promise<void>}
   */
  static async saveFile(filename, content, mimeType) {
    if (!mimeType) {
      mimeType = "text/plain";
    }

    content = new Blob([content], {type: mimeType});
    const base64Data = await this.blobToDataURL(content);
    const action = "save-file";
    const message = {action, filename, mimeType, base64Data};

    const resp = await chrome.runtime.sendNativeMessage(SAFARI_APP_ID, message);

    if (!resp.ok) {
      throw new Error(resp.error || "Safari file saving failed");
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
        const data = e.target.result;
        const base64Data = data.substring(data.indexOf("base64,") + 7);
        resolve(base64Data);
      };
      a.readAsDataURL(blob);
    });
  }
}
