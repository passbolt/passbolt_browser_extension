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
 * @since         5.3.2
 */
import EdgeBackgroundPageClipboardService from "./edgeBackgroundPageClipboardService";

describe("EdgeBackgroundPageClipboardService", () => {
  describe("::writeText", () => {
    it("should write the given data to the clipboard", async() => {
      expect.assertions(8);

      let copiedValue = "";
      const fakeElement = {
        value: "",
        select: jest.fn().mockImplementation(() => { copiedValue = fakeElement.value; }),
      };
      // Faking document for this specific context
      global.document = {
        createElement: () => fakeElement,
        body: {
          appendChild: jest.fn(),
          removeChild: jest.fn(),
        },
        execCommand: jest.fn()
      };

      document.execCommand.mockImplementation(() => {});

      const dataToWrite = "text-to-copy";
      await EdgeBackgroundPageClipboardService.writeText(dataToWrite);

      expect(copiedValue).toStrictEqual(dataToWrite);
      expect(fakeElement.select).toHaveBeenCalledTimes(1);
      expect(document.body.appendChild).toHaveBeenCalledTimes(1);
      expect(document.body.appendChild).toHaveBeenCalledWith(fakeElement);
      expect(document.body.removeChild).toHaveBeenCalledTimes(1);
      expect(document.body.removeChild).toHaveBeenCalledWith(fakeElement);
      expect(document.execCommand).toHaveBeenCalledTimes(1);
      expect(document.execCommand).toHaveBeenCalledWith("cut");
    });
  });
});
