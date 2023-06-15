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
import PopupHandlerService from "./popupHandlerService";
import browser from "webextension-polyfill";
import MockTabs from "../../../../../test/mocks/mockTabs";
import {v4 as uuid} from "uuid";
import UserAbortsOperationError from "../../error/userAbortsOperationError";
import SsoLoginUrlEntity from "../../model/entity/sso/ssoLoginUrlEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import SsoSettingsEntity from "../../model/entity/sso/ssoSettingsEntity";

let currentBrowserTab = null;
let currentBrowserWindows = null;

const SUPPORTED_LOGIN_URLS = [
  {url: 'https://login.microsoftonline.com', provider: SsoSettingsEntity.AZURE},
  {url: 'https://login.microsoftonline.us', provider: SsoSettingsEntity.AZURE},
  {url: 'https://login.partner.microsoftonline.cn', provider: SsoSettingsEntity.AZURE},
  {url: 'https://accounts.google.com', provider: SsoSettingsEntity.GOOGLE},
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

describe("PopupHandlerService", () => {
  describe("PopupHandlerService", () => {
    const userDomain = "https://fakeurl.passbolt.com";
    const ssoToken = uuid();
    const finalUrl = `${userDomain}/sso/login/dry-run/success?token=${ssoToken}`;
    const thirdPartyUrl = new SsoLoginUrlEntity({url: "https://login.microsoftonline.com"}, SsoSettingsEntity.AZURE);

    it("Should return SSO token when navigation is done to a correct URL in dry-run mode", async() => {
      expect.assertions(4);
      const tabId = uuid();
      browser.windows.create.mockImplementation(async() => ({
        tabs: [{
          id: tabId
        }]
      }));

      const originTabIdCall = 1;

      const service = new PopupHandlerService(userDomain, originTabIdCall, true);
      const promise = service.getSsoTokenFromThirdParty(thirdPartyUrl);

      await runPendingPromises();

      expect(browser.windows.create).toHaveBeenCalledWith({
        url: thirdPartyUrl.url,
        type: "popup",
        width: expect.any(Number),
        height: expect.any(Number)
      });

      expect(browser.tabs.onUpdated.addListener).toHaveBeenCalledWith(expect.any(Function));
      expect(browser.tabs.onRemoved.addListener).toHaveBeenCalledWith(expect.any(Function));

      //Update on the expected tabid as pending
      browser.tabs.onUpdated.triggers(tabId, null, {status: "pending"});
      //Update on the expected tabid as complete but without token
      browser.tabs.onUpdated.triggers(tabId, null, {status: "complete", url: thirdPartyUrl.url});
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
      const service = new PopupHandlerService(userDomain, originTabIdCall);
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

      const service = new PopupHandlerService(userDomain, false);
      const promise = service.getSsoTokenFromThirdParty(thirdPartyUrl);

      await runPendingPromises();

      expect(browser.windows.create).toHaveBeenCalledWith({
        url: thirdPartyUrl.url,
        type: "popup",
        width: expect.any(Number),
        height: expect.any(Number)
      });

      expect(browser.tabs.onUpdated.addListener).toHaveBeenCalledWith(expect.any(Function));
      expect(browser.tabs.onRemoved.addListener).toHaveBeenCalledWith(expect.any(Function));

      //Update on the expected tabid as pending
      browser.tabs.onUpdated.triggers(tabId, null, {status: "pending"});
      //Update on the expected tabid as complete but without token
      browser.tabs.onUpdated.triggers(tabId, null, {status: "complete", url: thirdPartyUrl.url});
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

      const service = new PopupHandlerService();
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

      const service = new PopupHandlerService();
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

      const service = new PopupHandlerService(userDomain, true);
      try {
        await service.getSsoTokenFromThirdParty(new SsoLoginUrlEntity({url: "javascript:console('this would be an XSS')"}));
      } catch (e) {
        expect(e).toStrictEqual(new EntityValidationError("Could not validate entity SsoLoginUrl."));
      }
    });

    it("Should accepy any of the Azure URL", async() => {
      expect.assertions(SUPPORTED_LOGIN_URLS.length);
      const tabId = uuid();
      browser.windows.create.mockImplementation(async() => ({
        tabs: [{
          id: tabId
        }]
      }));

      const service = new PopupHandlerService(userDomain, true);

      for (let i = 0; i < SUPPORTED_LOGIN_URLS.length; i++) {
        const loginUrlInfo = SUPPORTED_LOGIN_URLS[i];
        const loginUrl = new SsoLoginUrlEntity({url: loginUrlInfo.url}, loginUrlInfo.provider);
        service.getSsoTokenFromThirdParty(loginUrl);

        await runPendingPromises();

        expect(browser.windows.create).toHaveBeenCalledWith({
          url: loginUrl.url,
          type: "popup",
          width: expect.any(Number),
          height: expect.any(Number)
        });
      }
    });
  });
});
