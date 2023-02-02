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
import AzurePopupHandlerService from "./azurePopupHandlerService";
import browser from "webextension-polyfill";
import MockTabs from "../../../../../test/mocks/mockTabs";
import {v4 as uuid} from "uuid";
import UserAbortsOperationError from "../../error/userAbortsOperationError";

let currentBrowserTab = null;
let currentBrowserWindows = null;

const AZURE_SUPPORTED_URLS = [
  'https://login.microsoftonline.com',
  'https://login.microsoftonline.us',
  'https://login.partner.microsoftonline.cn',
];

beforeAll(() => {
  currentBrowserTab = browser.tabs;
  currentBrowserWindows = browser.windows;

  browser.tabs = new MockTabs();
  browser.windows = {
    create: jest.fn()
  };

  jest.clearAllMocks();
});

afterAll(() => {
  browser.tabs = currentBrowserTab;
  browser.windows = currentBrowserWindows;
});

/**
 * Ensures the code inside returned promises are executed.
 * Usefull for the promise with which we can't use await as they won't resolve and we need the code inside to be executed.
 */
function runPendingPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe("AzurePopupHandlerService", () => {
  describe("AzurePopupHandlerService", () => {
    const userDomain = "https://fakeurl.passbolt.com";
    const ssoToken = uuid();
    const finalUrl = `${userDomain}/sso/login/dry-run/success?token=${ssoToken}`;
    const thirdPartyUrl = new URL("https://login.microsoftonline.com");

    it("Should return SSO token when navigation is done to a correct URL in dry-run mode", async() => {
      expect.assertions(4);
      const tabId = uuid();
      browser.windows.create.mockImplementation(async() => ({
        tabs: [{
          id: tabId
        }]
      }));

      const originTabIdCall = 1;

      const service = new AzurePopupHandlerService(userDomain, originTabIdCall, true);
      const promise = service.getSsoTokenFromThirdParty(thirdPartyUrl);

      await runPendingPromises();

      expect(browser.windows.create).toHaveBeenCalledWith({
        url: thirdPartyUrl.toString(),
        type: "popup",
        width: expect.any(Number),
        height: expect.any(Number)
      });

      expect(browser.tabs.onUpdated.addListener).toHaveBeenCalledWith(expect.any(Function));
      expect(browser.tabs.onRemoved.addListener).toHaveBeenCalledWith(expect.any(Function));

      //Update on the expected tabid as pending
      browser.tabs.onUpdated.triggers(tabId, null, {status: "pending"});
      //Update on the expected tabid as complete but without token
      browser.tabs.onUpdated.triggers(tabId, null, {status: "complete", url: thirdPartyUrl.toString()});
      //Update on another tabid as pending with the awaited URL
      browser.tabs.onUpdated.triggers(uuid(), null, {status: "pending", url: finalUrl});
      //Update on the expected tabid as complete with the awaited URL
      browser.tabs.onUpdated.triggers(tabId, null, {status: "complete", url: finalUrl});

      await runPendingPromises();

      expect(await promise).toBe(ssoToken);
    });

    it("Should close the SSO sign-in popup when the tab that calls the popup is being closed by the user", async() => {
      expect.assertions(1);
      const tabId = uuid();
      browser.windows.create.mockImplementation(async() => ({
        tabs: [{
          id: tabId
        }]
      }));

      const originTabIdCall = uuid();
      const service = new AzurePopupHandlerService(userDomain, originTabIdCall);
      const promise = service.getSsoTokenFromThirdParty(thirdPartyUrl);

      await runPendingPromises();

      browser.tabs.onRemoved.triggers(originTabIdCall);
      return expect(promise).rejects.toThrowError(new UserAbortsOperationError("The user closed the tab from where the SSO sign-in initiated"));
    });

    it("Should return SSO token when navigation is done to a correct URL in sign-in mode", async() => {
      expect.assertions(4);
      const finalUrl = `${userDomain}/sso/login/success?token=${ssoToken}`;
      const tabId = uuid();
      browser.windows.create.mockImplementation(async() => ({
        tabs: [{
          id: tabId
        }]
      }));

      const service = new AzurePopupHandlerService(userDomain, false);
      const promise = service.getSsoTokenFromThirdParty(thirdPartyUrl);

      await runPendingPromises();

      expect(browser.windows.create).toHaveBeenCalledWith({
        url: thirdPartyUrl.toString(),
        type: "popup",
        width: expect.any(Number),
        height: expect.any(Number)
      });

      expect(browser.tabs.onUpdated.addListener).toHaveBeenCalledWith(expect.any(Function));
      expect(browser.tabs.onRemoved.addListener).toHaveBeenCalledWith(expect.any(Function));

      //Update on the expected tabid as pending
      browser.tabs.onUpdated.triggers(tabId, null, {status: "pending"});
      //Update on the expected tabid as complete but without token
      browser.tabs.onUpdated.triggers(tabId, null, {status: "complete", url: thirdPartyUrl.toString()});
      //Update on abother tabid as pending with the awaited URL
      browser.tabs.onUpdated.triggers(uuid(), null, {status: "pending", url: finalUrl});
      //Update on the expected tabid as complete with the awaited URL
      browser.tabs.onUpdated.triggers(tabId, null, {status: "complete", url: finalUrl});

      await runPendingPromises();

      expect(await promise).toBe(ssoToken);
    });

    it("Should end the process if the user closed the popup", async() => {
      expect.assertions(1);
      const tabId = uuid();
      browser.windows.create.mockImplementation(async() => ({
        tabs: [{
          id: tabId
        }]
      }));

      const service = new AzurePopupHandlerService();
      const promise = service.getSsoTokenFromThirdParty(thirdPartyUrl);

      await runPendingPromises();

      browser.tabs.onRemoved.triggers(tabId);
      return expect(promise).rejects.toThrowError(new UserAbortsOperationError("The user closed the SSO sign-in popup"));
    });

    it("Should clean up the listeners when the handler is asked to be closed", async() => {
      expect.assertions(3);
      const tabId = uuid();
      browser.windows.create.mockImplementation(async() => ({
        tabs: [{
          id: tabId
        }]
      }));

      const service = new AzurePopupHandlerService();
      service.getSsoTokenFromThirdParty(thirdPartyUrl);

      await runPendingPromises();

      service.closeHandler();

      expect(browser.tabs.onUpdated.removeListener).toHaveBeenCalledWith(expect.any(Function));
      expect(browser.tabs.onRemoved.removeListener).toHaveBeenCalledWith(expect.any(Function));
      expect(browser.tabs.remove).toHaveBeenCalledWith(tabId);
    });

    it("Should throw an exception if the popupUrl is not an Azure URL", async() => {
      expect.assertions(1);
      const tabId = uuid();
      browser.windows.create.mockImplementation(async() => ({
        tabs: [{
          id: tabId
        }]
      }));

      const service = new AzurePopupHandlerService(userDomain, true);
      try {
        await service.getSsoTokenFromThirdParty(new URL("javascript:console('this would be an XSS')"));
      } catch (e) {
        expect(e).toStrictEqual(new Error("Unsupported single sign-on login url"));
      }
    });

    it("Should accepy any of the Azure URL", async() => {
      expect.assertions(AZURE_SUPPORTED_URLS.length);
      const tabId = uuid();
      browser.windows.create.mockImplementation(async() => ({
        tabs: [{
          id: tabId
        }]
      }));

      const service = new AzurePopupHandlerService(userDomain, true);

      for (let i = 0; i < AZURE_SUPPORTED_URLS.length; i++) {
        const url = new URL(AZURE_SUPPORTED_URLS[i]);
        service.getSsoTokenFromThirdParty(url);

        await runPendingPromises();

        expect(browser.windows.create).toHaveBeenCalledWith({
          url: url.toString(),
          type: "popup",
          width: expect.any(Number),
          height: expect.any(Number)
        });
      }
    });
  });
});
