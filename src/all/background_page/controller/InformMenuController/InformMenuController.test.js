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

import InformMenuController from "./InformMenuController";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { v4 as uuidv4 } from "uuid";
import { QuickAccessService } from "../../service/ui/quickAccess.service";
import WorkerService from "../../service/worker/workerService";
import BrowserTabService from "../../service/ui/browserTab.service";
import ResourceInProgressCacheService from "../../service/cache/resourceInProgressCache.service";
import { readWorker } from "../../model/entity/worker/workerEntity.test.data";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import { defaultResourcesDtos } from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ExternalResourceEntity from "../../model/entity/resource/external/externalResourceEntity";
import ResourceMetadataEntity from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity";
import { sortResourcesByUriMatchingScore } from "passbolt-styleguide/src/shared/utils/sortUtils";
import {
  defaultResourceDto,
  resourceStandaloneCustomFieldsDto,
  resourceStandaloneNoteDto,
  resourceStandaloneTotpDto,
} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import { defaultResourceMetadataDto } from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity.test.data";
import GetOrFindResourcesService from "../../service/resource/getOrFindResourcesService";
import GetOrFindOfflineResourcesService from "../../service/resource/getOrFindOfflineResourcesService";
import GetOrFindActiveSessionService from "../../service/activeSession/getOrFindActiveSessionService";
import ResourceLocalStorage from "../../service/local_storage/resourceLocalStorage";
import ResourceTypeLocalStorage from "../../service/local_storage/resourceTypeLocalStorage";
import { resourceTypesCollectionDto } from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import UserActiveSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import {
  defaultUserActiveSessionDto,
  offlineUserActiveSessionDto,
} from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity.test.data";

describe("InformMenuController", () => {
  let requestId, worker, port, controller, webIntegrationPort;

  beforeEach(() => {
    jest.resetAllMocks();

    requestId = uuidv4();
    port = new MockPort();
    webIntegrationPort = new MockPort();
    const account = new AccountEntity(defaultAccountDto());
    worker = readWorker({ tab: { url: "https://www.passbolt.com", id: 1 }, port });
    controller = new InformMenuController(worker, defaultApiClientOptions(), account);

    jest.spyOn(WorkerService, "get").mockResolvedValue({ port: webIntegrationPort });
    jest.spyOn(port, "emit");
    jest.spyOn(webIntegrationPort, "emit");
    jest.spyOn(webIntegrationPort, "request");
    jest.spyOn(QuickAccessService, "open").mockResolvedValue();
  });

  describe("InformMenuController::getInitialConfiguration", () => {
    let suggestedResourcesDtos, suggestedResources;

    beforeEach(() => {
      suggestedResourcesDtos = defaultResourcesDtos();
      suggestedResources = new ResourcesCollection(suggestedResourcesDtos);

      jest.spyOn(webIntegrationPort, "request").mockResolvedValue({ type: "password", value: "test" });
      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockResolvedValue(new UserActiveSessionEntity(defaultUserActiveSessionDto()));
      jest.spyOn(GetOrFindResourcesService.prototype, "getOrFindSuggested").mockResolvedValue(suggestedResources);
      jest
        .spyOn(GetOrFindOfflineResourcesService.prototype, "getOrFindSuggested")
        .mockResolvedValue(suggestedResources);
    });

    it("Should emit SUCCESS with configuration containing inputType, inputValue, and suggestedResources", async () => {
      expect.assertions(8);

      await controller.getInitialConfiguration(requestId);

      expect(WorkerService.get).toHaveBeenCalledTimes(1);
      expect(WorkerService.get).toHaveBeenCalledWith("WebIntegration", worker.tab.id);

      expect(webIntegrationPort.request).toHaveBeenCalledTimes(1);
      expect(webIntegrationPort.request).toHaveBeenCalledWith(
        "passbolt.web-integration.last-performed-call-to-action-input",
      );

      expect(GetOrFindResourcesService.prototype.getOrFindSuggested).toHaveBeenCalledTimes(1);
      expect(GetOrFindResourcesService.prototype.getOrFindSuggested).toHaveBeenCalledWith(worker.tab.url, "password");

      expect(port.emit).toHaveBeenCalledTimes(1);
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", {
        inputType: "password",
        inputValue: "test",
        suggestedResources: sortResourcesByUriMatchingScore(suggestedResourcesDtos, worker.tab.url),
      });
    });

    it("Should sort suggestedResources by URI matching score with the tab url, best match first", async () => {
      expect.assertions(2);

      const noMatch = defaultResourceDto({ metadata: defaultResourceMetadataDto({ uris: ["https://example.com"] }) });
      const sameDomain = defaultResourceDto({ metadata: defaultResourceMetadataDto({ uris: ["passbolt.com"] }) });
      const sameFqdn = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["https://www.passbolt.com/login"] }),
      });
      const exactMatch = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["https://www.passbolt.com"] }),
      });

      const unsortedCollection = new ResourcesCollection([noMatch, sameDomain, sameFqdn, exactMatch]);
      jest.spyOn(GetOrFindResourcesService.prototype, "getOrFindSuggested").mockResolvedValue(unsortedCollection);

      await controller.getInitialConfiguration(requestId);

      const emittedConfiguration = port.emit.mock.calls[0][2];
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", expect.anything());
      expect(emittedConfiguration.suggestedResources.map((resource) => resource.id)).toEqual([
        exactMatch.id,
        sameFqdn.id,
        sameDomain.id,
        noMatch.id,
      ]);
    });

    it.each(["username", "password", "otp"])(
      "Should offer only the password or TOTP resource, never a matching note or custom fields resource, for a %s field",
      async (fieldType) => {
        expect.assertions(2);
        // Let the real service run against the local storage to check the resource type filtering.
        GetOrFindResourcesService.prototype.getOrFindSuggested.mockRestore();

        const matchingPassword = defaultResourceDto({
          metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
        });
        const matchingTotp = resourceStandaloneTotpDto({
          metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
        });
        const matchingNote = resourceStandaloneNoteDto({
          metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
        });
        const matchingCustomFields = resourceStandaloneCustomFieldsDto({
          metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
        });
        const expectedResource = fieldType === "otp" ? matchingTotp : matchingPassword;

        jest.spyOn(webIntegrationPort, "request").mockResolvedValue({ type: fieldType, value: "test" });
        jest
          .spyOn(ResourceLocalStorage, "get")
          .mockResolvedValue([matchingPassword, matchingTotp, matchingNote, matchingCustomFields]);
        jest.spyOn(ResourceTypeLocalStorage.prototype, "isStaleSinceLastLoggedIn").mockResolvedValue(false);
        jest.spyOn(ResourceTypeLocalStorage.prototype, "getData").mockResolvedValue(resourceTypesCollectionDto());

        await controller.getInitialConfiguration(requestId);

        const emittedConfiguration = port.emit.mock.calls[0][2];
        expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", expect.anything());
        expect(emittedConfiguration.suggestedResources.map((resource) => resource.id)).toEqual([expectedResource.id]);
      },
    );

    it("Should catch and emit ERROR when WorkerService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(WorkerService, "get").mockRejectedValue(error);

      await controller.getInitialConfiguration(requestId);

      expect(port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });

    it("Should catch and emit ERROR when webIntegrationWorker throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(webIntegrationPort, "request").mockRejectedValue(error);

      await controller.getInitialConfiguration(requestId);

      expect(port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });

    it("Should catch and emit ERROR when getOrFindResourcesService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(GetOrFindResourcesService.prototype, "getOrFindSuggested").mockRejectedValue(error);

      await controller.getInitialConfiguration(requestId);

      expect(port.emit).toHaveBeenCalledWith(requestId, "ERROR", error);
    });

    it("Should get the suggested resources from the offline storage when the session is offline", async () => {
      expect.assertions(3);

      jest
        .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
        .mockResolvedValue(new UserActiveSessionEntity(offlineUserActiveSessionDto()));

      await controller.getInitialConfiguration(requestId);

      expect(GetOrFindOfflineResourcesService.prototype.getOrFindSuggested).toHaveBeenCalledWith(
        worker.tab.url,
        "password",
      );
      expect(GetOrFindResourcesService.prototype.getOrFindSuggested).not.toHaveBeenCalled();
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS", {
        inputType: "password",
        inputValue: "test",
        suggestedResources: sortResourcesByUriMatchingScore(suggestedResourcesDtos, worker.tab.url),
      });
    });

    it("Should resolve the active session only once", async () => {
      expect.assertions(1);

      await controller.getInitialConfiguration(requestId);

      expect(GetOrFindActiveSessionService.prototype.getOrFind).toHaveBeenCalledTimes(1);
    });
  });

  describe("InformMenuController::createNewCredentials", () => {
    it("Should open the quickaccess and close the in-form menu", async () => {
      expect.assertions(6);

      await controller.createNewCredentials(requestId);

      expect(QuickAccessService.open).toHaveBeenCalledTimes(1);
      expect(QuickAccessService.open).toHaveBeenCalledWith([
        { name: "feature", value: "create-new-credentials" },
        { name: "tabId", value: 1 },
      ]);

      expect(webIntegrationPort.emit).toHaveBeenCalledTimes(1);
      expect(webIntegrationPort.emit).toHaveBeenCalledWith("passbolt.in-form-menu.close");
      expect(port.emit).toHaveBeenCalledTimes(1);
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
    });

    it("Should throw when QuickAccessService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(QuickAccessService, "open").mockRejectedValue(error);

      await expect(() => controller.createNewCredentials(requestId)).rejects.toThrow(error.message);
    });

    it("Should throw when WorkerService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(WorkerService, "get").mockRejectedValue(error);

      await expect(() => controller.createNewCredentials(requestId)).rejects.toThrow(error.message);
    });
  });

  describe("InformMenuController::saveCredentials", () => {
    beforeEach(() => {
      jest.spyOn(ResourceInProgressCacheService, "set").mockResolvedValue();
      jest
        .spyOn(BrowserTabService, "getCurrent")
        .mockResolvedValue({ title: "Passbolt", url: "https://www.passbolt.com/path" });
      jest
        .spyOn(webIntegrationPort, "request")
        .mockResolvedValue({ username: "ada@passbolt.com", password: "secret-password" });
    });

    it("Should open the quickaccess to save credentials and close the in-form menu", async () => {
      expect.assertions(11);

      await controller.saveCredentials(requestId);

      expect(webIntegrationPort.request).toHaveBeenCalledTimes(1);
      expect(webIntegrationPort.request).toHaveBeenCalledWith("passbolt.web-integration.get-credentials");

      expect(BrowserTabService.getCurrent).toHaveBeenCalledTimes(1);

      expect(ResourceInProgressCacheService.set).toHaveBeenCalledTimes(1);
      expect(ResourceInProgressCacheService.set).toHaveBeenCalledWith(
        new ExternalResourceEntity({
          name: "Passbolt",
          username: "ada@passbolt.com",
          uris: ["https://www.passbolt.com/path"],
          secret_clear: "secret-password",
        }),
      );

      expect(QuickAccessService.open).toHaveBeenCalledTimes(1);
      expect(QuickAccessService.open).toHaveBeenCalledWith([
        { name: "feature", value: "save-credentials" },
        { name: "tabId", value: 1 },
      ]);

      expect(port.emit).toHaveBeenCalledTimes(1);
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
      expect(webIntegrationPort.emit).toHaveBeenCalledTimes(1);
      expect(webIntegrationPort.emit).toHaveBeenCalledWith("passbolt.in-form-menu.close");
    });

    it("Should truncate URI when tab URL is longer than URI_MAX_LENGTH", async () => {
      expect.assertions(1);

      const longUrl = `https://www.passbolt.com/${"x".repeat(ResourceMetadataEntity.URI_MAX_LENGTH)}`;
      jest.spyOn(BrowserTabService, "getCurrent").mockResolvedValue({ title: "Passbolt", url: longUrl });

      await controller.saveCredentials(requestId);

      expect(ResourceInProgressCacheService.set).toHaveBeenCalledWith(
        new ExternalResourceEntity({
          name: "Passbolt",
          username: "ada@passbolt.com",
          uris: [longUrl.substring(0, ResourceMetadataEntity.URI_MAX_LENGTH)],
          secret_clear: "secret-password",
        }),
      );
    });

    it("Should throw when WorkerService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(WorkerService, "get").mockRejectedValue(error);

      await expect(() => controller.saveCredentials(requestId)).rejects.toThrow(error.message);
    });

    it("Should throw when webIntegrationWorker throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(webIntegrationPort, "request").mockRejectedValue(error);

      await expect(() => controller.saveCredentials(requestId)).rejects.toThrow(error.message);
    });

    it("Should throw when BrowserTabService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(BrowserTabService, "getCurrent").mockRejectedValue(error);

      await expect(() => controller.saveCredentials(requestId)).rejects.toThrow(error.message);
    });

    it("Should throw when ResourceInProgressCacheService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(ResourceInProgressCacheService, "set").mockRejectedValue(error);

      await expect(() => controller.saveCredentials(requestId)).rejects.toThrow(error.message);
    });

    it("Should throw when QuickAccessService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(QuickAccessService, "open").mockRejectedValue(error);

      await expect(() => controller.saveCredentials(requestId)).rejects.toThrow(error.message);
    });
  });

  describe("InformMenuController::browseCredentials", () => {
    it("Should open the quickaccess and close in-form menu", async () => {
      expect.assertions(6);

      await controller.browseCredentials(requestId);

      expect(QuickAccessService.open).toHaveBeenCalledTimes(1);
      expect(QuickAccessService.open).toHaveBeenCalledWith([
        { name: "feature", value: "browse-credentials" },
        { name: "tabId", value: 1 },
      ]);

      expect(port.emit).toHaveBeenCalledTimes(1);
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
      expect(webIntegrationPort.emit).toHaveBeenCalledTimes(1);
      expect(webIntegrationPort.emit).toHaveBeenCalledWith("passbolt.in-form-menu.close");
    });

    it("Should throw when QuickAccessService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(QuickAccessService, "open").mockRejectedValue(error);

      await expect(() => controller.browseCredentials(requestId)).rejects.toThrow(error.message);
    });

    it("Should throw when WorkerService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(WorkerService, "get").mockRejectedValue(error);

      await expect(() => controller.browseCredentials(requestId)).rejects.toThrow(error.message);
    });
  });

  describe("InformMenuController::fillPassword", () => {
    it("Should emit fill-password event with password to web integration worker", async () => {
      expect.assertions(4);

      await controller.fillPassword(requestId, "my-password");

      expect(webIntegrationPort.emit).toHaveBeenCalledTimes(1);
      expect(webIntegrationPort.emit).toHaveBeenCalledWith("passbolt.web-integration.fill-password", "my-password");
      expect(port.emit).toHaveBeenCalledTimes(1);
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
    });

    it("Should throw when WorkerService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(WorkerService, "get").mockRejectedValue(error);

      await expect(() => controller.fillPassword(requestId, "my-password")).rejects.toThrow(error.message);
    });
  });

  describe("InformMenuController::close", () => {
    it("Should emit close event to web integration worker", async () => {
      expect.assertions(4);

      await controller.close(requestId);

      expect(webIntegrationPort.emit).toHaveBeenCalledTimes(1);
      expect(webIntegrationPort.emit).toHaveBeenCalledWith("passbolt.in-form-menu.close");
      expect(port.emit).toHaveBeenCalledTimes(1);
      expect(port.emit).toHaveBeenCalledWith(requestId, "SUCCESS");
    });

    it("Should throw when WorkerService throws an error", async () => {
      expect.assertions(1);

      const error = new Error();
      jest.spyOn(WorkerService, "get").mockRejectedValue(error);

      await expect(() => controller.close(requestId)).rejects.toThrow(error.message);
    });
  });
});
