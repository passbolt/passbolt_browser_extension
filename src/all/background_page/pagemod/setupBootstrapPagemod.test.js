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
import WorkersSessionStorage from "../service/sessionStorage/workersSessionStorage";
import WorkerEntity from "../model/entity/worker/workerEntity";
import ScriptExecution from "../sdk/scriptExecution";
import SetupBootstrap from "./setupBootstrapPagemod";
import each from "jest-each";
import Pagemod from "./pagemod";
import {PortEvents} from "../event/portEvents";

const spyAddWorker = jest.spyOn(WorkersSessionStorage, "addWorker");
jest.spyOn(ScriptExecution.prototype, "injectPortname").mockImplementation(jest.fn());
jest.spyOn(ScriptExecution.prototype, "injectCss").mockImplementation(jest.fn());
jest.spyOn(ScriptExecution.prototype, "injectJs").mockImplementation(jest.fn());
jest.spyOn(PortEvents, "listen").mockImplementation(jest.fn());

describe("SetupBootstrap", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("SetupBootstrap::injectFile", () => {
    it("Should inject file", async() => {
      expect.assertions(10);
      // process
      await SetupBootstrap.injectFiles(1, 0);
      // expectations
      expect(spyAddWorker).toHaveBeenCalledWith(expect.any(WorkerEntity));
      expect(spyAddWorker).toHaveBeenCalledTimes(1);
      expect(ScriptExecution.prototype.injectPortname).toHaveBeenCalledTimes(1);
      expect(ScriptExecution.prototype.injectCss).toHaveBeenCalledWith(SetupBootstrap.contentStyleFiles);
      expect(ScriptExecution.prototype.injectJs).toHaveBeenCalledWith(SetupBootstrap.contentScriptFiles);
      expect(SetupBootstrap.contentStyleFiles).toStrictEqual(['webAccessibleResources/css/themes/default/ext_external.min.css']);
      expect(SetupBootstrap.contentScriptFiles).toStrictEqual(['contentScripts/js/dist/vendors.js', 'contentScripts/js/dist/setup.js']);
      expect(SetupBootstrap.events).toStrictEqual([PortEvents]);
      expect(SetupBootstrap.mustReloadOnExtensionUpdate).toBeTruthy();
      expect(SetupBootstrap.appName).toBe('SetupBootstrap');
    });
  });

  describe("SetupBootstrap::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(1);
      // data mocked
      const port = {
        on: () => jest.fn(),
        _port: {
          sender: {
            tab: {
              url: "https://passbolt.dev/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0"
            }
          }
        }
      };
      // process
      await SetupBootstrap.attachEvents(port);
      // expectations
      expect(PortEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: SetupBootstrap.appName});
    });
  });

  describe("SetupBootstrap::canBeAttachedTo", () => {
    each([
      {scenario: "Legacy url & top frame", url: "https://passbolt.dev/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0", frameId: Pagemod.TOP_FRAME_ID},
      {scenario: "Valid url & top frame", url: "https://passbolt.dev/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0", frameId: Pagemod.TOP_FRAME_ID},
    ]).describe("Should be able to attach a pagemod to browser frame", _props => {
      it(`Should be able to attach a pagemod to browser frame: ${_props.scenario}`, async() => {
        expect.assertions(1);
        const result = await SetupBootstrap.canBeAttachedTo({frameId: _props.frameId, url: _props.url});
        expect(result).toBeTruthy();
      });
    });

    each([
      {scenario: "No domain", url: "setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0", frameId: Pagemod.TOP_FRAME_ID},
      {scenario: "No token", url: "https://passbolt.dev/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228", frameId: Pagemod.TOP_FRAME_ID},
      {scenario: "Not top frame", url: "https://passbolt.dev/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0", frameId: 1},
    ]).describe("Should not be able to attach a pagemod to browser frame", _props => {
      it(`Should be able to attach a pagemod to browser frame: ${_props.scenario}`, async() => {
        expect.assertions(1);
        const result = await SetupBootstrap.canBeAttachedTo({frameId: _props.frameId, url: _props.url});
        expect(result).toBeFalsy();
      });
    });
  });
});
