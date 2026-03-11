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
import {
  formDataMixed,
  formDataString,
  formDataBlob,
  formDataFile,
  formDataWithSpecialChars,
} from "./formDataUtils.test.data";
import FormDataUtils from "./formDataUtils";

describe("FormDataUtils", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe("FormDataUtils::formDataToArray", () => {
    it("Should create an array of scalar object", async () => {
      expect.assertions(1);
      // data mocked
      const formData = formDataString();
      // process
      const arrayObject = await FormDataUtils.formDataToArray(formData);
      // expectations
      const expectedArray = [
        { key: "prop1", value: "value 1", type: FormDataUtils.TYPE_SCALAR },
        { key: "prop1", value: "value 2", type: FormDataUtils.TYPE_SCALAR },
      ];
      expect(arrayObject).toStrictEqual(expectedArray);
    });

    it("Should create an array of file object", async () => {
      expect.assertions(1);
      // data mocked
      const formData = formDataFile();
      // process
      const arrayObject = await FormDataUtils.formDataToArray(formData);
      // expectations
      const expectedArray = [
        { key: "file", value: "data:text/plain;base64,dGVzdA==", name: "file 1", type: FormDataUtils.TYPE_FILE },
        { key: "file", value: "data:text/plain;base64,dGVzdA==", name: "file 2", type: FormDataUtils.TYPE_FILE },
      ];
      expect(arrayObject).toStrictEqual(expectedArray);
    });

    it("Should create an array of blob object", async () => {
      expect.assertions(1);
      // data mocked
      const formData = formDataBlob();
      // process
      const arrayObject = await FormDataUtils.formDataToArray(formData);
      // expectations
      const expectedArray = [
        { key: "blob", value: "data:text/plain;base64,dGVzdA==", name: "blob 1", type: FormDataUtils.TYPE_BLOB },
        { key: "blob", value: "data:text/plain;base64,dGVzdA==", name: "blob 2", type: FormDataUtils.TYPE_BLOB },
      ];
      expect(arrayObject).toStrictEqual(expectedArray);
    });

    it("Should create an array of mixed object", async () => {
      expect.assertions(1);
      // data mocked
      const formData = formDataMixed();
      // process
      const arrayObject = await FormDataUtils.formDataToArray(formData);
      // expectations
      const expectedArray = [
        { key: "prop1", value: "value 1", type: FormDataUtils.TYPE_SCALAR },
        { key: "blob", value: "data:text/plain;base64,dGVzdA==", name: "blob 1", type: FormDataUtils.TYPE_BLOB },
      ];
      expect(arrayObject).toStrictEqual(expectedArray);
    });
  });

  describe("FormDataUtils::arrayToFormData", () => {
    it("should form the same formData string from the origin", async () => {
      expect.assertions(1);
      // data mocked
      const formData = formDataString();
      // process
      const arrayObject = await FormDataUtils.formDataToArray(formData);
      const formDataReceived = FormDataUtils.arrayToFormData(arrayObject);
      // expectations
      expect(formData).toStrictEqual(formDataReceived);
    });

    it("should form the same formData mixed from the origin", async () => {
      expect.assertions(1);
      // data mocked
      const formData = formDataMixed();
      // process
      const arrayObject = await FormDataUtils.formDataToArray(formData);
      const formDataReceived = FormDataUtils.arrayToFormData(arrayObject);
      // expectations
      expect(formData).toStrictEqual(formDataReceived);
    });
  });

  describe("FormDataUtils::formDataToString", () => {
    it("should convert scalar values to a URL-encoded string", async () => {
      expect.assertions(1);
      // data mocked
      const formData = formDataString();
      // process
      const result = await FormDataUtils.formDataToString(formData);
      // expectations
      expect(result).toStrictEqual("prop1=value%201&prop1=value%202");
    });

    it("should URL-encode special characters in keys and values", async () => {
      expect.assertions(1);
      // data mocked
      const formData = formDataWithSpecialChars();
      // process
      const result = await FormDataUtils.formDataToString(formData);
      // expectations
      expect(result).toStrictEqual("search%20query=hello%20world&symbols=a%3D1%26b%3D2");
    });

    it("should return an empty string for empty FormData", async () => {
      expect.assertions(1);
      // data mocked
      const formData = new FormData();
      // process
      const result = await FormDataUtils.formDataToString(formData);
      // expectations
      expect(result).toStrictEqual("");
    });
  });
});
