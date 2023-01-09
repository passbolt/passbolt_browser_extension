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
 * @since         3.7.0
 */

import GeneratePortIdController from "./generatePortIdController";
import WorkersSessionStorage from "../../../../chrome-mv3/service/sessionStorage/workersSessionStorage";
import browser from "../../sdk/polyfill/browserPolyfill";
import WorkerEntity from "../../model/entity/worker/workerEntity";

// Mock the chrome locale
const spyOnManifest = jest.spyOn(browser.runtime, 'getManifest');
jest.spyOn(WorkersSessionStorage, "addWorker");

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("GeneratePortIdController", () => {
  describe("GeneratePortIdController::isAllowedToGeneratePortId", () => {
    it("Should allowed to generate port id", async() => {
      expect.assertions(6);
      // data mocked
      const worker = {
        name: "WebIntegration"
      };
      // process
      const controller = new GeneratePortIdController(worker, "requestId");
      // expectations
      expect(controller.isAllowedToGeneratePortId(worker, "Recover")).toBeFalsy();
      expect(controller.isAllowedToGeneratePortId(worker, "Setup")).toBeFalsy();
      expect(controller.isAllowedToGeneratePortId(worker, "App")).toBeFalsy();
      expect(controller.isAllowedToGeneratePortId(worker, "Unknown")).toBeFalsy();
      expect(controller.isAllowedToGeneratePortId(worker, "InFormCallToAction")).toBeTruthy();
      expect(controller.isAllowedToGeneratePortId(worker, "InFormMenu")).toBeTruthy();
    });

    it("Should not allowed to generate port id for unknown application", async() => {
      expect.assertions(2);
      // data mocked
      const worker = {
        name: "Unknown"
      };
      // process
      const controller = new GeneratePortIdController(worker, "requestId");
      // expectations
      expect(controller.isAllowedToGeneratePortId(worker, "Recover")).toBeFalsy();
      expect(controller.isAllowedToGeneratePortId(worker, "Unknown")).toBeFalsy();
    });
  });

  describe("GeneratePortIdController::exec", () => {
    it("Should generate a port id for recover MV2", async() => {
      expect.assertions(1);
      // data mocked
      const worker = {
        pageMod: {
          args: {
            name: "RecoverBootstrap"
          }
        }
      };
      // mock functions
      spyOnManifest.mockImplementationOnce(() => ({manifest_version: 2}));
      // process
      const controller = new GeneratePortIdController(worker, "requestId");
      const id  = await controller.exec("Recover");
      // expectations
      expect(id).toStrictEqual(`passbolt-iframe-recover`);
    });

    it("Should not generate a port id for application not allowed MV2", async() => {
      expect.assertions(1);
      // data mocked
      const worker = {
        pageMod: {
          args: {
            name: "AuthBootstrap"
          }
        }
      };
      // process
      const controller = new GeneratePortIdController(worker, "requestId");
      try {
        await controller.exec("App");
      } catch (error) {
        // expectations
        expect(error.message).toStrictEqual("The application is not allowed to open the application App");
      }
    });

    it("Should store worker and generate a port id for setup MV3", async() => {
      expect.assertions(2);
      // data mocked
      const worker = {
        tab: {
          id: 1
        },
        name: "SetupBootstrap"
      };
      // mock functions
      spyOnManifest.mockImplementationOnce(() => ({manifest_version: 3}));
      // process
      const controller = new GeneratePortIdController(worker, "requestId");
      const id  = await controller.exec("Setup");
      // data expected
      const workerEntity = new WorkerEntity({
        id: id,
        tabId: worker.tab.id,
        name: "Setup",
        frameId: null
      });
      // expectations
      expect(id).toMatch(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/);
      expect(WorkersSessionStorage.addWorker).toHaveBeenCalledWith(workerEntity);
    });

    it("Should not store worker and generate a port id for application not allowed MV3", async() => {
      expect.assertions(1);
      // data mocked
      const worker = {
        tab: {
          id: 1
        },
        name: "AppBootstrap"
      };
      // process
      const controller = new GeneratePortIdController(worker, "requestId");
      try {
        await controller.exec("QuickAccess");
      } catch (error) {
        // expectations
        expect(error.message).toStrictEqual("The application is not allowed to open the application QuickAccess");
      }
    });
  });
});
