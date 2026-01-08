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
 * @since         6.0.0
 */
import { readWorker } from "../../model/entity/worker/workerEntity.test.data";
import WorkersSessionStorage from "../../service/sessionStorage/workersSessionStorage";
import WorkerEntity from "../../model/entity/worker/workerEntity";
import WebIntegrationPagemod from "../../pagemod/webIntegrationPagemod";
import { mockPort } from "../../sdk/port/portManager.test.data";
import Port from "../../sdk/port";
import PortManager from "../../sdk/port/portManager";
import IsApplicationOverlaidController from "./IsApplicationOverlaidController";
import { v4 as uuidv4 } from "uuid";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("IsApplicationOverlaidController", () => {
  describe("::exec", () => {
    it("Should request web integration worker to check overlay.", async () => {
      expect.assertions(2);
      const worker = readWorker({ name: WebIntegrationPagemod.appName });
      const webIntegrationPort = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId });
      const webIntegrationPortWrapper = new Port(webIntegrationPort);
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));

      jest.spyOn(PortManager, "getPortById").mockImplementationOnce(() => webIntegrationPortWrapper);
      jest.spyOn(webIntegrationPortWrapper, "request").mockImplementationOnce(() => true);

      const applicationId = uuidv4();
      const controller = new IsApplicationOverlaidController({ tab: { id: worker.tabId } }, null);
      const result = await controller.exec(applicationId);

      expect(result).toBeTruthy();
      expect(webIntegrationPortWrapper.request).toHaveBeenNthCalledWith(
        1,
        "passbolt.web-integration.is-application-overlaid",
        applicationId,
      );
    });

    it("Should throw an error if web integration worker throw an error.", async () => {
      expect.assertions(1);
      const worker = readWorker({ name: WebIntegrationPagemod.appName });
      const webIntegrationPort = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId });
      const webIntegrationPortWrapper = new Port(webIntegrationPort);
      await WorkersSessionStorage.addWorker(new WorkerEntity(worker));

      jest.spyOn(PortManager, "getPortById").mockImplementationOnce(() => webIntegrationPortWrapper);
      jest.spyOn(webIntegrationPortWrapper, "request").mockImplementationOnce(() => {
        throw new Error("error");
      });

      const applicationId = uuidv4();
      const controller = new IsApplicationOverlaidController({ tab: { id: worker.tabId } }, null);
      await expect(() => controller.exec(applicationId)).rejects.toThrowError(new Error("error"));
    });

    it("Should throw an error if application id is not a uuid.", async () => {
      expect.assertions(1);

      const controller = new IsApplicationOverlaidController(null, null);
      await expect(() => controller.exec("test")).rejects.toThrowError(
        new Error("The given parameter is not a valid UUID"),
      );
    });
  });
});
