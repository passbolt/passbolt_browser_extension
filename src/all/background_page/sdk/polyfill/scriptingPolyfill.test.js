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
import browser from "./browserPolyfill";

const mockedScriptingJS = jest.spyOn(browser.scripting, "executeScript");
const mockedScriptingCSS = jest.spyOn(browser.scripting, "insertCSS");

describe("Scripting", () => {
  beforeEach(async() => {
    jest.clearAllMocks();
  });
  describe("Scripting::executeScript", () => {
    it("Should insert JS func with a result", async() => {
      expect.assertions(3);
      // data mocked
      const func = test => test;
      const option = {
        func: func,
        args: ["Hello"],
        target: {
          tabId: 1,
          frameIds: [0]
        },
        world: "ISOLATED"
      };
      // mock function
      jest.spyOn(browser.tabs, "executeScript").mockImplementationOnce(() => {
        const result = func("Hello");
        return [result];
      });
      // process
      const result = await browser.scripting.executeScript(option);
      // expectation
      expect(mockedScriptingJS).toHaveBeenCalledWith(option);
      const funcArgs = JSON.stringify(["Hello"]);
      const functionCall = `;${func.name}.apply(window, ${funcArgs});`;
      const codeToInject = func.toString() + functionCall;
      const info = {code: codeToInject, runAt: 'document_end', frameId: 0};
      expect(browser.tabs.executeScript).toHaveBeenCalledWith(1, info);
      expect(result).toStrictEqual([{"result": "Hello"}]);
    });

    it("Should insert JS void func", async() => {
      expect.assertions(3);
      // data mocked
      const func = test => test;
      const option = {
        func: func,
        args: ["Hello"],
        target: {
          tabId: 1,
          frameIds: [0]
        },
        world: "ISOLATED"
      };
      // mock function
      jest.spyOn(browser.tabs, "executeScript").mockImplementationOnce(() => {
        func("Hello");
      });
      // process
      const result = await browser.scripting.executeScript(option);
      // expectation
      expect(mockedScriptingJS).toHaveBeenCalledWith(option);
      const funcArgs = JSON.stringify(["Hello"]);
      const functionCall = `;${func.name}.apply(window, ${funcArgs});`;
      const codeToInject = func.toString() + functionCall;
      const info = {code: codeToInject, runAt: 'document_end', frameId: 0};
      expect(browser.tabs.executeScript).toHaveBeenCalledWith(1, info);
      expect(result).toStrictEqual(undefined);
    });

    it("Should insert JS file", async() => {
      expect.assertions(2);

      const option = {
        files: ["filename.js", "filename2.js"],
        target: {
          tabId: 1,
          frameIds: [0]
        },
        world: "ISOLATED"
      };

      browser.scripting.executeScript(option);

      expect(mockedScriptingJS).toHaveBeenCalledWith(option);
      const info = {file: option.files[0], runAt: 'document_end', frameId: 0};
      expect(browser.tabs.executeScript).toHaveBeenCalledWith(1, info, expect.anything());
    });
  });

  describe("Scripting::insertCSS", () => {
    it("Should insert CSS file", async() => {
      expect.assertions(2);

      const option = {
        files: ["filename.css"],
        target: {
          tabId: 1,
          frameIds: [0]
        }
      };

      browser.scripting.insertCSS(option);

      expect(mockedScriptingCSS).toHaveBeenCalledWith(option);
      const info = {file: option.files[0], runAt: 'document_end', frameId: 0};
      expect(browser.tabs.insertCSS).toHaveBeenCalledWith(1, info, null);
    });
  });
});
