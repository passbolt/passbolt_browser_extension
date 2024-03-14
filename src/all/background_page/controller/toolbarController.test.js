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
 * @since         3.3.0
 */

import ToolbarController from "./toolbarController";
import AccountEntity from "../model/entity/account/accountEntity";
import {defaultAccountDto} from "../model/entity/account/accountEntity.test.data";
import GetLegacyAccountService from "../service/account/getLegacyAccountService";
import {BrowserExtensionIconService} from "../service/ui/browserExtensionIcon.service";
import {defaultResourceDtosCollection} from "../model/entity/resource/resourcesCollection.test.data";
import ResourceLocalStorage from "../service/local_storage/resourceLocalStorage";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceTypeLocalStorage from "../service/local_storage/resourceTypeLocalStorage";

jest.useFakeTimers();

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("ToolbarController", () => {
  const browserExtensionIconServiceActivateMock = jest.fn();
  const browserExtensionIconServiceDeactivateMock = jest.fn();
  const browserExtensionIconServiceSetCountMock = jest.fn();

  beforeEach(() => {
    jest.spyOn(BrowserExtensionIconService, "activate").mockImplementation(browserExtensionIconServiceActivateMock);
    jest.spyOn(BrowserExtensionIconService, "deactivate").mockImplementation(browserExtensionIconServiceDeactivateMock);
    jest.spyOn(BrowserExtensionIconService, "setSuggestedResourcesCount").mockImplementation(browserExtensionIconServiceSetCountMock);
  });

  describe("handleUserLoggedIn", () => {
    it("Given the user is on a tab which has no suggested resource for, it should activate the passbolt icon and display no suggested resource.", async() => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());
      const toolbarController = new ToolbarController();

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({value: "csrf-token"}));
      jest.spyOn(browser.tabs, "query").mockImplementation(() => [{url: 'https://www.wherever.com'}]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementation(() => resourceTypesCollectionDto());

      await toolbarController.handleUserLoggedIn();

      expect(browserExtensionIconServiceActivateMock).toHaveBeenCalled();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenCalledWith(0);
    });

    it("Given the user is on a tab which has suggested resource for, it should activate the passbolt icon and display the number of suggested resources.", async() => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());
      const toolbarController = new ToolbarController();

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({value: "csrf-token"}));
      jest.spyOn(browser.tabs, "query").mockImplementation(() => [{url: 'https://www.passbolt.com'}]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementation(() => resourceTypesCollectionDto());

      await toolbarController.handleUserLoggedIn();

      expect(browserExtensionIconServiceActivateMock).toHaveBeenCalled();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenCalledWith(4);
    });
  });

  describe("handleUserLoggedOut", () => {
    it("Given the user signs out, it should deactivate the passbolt icon.", async() => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());
      const toolbarController = new ToolbarController();

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({value: "csrf-token"}));
      jest.spyOn(browser.tabs, "query").mockImplementation(() => [{url: 'https://www.wherever.com'}]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementation(() => resourceTypesCollectionDto());

      await toolbarController.handleUserLoggedIn();
      await toolbarController.handleUserLoggedOut();

      expect(browserExtensionIconServiceDeactivateMock).toHaveBeenCalled();
    });
  });

  describe("handleSuggestedResourcesOnUpdatedTab", () => {
    it("Given the user navigates to a url having suggested resources, it should change the passbolt icon suggested resources count.", async() => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());
      const toolbarController = new ToolbarController();

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({value: "csrf-token"}));
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{url: 'https://www.wherever.com'}]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementation(() => resourceTypesCollectionDto());

      await toolbarController.handleUserLoggedIn();

      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{url: 'https://www.passbolt.com'}]);
      await toolbarController.handleSuggestedResourcesOnUpdatedTab(null, {url: "https://www.passbolt.com"});

      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(4);
    });
  });

  describe("handleSuggestedResourcesOnActivatedTab", () => {
    it("Given the user activates a tab having suggested resources, it should change the passbolt icon suggested resources count.", async() => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());
      const toolbarController = new ToolbarController();

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({value: "csrf-token"}));
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{url: 'https://www.wherever.com'}]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementation(() => resourceTypesCollectionDto());

      await toolbarController.handleUserLoggedIn();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(0);
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{url: 'https://www.passbolt.com'}]);
      await toolbarController.handleSuggestedResourcesOnActivatedTab();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(4);
    });
  });

  describe("handleSuggestedResourcesOnFocusedWindow", () => {
    it("Given the user switches to a window with a tab having suggested resources, it should change the passbolt icon suggested resources count.", async() => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());
      const toolbarController = new ToolbarController();

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({value: "csrf-token"}));
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{url: 'https://www.wherever.com'}]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementation(() => resourceTypesCollectionDto());

      await toolbarController.handleUserLoggedIn();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(0);
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{url: 'https://www.passbolt.com'}]);
      await toolbarController.handleSuggestedResourcesOnFocusedWindow(42);
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(4);
    });

    it("Given the user switches to another application, it should reset the passbolt icon suggested resources count.", async() => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());
      const toolbarController = new ToolbarController();

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({value: "csrf-token"}));
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{url: 'https://www.passbolt.com'}]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage, "get").mockImplementation(() => resourceTypesCollectionDto());

      await toolbarController.handleUserLoggedIn();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(4);
      await toolbarController.handleSuggestedResourcesOnFocusedWindow(browser.windows.WINDOW_ID_NONE);
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(0);
    });
  });
});
