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
 * @since         4.8.0
 */

import Base64Utils from "./base64";

/**
 * The class that deals with Passbolt to convert formData.
 */
class FormDataUtils {
  /**
   * Transform a form data to an array of object
   * @param {FormData} formData The form data
   * @return {Promise<Array<Object>>}
   */
  static async formDataToArray(formData) {
    const formDataSerialized = [];
    for (const [key, value] of formData.entries()) {
      const formDataObject = {
        key: key
      };
      // BLOB in FormData is transformed into a File
      if (value instanceof File) {
        formDataObject.value = await Base64Utils.blobToBase64(value);
        formDataObject.name = value.name;
        formDataObject.type = FormDataUtils.TYPE_FILE;
      } else {
        formDataObject.value = value;
        formDataObject.type = FormDataUtils.TYPE_SCALAR;
      }
      formDataSerialized.push(formDataObject);
    }
    return formDataSerialized;
  }

  /**
   * Transform an array of object to a form data
   * @param {Array<Object>} array
   * @return {FormData}
   */
  static arrayToFormData(array) {
    const formData = new FormData();
    array.forEach(data => {
      if (data.type === FormDataUtils.TYPE_SCALAR) {
        formData.append(data.key, data.value);
      } else {
        const base64UrlSplit = data.value.split(',');
        const blobBase64 = base64UrlSplit[1];
        const mimeType = base64UrlSplit[0].split(':')[1].split(';')[0];
        const blob = Base64Utils.base64ToBlob(blobBase64, mimeType);
        formData.append(data.key, blob, data.name);
      }
    });
    return formData;
  }

  /**
   * Get the type scalar
   * @return {string}
   */
  static get TYPE_SCALAR() {
    return "SCALAR";
  }

  /**
   * Get the type file
   * @return {string}
   */
  static get TYPE_FILE() {
    return "FILE";
  }

  /**
   * Get the type blob
   * @return {string}
   * @constructor
   */
  static get TYPE_BLOB() {
    return "FILE";
  }
}

export default FormDataUtils;
