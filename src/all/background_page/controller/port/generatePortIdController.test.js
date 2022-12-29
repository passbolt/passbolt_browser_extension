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
  describe("GeneratePortIdController::exec", () => {
    it("Should generate a port id for MV2", async() => {
      expect.assertions(1);
      // data mocked
      const worker = {
        pageMod: {
          args: {
            name: "applicationNameBootstrap"
          }
        }
      };
      // mock functions
      spyOnManifest.mockImplementationOnce(() => ({manifest_version: 2}));
      // process
      const controller = new GeneratePortIdController(worker, "requestId");
      const id  = await controller.exec();
      // expectations
      expect(id).toStrictEqual(`passbolt-iframe-applicationname`);
    });

    it("Should store worker and generate a port id for MV3", async() => {
      expect.assertions(2);
      // data mocked
      const worker = {
        tab: {
          id: 1
        },
        name: "applicationName"
      };
      // mock functions
      spyOnManifest.mockImplementationOnce(() => ({manifest_version: 3}));
      // process
      const controller = new GeneratePortIdController(worker, "requestId");
      const id  = await controller.exec();
      // data expected
      const workerEntity = new WorkerEntity({
        id: id,
        tabId: worker.tab.id,
        name: "applicationName"
      });
      // expectations
      expect(id).toMatch(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/);
      expect(WorkersSessionStorage.addWorker).toHaveBeenCalledWith(workerEntity);
    });
  });
});
