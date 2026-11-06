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

import toolbarService from "./toolbarService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import GetLegacyAccountService from "../account/getLegacyAccountService";
import { BrowserExtensionIconService } from "../ui/browserExtensionIcon.service";
import { defaultResourceDtosCollection } from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import { resourceTypesCollectionDto } from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceTypeLocalStorage from "../local_storage/resourceTypeLocalStorage";
import OpenWebsiteGettingStartedPageService from "../ui/openWebsiteGettingStartedPageService";
import OpenTrustedDomainTabService from "../ui/openTrustedDomainTabService";
import GetActiveAccountService from "../account/getActiveAccountService";
import UserActiveSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import {
  defaultUserActiveSessionDto,
  offlineUserActiveSessionDto,
} from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity.test.data";
import GetOrFindActiveSessionService from "../activeSession/getOrFindActiveSessionService";
import {
  resourceStandaloneCustomFieldsDto,
  resourceStandaloneNoteDto,
} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import { defaultResourceMetadataDto } from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity.test.data";

jest.useFakeTimers();

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("ToolbarService", () => {
  const browserExtensionIconServiceActivateMock = jest.fn();
  const browserExtensionIconServiceDeactivateMock = jest.fn();
  const browserExtensionIconServiceSetCountMock = jest.fn();

  beforeEach(() => {
    toolbarService.tabUrl = null;
    jest.spyOn(BrowserExtensionIconService, "activate").mockImplementation(browserExtensionIconServiceActivateMock);
    jest.spyOn(BrowserExtensionIconService, "deactivate").mockImplementation(browserExtensionIconServiceDeactivateMock);
    jest
      .spyOn(BrowserExtensionIconService, "setSuggestedResourcesCount")
      .mockImplementation(browserExtensionIconServiceSetCountMock);
    // For an online session, GetOrFindResourceTypesService checks the cache staleness against the storage
    // metadata; keep the mocked cache fresh so it is served without reading the storage.
    jest.spyOn(ResourceTypeLocalStorage.prototype, "isStaleSinceLastLoggedIn").mockImplementation(() => false);
  });

  describe("handleUserLoggedIn", () => {
    it("Given the user is on a tab which has no suggested resource for, it should activate the passbolt icon and display no suggested resource.", async () => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({ value: "csrf-token" }));
      jest.spyOn(browser.tabs, "query").mockImplementation(() => [{ url: "https://www.wherever.com" }]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage.prototype, "getData").mockImplementation(() => resourceTypesCollectionDto());
      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockImplementation(() => ({ isAuthenticated: true }));

      await toolbarService.handleUserLoggedIn();

      expect(browserExtensionIconServiceActivateMock).toHaveBeenCalled();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenCalledWith(0);
    });

    it("Given the user is on a tab which has suggested resource for, it should activate the passbolt icon and display the number of suggested resources.", async () => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({ value: "csrf-token" }));
      jest.spyOn(browser.tabs, "query").mockImplementation(() => [{ url: "https://www.passbolt.com" }]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage.prototype, "getData").mockImplementation(() => resourceTypesCollectionDto());
      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockImplementation(() => ({ isAuthenticated: true }));

      await toolbarService.handleUserLoggedIn();

      expect(browserExtensionIconServiceActivateMock).toHaveBeenCalled();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenCalledWith(4);
    });

    it.each([
      { session: "online", sessionDto: defaultUserActiveSessionDto() },
      { session: "offline", sessionDto: offlineUserActiveSessionDto() },
    ])(
      "Given the user is $session on a tab matching a note and a custom fields resource, it should count them in the suggested resources.",
      async ({ sessionDto }) => {
        expect.assertions(1);
        const account = new AccountEntity(defaultAccountDto());
        const matchingNote = resourceStandaloneNoteDto({
          metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
        });
        const matchingCustomFields = resourceStandaloneCustomFieldsDto({
          metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
        });

        jest.spyOn(browser.cookies, "get").mockImplementation(() => ({ value: "csrf-token" }));
        jest.spyOn(browser.tabs, "query").mockImplementation(() => [{ url: "https://www.passbolt.com" }]);
        jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
        jest
          .spyOn(ResourceLocalStorage, "get")
          .mockImplementation(() => [...defaultResourceDtosCollection(), matchingNote, matchingCustomFields]);
        jest
          .spyOn(ResourceTypeLocalStorage.prototype, "getData")
          .mockImplementation(() => resourceTypesCollectionDto());
        jest
          .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
          .mockImplementation(() => new UserActiveSessionEntity(sessionDto));

        await toolbarService.handleUserLoggedIn();

        expect(browserExtensionIconServiceSetCountMock).toHaveBeenCalledWith(6);
      },
    );
  });

  describe("handleUserLoggedOut", () => {
    it("Given the user signs out, it should deactivate the passbolt icon.", async () => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({ value: "csrf-token" }));
      jest.spyOn(browser.tabs, "query").mockImplementation(() => [{ url: "https://www.wherever.com" }]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage.prototype, "getData").mockImplementation(() => resourceTypesCollectionDto());
      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockImplementation(() => new UserActiveSessionEntity(defaultUserActiveSessionDto({ is_authenticated: true })));

      await toolbarService.handleUserLoggedIn();
      await toolbarService.handleUserLoggedOut();

      expect(browserExtensionIconServiceDeactivateMock).toHaveBeenCalled();
    });
  });

  describe("handleSuggestedResourcesOnUpdatedTab", () => {
    it("Given the user navigates to a url having suggested resources, it should change the passbolt icon suggested resources count.", async () => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({ value: "csrf-token" }));
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{ url: "https://www.wherever.com" }]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage.prototype, "getData").mockImplementation(() => resourceTypesCollectionDto());
      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockImplementation(() => new UserActiveSessionEntity(defaultUserActiveSessionDto({ is_authenticated: true })));

      await toolbarService.handleUserLoggedIn();

      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{ url: "https://www.passbolt.com" }]);
      await toolbarService.handleSuggestedResourcesOnUpdatedTab(null, { url: "https://www.passbolt.com" });

      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(4);
    });
  });

  describe("handleSuggestedResourcesOnActivatedTab", () => {
    it("Given the user activates a tab having suggested resources, it should change the passbolt icon suggested resources count.", async () => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({ value: "csrf-token" }));
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{ url: "https://www.wherever.com" }]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage.prototype, "getData").mockImplementation(() => resourceTypesCollectionDto());
      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockImplementation(() => new UserActiveSessionEntity(defaultUserActiveSessionDto({ is_authenticated: true })));

      await toolbarService.handleUserLoggedIn();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(0);
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{ url: "https://www.passbolt.com" }]);
      await toolbarService.handleSuggestedResourcesOnActivatedTab();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(4);
    });
  });

  describe("handleSuggestedResourcesOnFocusedWindow", () => {
    it("Given the user switches to a window with a tab having suggested resources, it should change the passbolt icon suggested resources count.", async () => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({ value: "csrf-token" }));
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{ url: "https://www.wherever.com" }]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage.prototype, "getData").mockImplementation(() => resourceTypesCollectionDto());
      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockImplementation(() => new UserActiveSessionEntity(defaultUserActiveSessionDto({ is_authenticated: true })));

      await toolbarService.handleUserLoggedIn();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(0);
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{ url: "https://www.passbolt.com" }]);
      await toolbarService.handleSuggestedResourcesOnFocusedWindow(42);
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(4);
    });

    it("Given the user switches to another application, it should reset the passbolt icon suggested resources count.", async () => {
      expect.assertions(2);
      const account = new AccountEntity(defaultAccountDto());

      jest.spyOn(browser.cookies, "get").mockImplementation(() => ({ value: "csrf-token" }));
      jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => [{ url: "https://www.passbolt.com" }]);
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => defaultResourceDtosCollection());
      jest.spyOn(ResourceTypeLocalStorage.prototype, "getData").mockImplementation(() => resourceTypesCollectionDto());
      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockImplementation(() => new UserActiveSessionEntity(defaultUserActiveSessionDto({ is_authenticated: true })));

      await toolbarService.handleUserLoggedIn();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(4);
      await toolbarService.handleSuggestedResourcesOnFocusedWindow(browser.windows.WINDOW_ID_NONE);
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenLastCalledWith(0);
    });

    it("Given the user switches to another application, it should not change the passbolt icon if user is not authenticated.", async () => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());

      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockImplementation(
          () => new UserActiveSessionEntity(defaultUserActiveSessionDto({ is_authenticated: false })),
        );

      await toolbarService.handleSuggestedResourcesOnFocusedWindow(42);
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenCalledTimes(0);
    });

    it("Given an anonymous user switches to another application, it should not change the passbolt icon.", async () => {
      expect.assertions(1);

      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => {
        throw Error("The user is not set");
      });

      await toolbarService.handleSuggestedResourcesOnActivatedTab();
      expect(browserExtensionIconServiceSetCountMock).toHaveBeenCalledTimes(0);
    });
  });

  describe("handleIconToolbarClicked", () => {
    it("Given that no account is set on the local storage, a tab should be opened on the passbolt start URL.", async () => {
      expect.assertions(1);

      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => {
        throw new Error("The user is not set");
      });
      jest.spyOn(OpenWebsiteGettingStartedPageService.prototype, "openTab").mockImplementation(() => {});

      await toolbarService.handleIconToolbarClicked();

      expect(OpenWebsiteGettingStartedPageService.prototype.openTab).toHaveBeenCalledTimes(1);
    });

    it("Given that an account is set on the local storage, the popup should be set with the right URL and the popup should be opened", async () => {
      expect.assertions(3);

      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => new AccountEntity(defaultAccountDto()));
      jest.spyOn(browser.browserAction, "setPopup").mockImplementation(() => {});
      jest.spyOn(browser.browserAction, "openPopup").mockImplementation(() => {});

      await toolbarService.handleIconToolbarClicked();

      expect(browser.browserAction.setPopup).toHaveBeenCalledTimes(1);
      expect(browser.browserAction.setPopup).toHaveBeenCalledWith({
        popup: "webAccessibleResources/quickaccess.html?passbolt=quickaccess",
      });
      expect(browser.browserAction.openPopup).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleShortcutPressed", () => {
    beforeEach(() => {
      jest.spyOn(OpenWebsiteGettingStartedPageService.prototype, "openTab").mockImplementation(() => {});
      jest.spyOn(OpenTrustedDomainTabService.prototype, "openTab").mockImplementation(() => {});
    });

    it("Given that no account is set on the local storage, a tab should be opened on the passbolt start URL.", async () => {
      expect.assertions(2);

      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => {
        throw new Error("The user is not set");
      });

      await toolbarService.handleShortcutPressed("passbolt-open");

      expect(OpenWebsiteGettingStartedPageService.prototype.openTab).toHaveBeenCalledTimes(1);
      expect(OpenTrustedDomainTabService.prototype.openTab).not.toHaveBeenCalled();
    });

    it("Given that an account is set on the local storage, a tab should be opened on the trusted domain.", async () => {
      expect.assertions(2);

      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => new AccountEntity(defaultAccountDto()));

      await toolbarService.handleShortcutPressed("passbolt-open");

      expect(OpenTrustedDomainTabService.prototype.openTab).toHaveBeenCalledTimes(1);
      expect(OpenWebsiteGettingStartedPageService.prototype.openTab).not.toHaveBeenCalled();
    });
  });
});
