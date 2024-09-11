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
 * @since         4.9.4
 */

import ResourceService from "../api/resource/resourceService";
import {ApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import ResourceTypeService from "../api/resourceType/resourceTypeService";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import GetOrFindResourcesService from "./getOrFindResourcesService";
import UpdateResourcesLocalStorageService from "./updateResourcesLocalStorageService";
import {multipleResourceDtos} from "./getOrFindResourcesService.test.data";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("GetOrFindResourcesService", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = new ApiClientOptions().setBaseUrl('https://localhost');

  describe("::getOrFindAll", () => {
    it("retrieves empty resources from the API when the local storage is not initialized", async() => {
      expect.assertions(6);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => []);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(UpdateResourcesLocalStorageService.prototype, "updateAll");

      const service = new GetOrFindResourcesService(account, apiClientOptions);
      const resources = await service.getOrFindAll();

      expect(UpdateResourcesLocalStorageService.prototype.updateAll).toHaveBeenCalledTimes(1);
      expect(UpdateResourcesLocalStorageService.prototype.updateAll).toHaveBeenCalledWith(); //to be verified as it's the default parameter value, I think it should be this way, but I can be wrong
      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources).toHaveLength(0);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(await ResourceLocalStorage.get()).toEqual([]);
    });

    it("retrieves resources of all types from the API when the local storage is not initialized.", async() => {
      expect.assertions(4);
      const resourcesDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());

      const service = new GetOrFindResourcesService(account, apiClientOptions);
      const resources = await service.getOrFindAll();

      expect(resources).toHaveLength(4);
      expect(resources.toDto(ResourceLocalStorage.DEFAULT_CONTAIN)).toEqual(resourcesDto);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(await ResourceLocalStorage.get()).toEqual(resourcesDto);
    });

    it("retrieves resources of all types from the local storage when the local storage is initialized.", async() => {
      expect.assertions(5);
      const resourcesDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll");
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));

      const service = new GetOrFindResourcesService(account, apiClientOptions);
      const resources = await service.getOrFindAll();

      expect(ResourceService.prototype.findAll).not.toHaveBeenCalled();
      expect(resources).toHaveLength(4);
      expect(resources.toDto(ResourceLocalStorage.DEFAULT_CONTAIN)).toEqual(resourcesDto);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(await ResourceLocalStorage.get()).toEqual(resourcesDto);
    });

    it("does not validate the resources collection if the information is retrieved from the runtime cache.", async() => {
      expect.assertions(2);
      jest.spyOn(ResourceService.prototype, "findAll");
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(ResourcesCollection.prototype, "validateSchema");
      await ResourceLocalStorage.set(new ResourcesCollection([]));

      const service = new GetOrFindResourcesService(account, apiClientOptions);
      await service.getOrFindAll();

      expect(ResourceService.prototype.findAll).not.toHaveBeenCalled();
      // Validation should be called only once when building the collection mock.
      expect(ResourcesCollection.prototype.validateSchema).toHaveBeenCalledTimes(1);
    });

    it("validates resources collection if the local storage has no runtime cache and the information is retrieved from the local storage.", async() => {
      expect.assertions(2);
      jest.spyOn(ResourceService.prototype, "findAll");
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(ResourcesCollection.prototype, "validateSchema");
      await ResourceLocalStorage.set(new ResourcesCollection([]));
      ResourceLocalStorage._cachedData = null;

      const service = new GetOrFindResourcesService(account, apiClientOptions);
      await service.getOrFindAll();

      expect(ResourceService.prototype.findAll).not.toHaveBeenCalled();
      // Validation should be called twice, once when building the collection mock, and once by the getOrFindAll.
      expect(ResourcesCollection.prototype.validateSchema).toHaveBeenCalledTimes(2);
    });
  });
});
