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
 * @since         3.8.0
 */
import UserSettings from "../model/userSettings/userSettings";
import AppBootstrap from "./appBootstrapPagemod";
import WorkersSessionStorage from "../service/sessionStorage/workersSessionStorage";
import WorkerEntity from "../model/entity/worker/workerEntity";
import ScriptExecution from "../sdk/scriptExecution";
import Pagemod from "./pagemod";
import { PortEvents } from "../event/portEvents";
import { AppBootstrapEvents } from "../event/appBootstrapEvents";
import GetActiveAccountService from "../service/account/getActiveAccountService";
import UserActiveSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import AccountEntity from "../model/entity/account/accountEntity";
import { defaultAccountDto } from "../model/entity/account/accountEntity.test.data";
import {
  defaultUserActiveSessionDto,
  offlineUserActiveSessionDto,
} from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity.test.data";
import FindAndUpdateActiveSessionLocalStorageService from "../service/activeSession/findAndUpdateActiveSessionLocalStorageService";
import PassboltBadResponseError from "../error/passboltBadResponseError";
import AuthenticationStatusService from "../service/authenticationStatusService";
import ServerStatusApiService from "../service/api/status/serverStatusApiService";

const spyAddWorker = jest.spyOn(WorkersSessionStorage, "addWorkerAndEvictSameFrame");
jest.spyOn(ScriptExecution.prototype, "injectPortname").mockImplementation(jest.fn());
jest.spyOn(ScriptExecution.prototype, "injectCss").mockImplementation(jest.fn());
jest.spyOn(ScriptExecution.prototype, "injectJs").mockImplementation(jest.fn());
jest.spyOn(PortEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(AppBootstrapEvents, "listen").mockImplementation(jest.fn());

describe("AppBootstrap", () => {
  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("AppBootstrap::injectFile", () => {
    it("Should inject file", async () => {
      expect.assertions(10);
      // process
      await AppBootstrap.injectFiles(1, 0);
      // expectations
      expect(spyAddWorker).toHaveBeenCalledWith(expect.any(WorkerEntity));
      expect(spyAddWorker).toHaveBeenCalledTimes(1);
      expect(ScriptExecution.prototype.injectPortname).toHaveBeenCalledTimes(1);
      expect(ScriptExecution.prototype.injectCss).toHaveBeenCalledWith(AppBootstrap.contentStyleFiles);
      expect(ScriptExecution.prototype.injectJs).toHaveBeenCalledWith(AppBootstrap.contentScriptFiles);
      expect(AppBootstrap.contentStyleFiles).toStrictEqual([
        "webAccessibleResources/css/themes/default/ext_external.min.css",
      ]);
      expect(AppBootstrap.contentScriptFiles).toStrictEqual([
        "contentScripts/js/dist/vendors.js",
        "contentScripts/js/dist/app.js",
      ]);
      expect(AppBootstrap.events).toStrictEqual([PortEvents, AppBootstrapEvents]);
      expect(AppBootstrap.mustReloadOnExtensionUpdate).toBeTruthy();
      expect(AppBootstrap.appName).toBe("AppBootstrap");
    });
  });

  describe("AppBootstrap::isConstraintValidated", () => {
    it("Should be able to attach app bootstrap pagemod to browser frame", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => new AccountEntity(defaultAccountDto()));
      jest
        .spyOn(FindAndUpdateActiveSessionLocalStorageService.prototype, "findAndUpdateAuthenticationStatus")
        .mockImplementation(async () => new UserActiveSessionEntity(defaultUserActiveSessionDto()));
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
      const result = await AppBootstrap.canBeAttachedTo({
        frameId: Pagemod.TOP_FRAME_ID,
        url: "https://passbolt.dev/app",
      });
      expect(result).toBeTruthy();
    });

    describe.each([
      { scenario: "No domain", url: "app", frameId: Pagemod.TOP_FRAME_ID },
      { scenario: "Not top frame", url: "https://passbolt.dev/app", frameId: 1 },
    ])("Should not be able to attach a pagemod to browser frame", (_props) => {
      it(`Should be able to attach a pagemod to browser frame: ${_props.scenario}`, async () => {
        expect.assertions(1);
        const result = await AppBootstrap.canBeAttachedTo({ frameId: _props.frameId, url: _props.url });
        expect(result).toBeFalsy();
      });
    });

    it("Should not be able to attach a pagemod if the user is not valid", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => {
        throw new Error();
      });
      // process
      const result = await AppBootstrap.canBeAttachedTo({ frameId: 0 });
      // expectations
      expect(result).toBeFalsy();
    });

    it("Should not be able to attach a pagemod if the user is not authenticated", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => {});
      jest
        .spyOn(FindAndUpdateActiveSessionLocalStorageService.prototype, "findAndUpdateAuthenticationStatus")
        .mockImplementation(
          async () => new UserActiveSessionEntity(defaultUserActiveSessionDto({ is_authenticated: false })),
        );
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt");
      // process
      const constraint = await AppBootstrap.canBeAttachedTo({ frameId: 0 });
      // expectations
      expect(constraint).toBeFalsy();
    });

    it("Should not be able to attach a pagemod if the user is authenticated offline", async () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => {});
      jest
        .spyOn(FindAndUpdateActiveSessionLocalStorageService.prototype, "findAndUpdateAuthenticationStatus")
        .mockImplementation(
          async () => new UserActiveSessionEntity(offlineUserActiveSessionDto({ is_authenticated: false })),
        );
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt");
      // process
      const constraint = await AppBootstrap.canBeAttachedTo({ frameId: 0 });
      // expectations
      expect(constraint).toBeFalsy();
    });

    it("Should not be able to attach a pagemod if the authentication status threw an error", async () => {
      expect.assertions(1);

      jest.spyOn(GetActiveAccountService, "get").mockImplementation(() => new AccountEntity(defaultAccountDto()));
      // An API error occured
      jest.spyOn(ServerStatusApiService.prototype, "find").mockRejectedValue(() => true);
      jest
        .spyOn(AuthenticationStatusService.prototype, "isAuthenticated")
        .mockRejectedValue(new PassboltBadResponseError());
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");

      const result = await AppBootstrap.canBeAttachedTo({
        frameId: Pagemod.TOP_FRAME_ID,
        url: "https://passbolt.dev/app",
      });

      expect(result).toEqual(false);
    });
  });

  describe("AppBootstrap::attachEvents", () => {
    it("Should attach events", async () => {
      expect.assertions(2);
      // data mocked
      const port = {
        on: () => jest.fn(),
        _port: {
          sender: {
            tab: {
              url: "https://localhost",
            },
          },
        },
      };
      // process
      await AppBootstrap.attachEvents(port);
      // expectations
      const worker = { port: port, tab: port._port.sender.tab, name: AppBootstrap.appName };
      expect(PortEvents.listen).toHaveBeenCalledWith(worker);
      expect(AppBootstrapEvents.listen).toHaveBeenCalledWith(worker);
    });
  });
});
