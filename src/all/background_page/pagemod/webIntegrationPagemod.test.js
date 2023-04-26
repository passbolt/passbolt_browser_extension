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
import WebIntegration from "./webIntegrationPagemod";
import WorkersSessionStorage from "../service/sessionStorage/workersSessionStorage";
import WorkerEntity from "../model/entity/worker/workerEntity";
import ScriptExecution from "../sdk/scriptExecution";
import each from "jest-each";
import Pagemod from "./pagemod";
import {ConfigEvents} from "../event/configEvents";
import {OrganizationSettingsEvents} from "../event/organizationSettingsEvents";
import {WebIntegrationEvents} from "../event/webIntegrationEvents";
import {PortEvents} from "../event/portEvents";

const spyAddWorker = jest.spyOn(WorkersSessionStorage, "addWorker");
jest.spyOn(ScriptExecution.prototype, "injectPortname").mockImplementation(jest.fn());
jest.spyOn(ScriptExecution.prototype, "injectCss").mockImplementation(jest.fn());
jest.spyOn(ScriptExecution.prototype, "injectJs").mockImplementation(jest.fn());
jest.spyOn(ConfigEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(WebIntegrationEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(OrganizationSettingsEvents, "listen").mockImplementation(jest.fn());
jest.spyOn(PortEvents, "listen").mockImplementation(jest.fn());

describe("WebIntegration", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("WebIntegration::injectFile", () => {
    it("Should inject file", async() => {
      expect.assertions(10);
      // process
      await WebIntegration.injectFiles(1, 0);
      // expectations
      expect(spyAddWorker).toHaveBeenCalledWith(expect.any(WorkerEntity));
      expect(spyAddWorker).toHaveBeenCalledTimes(1);
      expect(ScriptExecution.prototype.injectPortname).toHaveBeenCalledTimes(1);
      expect(ScriptExecution.prototype.injectCss).toHaveBeenCalledWith(WebIntegration.contentStyleFiles);
      expect(ScriptExecution.prototype.injectJs).toHaveBeenCalledWith(WebIntegration.contentScriptFiles);
      expect(WebIntegration.contentStyleFiles).toStrictEqual([]);
      expect(WebIntegration.contentScriptFiles).toStrictEqual(['contentScripts/js/dist/browser-integration/vendors.js', 'contentScripts/js/dist/browser-integration/browser-integration.js']);
      expect(WebIntegration.events).toStrictEqual([ConfigEvents, WebIntegrationEvents, OrganizationSettingsEvents, PortEvents]);
      expect(WebIntegration.mustReloadOnExtensionUpdate).toBeFalsy();
      expect(WebIntegration.appName).toBe('WebIntegration');
    });
  });

  describe("WebIntegration::canBeAttachedTo", () => {
    it("Should be able to attach web integration pagemod to browser frame", async() => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
      jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
      const result = await WebIntegration.canBeAttachedTo({frameId: 1, url: "https://test.dev/auth/login"});
      expect(result).toBeFalsy();
    });

    each([
      {scenario: "Passbolt domain", url: "https://passbolt.dev/auth/login", frameId: Pagemod.TOP_FRAME_ID},
      {scenario: "No domain", url: "about:blank", frameId: 1},
    ]).describe("Should not be able to attach a pagemod to browser frame", _props => {
      it(`Should not be able to attach a pagemod to browser frame: ${_props.scenario}`, async() => {
        expect.assertions(1);
        // mock functions
        jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => true);
        jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
        const result = await WebIntegration.canBeAttachedTo({frameId: _props.frameId, url: _props.url});
        expect(result).toBeFalsy();
      });
    });

    it("Should have the constraint not valid if the user is not valid", async() => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(User.getInstance(), "isValid").mockImplementation(() => false);
      // process
      const result = await WebIntegration.canBeAttachedTo({frameId: 0});
      // expectations
      expect(result).toBeFalsy();
    });
  });

  describe("WebIntegration::attachEvents", () => {
    it("Should attach events", async() => {
      expect.assertions(4);
      // data mocked
      const port = {
        on: () => jest.fn(),
        _port: {
          sender: {
            tab: {
              url: "https://localhost"
            }
          }
        }
      };
      // process
      await WebIntegration.attachEvents(port);
      // expectations
      expect(ConfigEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: WebIntegration.appName});
      expect(WebIntegrationEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: WebIntegration.appName});
      expect(OrganizationSettingsEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: WebIntegration.appName});
      expect(PortEvents.listen).toHaveBeenCalledWith({port: port, tab: port._port.sender.tab, name: WebIntegration.appName});
    });
  });
});
