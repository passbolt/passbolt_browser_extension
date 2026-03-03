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
 * @since         5.11.0
 */

import InformCallToActionController from "./informCallToActionController";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { v4 as uuidv4 } from "uuid";
import { QuickAccessService } from "../../service/ui/quickAccess.service";
import WorkerService from "../../service/worker/workerService";
import { readWorker } from "../../model/entity/worker/workerEntity.test.data";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import { defaultResourceDtosCollection } from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";

describe("InformCallToActionController", () => {
  let requestId, worker, port, controller, suggestedResources;

  beforeEach(() => {
    jest.clearAllMocks();

    requestId = uuidv4();
    port = new MockPort();
    const account = new AccountEntity(defaultAccountDto());
    worker = readWorker({ tab: { url: "https://www.passbolt.com", id: 1 }, port });

    controller = new InformCallToActionController(worker, defaultApiClientOptions(), account);
  });

  describe("InformCallToActionController::getSuggestedResourcesCount", () => {
    beforeEach(() => {
      suggestedResources = defaultResourceDtosCollection();

      jest.spyOn(port, "emit");
      jest.spyOn(controller.getOrFindResourcesService, "getOrFindSuggested").mockResolvedValue(suggestedResources);
    });

    it("Should emit SUCCESS with the count of suggested resources", async () => {
      expect.assertions(3);

      await controller.getSuggestedResourcesCount(requestId, "username");

      expect(controller.getOrFindResourcesService.getOrFindSuggested).toHaveBeenCalledTimes(1);
      expect(controller.getOrFindResourcesService.getOrFindSuggested).toHaveBeenCalledWith(worker.tab.url, "username");
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", suggestedResources.length);
    });

    it("Should emit SUCCESS with the count of suggested resources if no field type is provided", async () => {
      expect.assertions(3);

      await controller.getSuggestedResourcesCount(requestId);

      expect(controller.getOrFindResourcesService.getOrFindSuggested).toHaveBeenCalledTimes(1);
      expect(controller.getOrFindResourcesService.getOrFindSuggested).toHaveBeenCalledWith(worker.tab.url, undefined);
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", 4);
    });

    it("Should catch and emit ERROR when getOrFindSuggested throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(controller.getOrFindResourcesService, "getOrFindSuggested").mockRejectedValue(error);

      await controller.getSuggestedResourcesCount(requestId);

      expect(port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });
  });

  describe("InformCallToActionController::execute", () => {
    beforeEach(() => {
      jest.spyOn(port, "emit");
      jest
        .spyOn(controller.checkAuthStatusService, "checkAuthStatus")
        .mockResolvedValue({ isAuthenticated: true, isMfaRequired: false });
    });

    it("Should open quick access when user is not authenticated", async () => {
      expect.assertions(4);

      jest.spyOn(controller.checkAuthStatusService, "checkAuthStatus").mockResolvedValue({ isAuthenticated: false });
      jest.spyOn(QuickAccessService, "open").mockResolvedValue();

      await controller.execute(requestId);

      expect(controller.checkAuthStatusService.checkAuthStatus).toHaveBeenCalledTimes(1);
      expect(controller.checkAuthStatusService.checkAuthStatus).toHaveBeenCalledWith(false);

      expect(QuickAccessService.open).toHaveBeenCalledWith([{ name: "feature", value: "login" }]);
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
    });

    it("Should open trusted domain tab when MFA is required", async () => {
      expect.assertions(4);

      jest.spyOn(controller.checkAuthStatusService, "checkAuthStatus").mockResolvedValue({
        isAuthenticated: true,
        isMfaRequired: true,
      });
      jest.spyOn(controller.openTrustedDomainTabService, "openTab").mockResolvedValue();

      await controller.execute(requestId);

      expect(controller.checkAuthStatusService.checkAuthStatus).toHaveBeenCalledTimes(1);
      expect(controller.checkAuthStatusService.checkAuthStatus).toHaveBeenCalledWith(false);

      expect(controller.openTrustedDomainTabService.openTab).toHaveBeenCalledTimes(1);
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
    });

    it("Should open in-form menu from web integration worker when fully authenticated", async () => {
      expect.assertions(4);

      jest
        .spyOn(controller.checkAuthStatusService, "checkAuthStatus")
        .mockResolvedValue({ isAuthenticated: true, isMfaRequired: false });
      jest.spyOn(WorkerService, "get").mockResolvedValue({ port });

      await controller.execute(requestId);

      expect(controller.checkAuthStatusService.checkAuthStatus).toHaveBeenCalledTimes(1);
      expect(controller.checkAuthStatusService.checkAuthStatus).toHaveBeenCalledWith(false);

      expect(WorkerService.get).toHaveBeenCalledWith("WebIntegration", worker.tab.id);
      expect(port.emit).toHaveBeenCalledWith("passbolt.in-form-menu.open");
    });

    it("Should catch and emit ERROR when an error occurs in checkAuthStatusService", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(controller.checkAuthStatusService, "checkAuthStatus").mockRejectedValue(error);

      await controller.execute(requestId);

      expect(port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });

    it("Should catch and emit ERROR when an error occurs in QuickAccessService", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(controller.checkAuthStatusService, "checkAuthStatus").mockResolvedValue({ isAuthenticated: false });
      jest.spyOn(QuickAccessService, "open").mockRejectedValue(error);

      await controller.execute();

      expect(port.emit).toHaveBeenCalledWith(undefined, "ERROR", error);
    });

    it("Should catch and emit ERROR when an error occurs in openTrustedDomainTabService", async () => {
      expect.assertions(1);

      const error = new Error();
      jest
        .spyOn(controller.checkAuthStatusService, "checkAuthStatus")
        .mockResolvedValue({ isAuthenticated: true, isMfaRequired: true });
      jest.spyOn(controller.openTrustedDomainTabService, "openTab").mockRejectedValue(error);

      await controller.execute();

      expect(port.emit).toHaveBeenCalledWith(undefined, "ERROR", error);
    });

    it("Should catch and emit ERROR when an error occurs in WorkerService", async () => {
      expect.assertions(1);

      const error = new Error();
      jest
        .spyOn(controller.checkAuthStatusService, "checkAuthStatus")
        .mockResolvedValue({ isAuthenticated: true, isMfaRequired: false });
      jest.spyOn(WorkerService, "get").mockRejectedValue(error);

      await controller.execute();

      expect(port.emit).toHaveBeenCalledWith(undefined, "ERROR", error);
    });
  });
});
