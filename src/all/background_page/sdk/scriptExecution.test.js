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
});
