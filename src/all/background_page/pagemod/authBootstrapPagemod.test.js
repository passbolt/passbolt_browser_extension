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
import User from "../model/user";
import UserSettings from "../model/userSettings/userSettings";
import AuthBootstrap from "./authBootstrapPagemod";
import WorkersSessionStorage from "../service/sessionStorage/workersSessionStorage";
import WorkerEntity from "../model/entity/worker/workerEntity";
import ScriptExecution from "../sdk/scriptExecution";
import {PortEvents} from "../event/portEvents";
import each from "jest-each";
import Pagemod from "./pagemod";

const spyAddWorker = jest.spyOn(WorkersSessionStorage, "addWorker");
jest.spyOn(ScriptExecution.prototype, "injectPortname").mockImplementation(jest.fn());
jest.spyOn(ScriptExecution.prototype, "injectCss").mockImplementation(jest.fn());
jest.spyOn(ScriptExecution.prototype, "injectJs").mockImplementation(jest.fn());
jest.spyOn(PortEvents, "listen").mockImplementation(jest.fn());

describe("AuthBootstrap", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("AuthBootstrap::injectFile", () => {
    it("Should inject file", async() => {
      expect.assertions(10);
      // process
      await AuthBootstrap.injectFiles(1, 0);
      // expectations
      expect(spyAddWorker).toHaveBeenCalledWith(expect.any(WorkerEntity));
      expect(spyAddWorker).toHaveBeenCalledTimes(1);
      expect(ScriptExecution.prototype.injectPortname).toHaveBeenCalledTimes(1);
      expect(ScriptExecution.prototype.injectCss).toHaveBeenCalledWith(AuthBootstrap.contentStyleFiles);
      expect(ScriptExecution.prototype.injectJs).toHaveBeenCalledWith(AuthBootstrap.contentScriptFiles);
      expect(AuthBootstrap.contentStyleFiles).toStrictEqual(['webAccessibleResources/css/themes/default/ext_external.min.css']);
      expect(AuthBootstrap.contentScriptFiles).toStrictEqual(['contentScripts/js/dist/vendors.js', 'contentScripts/js/dist/login.js']);
      expect(AuthBootstrap.events).toStrictEqual([PortEvents]);
      expect(AuthBootstrap.mustReloadOnExtensionUpdate).toBeTruthy();
      expect(AuthBootstrap.appName).toBe('AuthBootstrap');
    });
  });

  describe("RecoverBootstrap::canBeAttachedTo", () => {
    it("Should be able to attach auth bootstrap pagemod to browser frame", async() => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
      const result = await AuthBootstrap.canBeAttachedTo({frameId: Pagemod.TOP_FRAME_ID, url: "https://passbolt.dev/auth/login"});
      expect(result).toBeTruthy();
    });

    each([
      {scenario: "No domain", url: "auth/login", frameId: Pagemod.TOP_FRAME_ID},
      {scenario: "Not top frame", url: "https://passbolt.dev/auth/login", frameId: 1},
    ]).describe("Should not be able to attach a pagemod to browser frame", _props => {
      it(`Should be able to attach a pagemod to browser frame: ${_props.scenario}`, async() => {
        expect.assertions(1);
        // mock functions
        jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
        jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
        const result = await AuthBootstrap.canBeAttachedTo({frameId: _props.frameId, url: _props.url});
        expect(result).toBeFalsy();
      });
    });

    it("Should have the constraint not valid if the user is not valid", async() => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => false);
      // process
      const result = await AuthBootstrap.canBeAttachedTo({frameId: 0});
      // expectations
      expect(result).toBeFalsy();
    });
  });

  describe("AuthBootstrap::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(1);
      // data mocked
      const port = {
        on: () => jest.fn(),
        _port: {
          sender: {
            tab: {
              url: "https://passbolt.dev/auth/login"
            }
          }
        }
      };
      // process
      await AuthBootstrap.attachEvents(port);
      // expectations
      expect(PortEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: AuthBootstrap.appName});
    });
  });
});
