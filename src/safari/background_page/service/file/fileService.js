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

import { SendNativeMessageService } from "../nativeMessage/sendNativeMessageService";

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

    content = new Blob([content], { type: mimeType });
    const base64Data = await this.blobToDataURL(content);

    return await SendNativeMessageService.sendNativeMessage("save-file", { filename, mimeType, base64Data });
  }

  /**
   * Blob to base64 string
   * @param {Blob} blob
   * @return {Promise<string>}
   * @private
   */
  static blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = e.target.result;
        const base64Data = data.substring(data.indexOf("base64,") + 7);
        resolve(base64Data);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
      reader.onabort = function () {
        reject(new Error("FileReader aborted"));
      };
      reader.readAsDataURL(blob);
    });
  }
}
