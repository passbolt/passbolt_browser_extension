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

import ResourceService from "../api/resource/resourceService";
import { ApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import ResourceTypeService from "../api/resourceType/resourceTypeService";
import { resourceTypesCollectionDto } from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import GetOrFindOfflineResourcesService from "./getOrFindOfflineResourcesService";
import { multipleResourceDtos } from "./getOrFindResourcesService.test.data";
import { resourceAllTypesDtosCollection } from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import {
  defaultResourceDto,
  resourceStandaloneCustomFieldsDto,
  resourceStandaloneNoteDto,
  resourceStandaloneTotpDto,
  resourceWithTotpDto,
} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import { defaultResourceMetadataDto } from "passbolt-styleguide/src/shared/models/entity/resource/metadata/resourceMetadataEntity.test.data";
import GetOrFindActiveSessionService from "../activeSession/getOrFindActiveSessionService";
import UserActiveSessionEntity from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity";
import { defaultUserActiveSessionDto } from "passbolt-styleguide/src/shared/models/entity/session/userActiveSessionEntity.test.data";
import FindAndUpdateResourcesLocalStorageFromOPFSService from "./findAndUpdateResourcesLocalStorageFromOPFSService";
import OfflineResourcesOPFSStorage from "../opfsStorage/offlineResourcesOPFSStorage";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest
    .spyOn(GetOrFindActiveSessionService.prototype, "getOrFind")
    .mockImplementation(() => new UserActiveSessionEntity(defaultUserActiveSessionDto()));
});

describe("GetOrFindOfflineResourcesService", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = new ApiClientOptions().setBaseUrl("https://localhost");

  describe("::getOrFindAll", () => {
    it("retrieves empty resources from the offline storage when the local storage is not initialized", async () => {
      expect.assertions(6);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(FindAndUpdateResourcesLocalStorageFromOPFSService.prototype, "findAndUpdateAll");

      const service = new GetOrFindOfflineResourcesService(account, apiClientOptions);
      const resources = await service.getOrFindAll();

      expect(FindAndUpdateResourcesLocalStorageFromOPFSService.prototype.findAndUpdateAll).toHaveBeenCalledTimes(1);
      expect(FindAndUpdateResourcesLocalStorageFromOPFSService.prototype.findAndUpdateAll).toHaveBeenCalledWith(); //to be verified as it's the default parameter value, I think it should be this way, but I can be wrong
      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(0);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(await ResourceLocalStorage.get()).toEqual([]);
    });

    it("retrieves resources of all types from the offline storage when the local storage is not initialized.", async () => {
      expect.assertions(4);
      const resourcesDto = multipleResourceDtos();
      jest.spyOn(OfflineResourcesOPFSStorage.prototype, "get").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());

      const service = new GetOrFindOfflineResourcesService(account, apiClientOptions);
      const resources = await service.getOrFindAll();

      expect(resources).toHaveLength(4);
      expect(resources.toDto(ResourceLocalStorage.DEFAULT_CONTAIN)).toEqual(resourcesDto);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(await ResourceLocalStorage.get()).toEqual(resourcesDto);
    });

    it("retrieves resources of all types from the local storage when the local storage is initialized.", async () => {
      expect.assertions(5);
      const resourcesDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll");
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));

      const service = new GetOrFindOfflineResourcesService(account, apiClientOptions);
      const resources = await service.getOrFindAll();

      expect(ResourceService.prototype.findAll).not.toHaveBeenCalled();
      expect(resources).toHaveLength(4);
      expect(resources.toDto(ResourceLocalStorage.DEFAULT_CONTAIN)).toEqual(resourcesDto);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(await ResourceLocalStorage.get()).toEqual(resourcesDto);
    });

    it("does not validate the resources collection if the information is retrieved from the runtime cache.", async () => {
      expect.assertions(2);
      jest.spyOn(ResourceService.prototype, "findAll");
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(ResourcesCollection.prototype, "validateSchema");
      await ResourceLocalStorage.set(new ResourcesCollection([]));

      const service = new GetOrFindOfflineResourcesService(account, apiClientOptions);
      await service.getOrFindAll();

      expect(ResourceService.prototype.findAll).not.toHaveBeenCalled();
      // Validation should be called only once when building the collection mock.
      expect(ResourcesCollection.prototype.validateSchema).toHaveBeenCalledTimes(1);
    });

    it("validates resources collection if the local storage has no runtime cache and the information is retrieved from the local storage.", async () => {
      expect.assertions(2);
      jest.spyOn(ResourceService.prototype, "findAll");
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(ResourcesCollection.prototype, "validateSchema");
      await ResourceLocalStorage.set(new ResourcesCollection([]));
      ResourceLocalStorage._cachedData = null;

      const service = new GetOrFindOfflineResourcesService(account, apiClientOptions);
      await service.getOrFindAll();

      expect(ResourceService.prototype.findAll).not.toHaveBeenCalled();
      // Validation should be called twice, once when building the collection mock, and once by the getOrFindAll.
      expect(ResourcesCollection.prototype.validateSchema).toHaveBeenCalledTimes(2);
    });
  });

  describe("::getOrFindSuggested", () => {
    let service;

    beforeEach(() => {
      service = new GetOrFindOfflineResourcesService(account, apiClientOptions);
    });

    it("should return an empty resource collection without URL", async () => {
      expect.assertions(2);

      const resources = await service.getOrFindSuggested();

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(0);
    });

    it("should return an empty resource collection without URL even if a fieldType is provided", async () => {
      expect.assertions(2);

      const resources = await service.getOrFindSuggested(undefined, "otp");

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(0);
    });

    it("should filter the collection by password resource types and filter by suggested url", async () => {
      expect.assertions(4);

      const suggestedResource1 = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
      });
      const suggestedResource2 = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["passbolt.com"] }),
      });
      const notSuggestedResource1 = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["not-passbolt.com"] }),
      });
      const notSuggestedResource2 = defaultResourceDto({ metadata: defaultResourceMetadataDto({ uris: [""] }) });

      const resourcesCollections = new ResourcesCollection([
        suggestedResource1,
        suggestedResource2,
        notSuggestedResource1,
        notSuggestedResource2,
      ]);
      jest
        .spyOn(FindAndUpdateResourcesLocalStorageFromOPFSService.prototype, "findAndUpdateAll")
        .mockImplementation(() => resourcesCollections);
      jest
        .spyOn(service.getOrFindResourceTypesService, "getOrFindAll")
        .mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

      const resources = await service.getOrFindSuggested("https://www.passbolt.com", "password");

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(2);
      expect(resources.getFirstById(suggestedResource1.id)).toBeTruthy();
      expect(resources.getFirstById(suggestedResource2.id)).toBeTruthy();
    });

    it("should filter the collection by supported resource types according to fieldType and filter by suggested url", async () => {
      expect.assertions(4);

      const suggestedResource1 = resourceStandaloneTotpDto({
        metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
      });
      const suggestedResource2 = resourceWithTotpDto({
        metadata: defaultResourceMetadataDto({ uris: ["passbolt.com"] }),
      });
      const notSuggestedResource1 = resourceStandaloneTotpDto({
        metadata: defaultResourceMetadataDto({ uris: ["not-passbolt.com"] }),
      });
      const notSuggestedResource2 = resourceWithTotpDto({ metadata: defaultResourceMetadataDto({ uris: [""] }) });
      const notSuggestedResource3 = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: [""] }),
      });

      const resourcesCollections = new ResourcesCollection([
        suggestedResource1,
        suggestedResource2,
        notSuggestedResource1,
        notSuggestedResource2,
        notSuggestedResource3,
      ]);

      jest
        .spyOn(FindAndUpdateResourcesLocalStorageFromOPFSService.prototype, "findAndUpdateAll")
        .mockImplementation(() => resourcesCollections);
      jest
        .spyOn(service.getOrFindResourceTypesService, "getOrFindAll")
        .mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

      const resources = await service.getOrFindSuggested("https://www.passbolt.com", "otp");

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(2);
      expect(resources.getFirstById(suggestedResource1.id)).toBeTruthy();
      expect(resources.getFirstById(suggestedResource2.id)).toBeTruthy();
    });

    it("should filter the collection by default supported resource types when fieldType is unknown and filter by suggested url", async () => {
      expect.assertions(4);

      const suggestedResource1 = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
      });
      const suggestedResource2 = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["passbolt.com"] }),
      });
      const notSuggestedResource1 = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["not-passbolt.com"] }),
      });
      const notSuggestedResource2 = defaultResourceDto({ metadata: defaultResourceMetadataDto({ uris: [""] }) });

      const resourcesCollections = new ResourcesCollection([
        suggestedResource1,
        suggestedResource2,
        notSuggestedResource1,
        notSuggestedResource2,
      ]);

      jest
        .spyOn(FindAndUpdateResourcesLocalStorageFromOPFSService.prototype, "findAndUpdateAll")
        .mockImplementation(() => resourcesCollections);
      jest
        .spyOn(service.getOrFindResourceTypesService, "getOrFindAll")
        .mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

      const resources = await service.getOrFindSuggested("https://www.passbolt.com", "test");

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(2);
      expect(resources.getFirstById(suggestedResource1.id)).toBeTruthy();
      expect(resources.getFirstById(suggestedResource2.id)).toBeTruthy();
    });

    it.each([
      { fieldType: "username", expectedSuggested: "password" },
      { fieldType: "password", expectedSuggested: "password" },
      { fieldType: "otp", expectedSuggested: "totp" },
    ])(
      "should never return the note and custom fields resources matching the url when fieldType is $fieldType",
      async ({ fieldType, expectedSuggested }) => {
        expect.assertions(4);

        const matchingResources = {
          password: defaultResourceDto({ metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }) }),
          totp: resourceStandaloneTotpDto({ metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }) }),
        };
        const matchingNote = resourceStandaloneNoteDto({
          metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
        });
        const matchingCustomFields = resourceStandaloneCustomFieldsDto({
          metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
        });

        const resourcesCollections = new ResourcesCollection([
          matchingResources.password,
          matchingResources.totp,
          matchingNote,
          matchingCustomFields,
        ]);
        jest
          .spyOn(FindAndUpdateResourcesLocalStorageFromOPFSService.prototype, "findAndUpdateAll")
          .mockImplementation(() => resourcesCollections);
        jest
          .spyOn(service.getOrFindResourceTypesService, "getOrFindAll")
          .mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

        const resources = await service.getOrFindSuggested("https://www.passbolt.com", fieldType);

        expect(resources).toHaveLength(1);
        expect(resources.getFirstById(matchingResources[expectedSuggested].id)).toBeTruthy();
        expect(resources.getFirstById(matchingNote.id)).toBeUndefined();
        expect(resources.getFirstById(matchingCustomFields.id)).toBeUndefined();
      },
    );

    it("should not return any resources if no suggestions are found.", async () => {
      expect.assertions(2);

      const resourcesCollections = new ResourcesCollection(resourceAllTypesDtosCollection());

      jest
        .spyOn(FindAndUpdateResourcesLocalStorageFromOPFSService.prototype, "findAndUpdateAll")
        .mockImplementation(() => resourcesCollections);
      jest
        .spyOn(service.getOrFindResourceTypesService, "getOrFindAll")
        .mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

      const resources = await service.getOrFindSuggested("https://www.not-passbolt.com", "password");

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(0);
    });
  });

  describe("::getOrFindSuggestedForQuickAccess", () => {
    let service;

    beforeEach(() => {
      service = new GetOrFindOfflineResourcesService(account, apiClientOptions);
    });

    it("should return an empty resource collection without URL", async () => {
      expect.assertions(2);

      const resources = await service.getOrFindSuggestedForQuickAccess();

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(0);
    });

    it("should filter the collection by quick access resource types and filter by suggested url", async () => {
      expect.assertions(4);

      const suggestedResource1 = resourceStandaloneTotpDto({
        metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
      });
      const suggestedResource2 = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["passbolt.com"] }),
      });
      const notSuggestedResource1 = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["not-passbolt.com"] }),
      });
      const notSuggestedResource2 = defaultResourceDto({ metadata: defaultResourceMetadataDto({ uris: [""] }) });

      const resourcesCollections = new ResourcesCollection([
        suggestedResource1,
        suggestedResource2,
        notSuggestedResource1,
        notSuggestedResource2,
      ]);

      jest
        .spyOn(FindAndUpdateResourcesLocalStorageFromOPFSService.prototype, "findAndUpdateAll")
        .mockImplementation(() => resourcesCollections);
      jest
        .spyOn(service.getOrFindResourceTypesService, "getOrFindAll")
        .mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

      const resources = await service.getOrFindSuggestedForQuickAccess("https://www.passbolt.com");

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(2);
      expect(resources.getFirstById(suggestedResource1.id)).toBeTruthy();
      expect(resources.getFirstById(suggestedResource2.id)).toBeTruthy();
    });

    it("should return the note and custom fields resources matching the url", async () => {
      expect.assertions(5);

      const suggestedPassword = defaultResourceDto({
        metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
      });
      const suggestedNote = resourceStandaloneNoteDto({
        metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
      });
      const suggestedCustomFields = resourceStandaloneCustomFieldsDto({
        metadata: defaultResourceMetadataDto({ uris: ["https://passbolt.com"] }),
      });
      const notSuggestedNote = resourceStandaloneNoteDto({
        metadata: defaultResourceMetadataDto({ uris: ["not-passbolt.com"] }),
      });

      const resourcesCollections = new ResourcesCollection([
        suggestedPassword,
        suggestedNote,
        suggestedCustomFields,
        notSuggestedNote,
      ]);
      jest
        .spyOn(FindAndUpdateResourcesLocalStorageFromOPFSService.prototype, "findAndUpdateAll")
        .mockImplementation(() => resourcesCollections);
      jest
        .spyOn(service.getOrFindResourceTypesService, "getOrFindAll")
        .mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

      const resources = await service.getOrFindSuggestedForQuickAccess("https://www.passbolt.com");

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(3);
      expect(resources.getFirstById(suggestedPassword.id)).toBeTruthy();
      expect(resources.getFirstById(suggestedNote.id)).toBeTruthy();
      expect(resources.getFirstById(suggestedCustomFields.id)).toBeTruthy();
    });
  });
});
