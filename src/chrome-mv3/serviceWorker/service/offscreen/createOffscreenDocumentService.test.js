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

import CreateOffscreenDocumentService from "./createOffscreenDocumentService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CreateOffscreenDocumentService", () => {
  describe("::createIfNotExistOffscreenDocument", () => {
    it("should create the offscreen document if it does not exist yet ", async() => {
      expect.assertions(2);
      jest.spyOn(chrome.runtime, "getContexts").mockImplementationOnce(() => []);
      await CreateOffscreenDocumentService.createIfNotExistOffscreenDocument();

      const expectedGetContextsData = {
        contextTypes: ["OFFSCREEN_DOCUMENT"],
        documentUrls: ["chrome-extension://didegimhafipceonhjepacocaffmoppf/offscreens/offscreen.html"]
      };
      const expectedCreateDocumentData = {
        url: "offscreens/offscreen.html",
        reasons: ["WORKERS", "CLIPBOARD"],
        justification: "1. Read/write clipboard as clipboard API is unavailable in MV3 service workers 2. Perform requests to self hosted Passbolt API serving invalid certificate.",
      };
      expect(chrome.runtime.getContexts).toHaveBeenCalledWith(expectedGetContextsData);
      expect(chrome.offscreen.createDocument).toHaveBeenCalledWith(expectedCreateDocumentData);
    });

    it("should not create the offscreen document if it already exist ", async() => {
      expect.assertions(1);
      jest.spyOn(chrome.runtime, "getContexts").mockImplementationOnce(() => ["shallow-offscreen-document-mock"]);
      await CreateOffscreenDocumentService.createIfNotExistOffscreenDocument();
      expect(chrome.offscreen.createDocument).not.toHaveBeenCalled();
    });
  });
});
