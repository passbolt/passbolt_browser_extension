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
 * @since         3.9.0
 */
import browser from "./polyfill/browserPolyfill";
import ScriptExecution from "./scriptExecution";

const mockedScriptingJS = jest.spyOn(browser.scripting, "executeScript");
const mockedScriptingCSS = jest.spyOn(browser.scripting, "insertCSS");

describe("ScriptExecution", () => {
  describe("ScriptExecution::injectPortname", () => {
    it("Should insert JS func", async() => {
      expect.assertions(1);
      const scriptExecution = new ScriptExecution(1);
      const portname = "portname";

      const option = {
        func: expect.anything(),
        args: [portname],
        target: {
          tabId: 1,
          frameIds: [0]
        },
        world: "ISOLATED"
      };

      scriptExecution.injectPortname(portname);

      expect(mockedScriptingJS).toHaveBeenCalledWith(option);
    });
  });

  describe("ScriptExecution::injectJs", () => {
    it("Should insert JS files", async() => {
      expect.assertions(1);
      const scriptExecution = new ScriptExecution(2);
      const files = ["filename.js", "filename2.js"];

      const option = {
        files: files,
        target: {
          tabId: 2,
          frameIds: [0]
        },
        world: "ISOLATED"
      };

      scriptExecution.injectJs(files);

      expect(mockedScriptingJS).toHaveBeenCalledWith(option);
    });
  });

  describe("ScriptExecution::injectCSS", () => {
    it("Should insert CSS file", async() => {
      expect.assertions(1);
      const scriptExecution = new ScriptExecution(3);
      const files = ["filename.css", "filename2.css"];

      const option = {
        files: files,
        target: {
          tabId: 3,
          frameIds: [0]
        }
      };

      scriptExecution.injectCss(files);

      expect(mockedScriptingCSS).toHaveBeenCalledWith(option);
    });
  });

  describe("ScriptExecution::injectBase64UrlToCreateObjectURL", () => {
    it("Should insert JS func", async() => {
      expect.assertions(2);
      // data mocked
      const dataUrl = "data:text/plain;base64,VGV4dA==";
      self.URL.createObjectURL = jest.fn();
      const option = {
        func: expect.anything(),
        args: [dataUrl],
        target: {
          tabId: 1,
          frameIds: [0]
        },
        world: "ISOLATED"
      };
      const resultUrl = "blob:https://passbolt.dev/8a3e66b9-4646-4077-815a-5978936aa6d6";
      // mock function
      mockedScriptingJS.mockImplementationOnce(script => {
        const url = script.func.apply(null, script.args);
        return [{result: url}];
      });
      jest.spyOn(self.URL, "createObjectURL").mockImplementationOnce(() => resultUrl);
      // process
      const scriptExecution = new ScriptExecution(1);
      const url = await scriptExecution.injectBase64UrlToCreateObjectURL(dataUrl);
      // expectation
      expect(mockedScriptingJS).toHaveBeenCalledWith(option);
      expect(url).toStrictEqual(resultUrl);
    });
  });

  describe("ScriptExecution::injectURLToRevoke", () => {
    it("Should insert JS func", async() => {
      expect.assertions(2);
      // data mocked
      const url = "blob:https://passbolt.dev/8a3e66b9-4646-4077-815a-5978936aa6d6";
      self.URL.revokeObjectURL = jest.fn();
      const option = {
        func: expect.anything(),
        args: [url],
        target: {
          tabId: 1,
          frameIds: [0]
        },
        world: "ISOLATED"
      };
      // mock function
      mockedScriptingJS.mockImplementationOnce(async script => {
        script.func.apply(null, script.args);
      });
      // process
      const scriptExecution = new ScriptExecution(1);
      scriptExecution.injectURLToRevoke(url);
      // expectation
      expect(mockedScriptingJS).toHaveBeenCalledWith(option);
      expect(self.URL.revokeObjectURL).toHaveBeenCalledWith(url);
    });
  });
});
