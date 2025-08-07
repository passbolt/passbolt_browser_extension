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
 * @since         5.4.0
 */
import BrowserTabService from "../../service/ui/browserTab.service";
import PrepareResourceController from "./prepareResourceController";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";

describe("PrepareResourceController", () => {
  describe("::exec", () => {
    it("should return the resource in cache and clear the cache", async() => {
      expect.assertions(2);

      const controller = new PrepareResourceController();
      const expectedResult = defaultResourceDto();

      await browser.storage.session.set({"resourceInProgress": expectedResult});

      const result = await controller.exec();

      expect(result).toStrictEqual(expectedResult);

      const cache = await browser.storage.session.get("resourceInProgress");
      expect(cache["resourceInProgress"]).toBeFalsy();
    });

    it("should return the information from the tab if the cache is empty", async() => {
      expect.assertions(2);

      const controller = new PrepareResourceController();
      const mockedTabInfo = {
        title: "page from test",
        url: 'https://www.passbolt.com',
      };

      await browser.storage.session.set({"resourceInProgress": null});
      jest.spyOn(BrowserTabService, "getCurrent").mockImplementation(() => mockedTabInfo);

      const result = await controller.exec();

      expect(result.name).toStrictEqual(mockedTabInfo.title);
      expect(result.uris).toStrictEqual([mockedTabInfo.url]);
    });

    it("should return the information from the tab given a tabId if the cache is empty", async() => {
      expect.assertions(2);

      const controller = new PrepareResourceController();
      const mockedTabInfo = {
        title: "page from test",
        url: 'https://www.passbolt.com',
      };
      const tabId = 42;

      await browser.storage.session.set({"resourceInProgress": null});
      jest.spyOn(BrowserTabService, "getById").mockImplementation(() => mockedTabInfo);

      const result = await controller.exec(tabId);

      expect(result.name).toStrictEqual(mockedTabInfo.title);
      expect(result.uris).toStrictEqual([mockedTabInfo.url]);
    });
  });
});
