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
 * @since         4.6.0
 */

import ResourceService from "../api/resource/resourceService";
import {ApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions";
import UpdateResourcesLocalStorageService from "./updateResourcesLocalStorageService";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {multipleResourceDtos, singleResourceDtos} from "./updateResourceLocalStorageService.test.data";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceTypeService from "../api/resourceType/resourceTypeService";
import FindResourcesService from "./findResourcesService";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("UpdateResourcesLocalStorage", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = new ApiClientOptions().setBaseUrl('https://localhost');

  describe("::updateAll", () => {
    it("asserts updatePeriodThreshold parameter", async() => {
      expect.assertions(1);
      const options = new ApiClientOptions().setBaseUrl('https://localhost');
      const resourceLocalStorageUpdateService = new UpdateResourcesLocalStorageService(account, options);
      expect(() => resourceLocalStorageUpdateService.updateAll({updatePeriodThreshold: false})).rejects.toThrow("Parameter forceUpdatePeriod should be a number.");
    });

    it("updates local storage when no resources are returned by the API.", async() => {
      expect.assertions(2);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => []);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");

      const service = new UpdateResourcesLocalStorageService(account, apiClientOptions);
      await service.updateAll();

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(0);
    });

    it("updates local storage with a single resource.", async() => {
      expect.assertions(3);
      const resourcesDto = singleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");

      const service = new UpdateResourcesLocalStorageService(account, apiClientOptions);
      await service.updateAll();

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(1);
      expect(resourcesLSDto).toEqual(resourcesDto);
    });

    it("updates local storage with a multiple resource.", async() => {
      expect.assertions(4);
      const resourcesDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");

      const service = new UpdateResourcesLocalStorageService(account, apiClientOptions);
      expect(ResourceLocalStorage._cachedData).toBeNull();
      await service.updateAll();

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(4);
      expect(resourcesLSDto).toEqual(resourcesDto);
    });

    it("overrides local storage with a second update call.", async() => {
      expect.assertions(4);
      const resourcesDto = singleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");
      await ResourceLocalStorage.set(new ResourcesCollection(multipleResourceDtos()));

      const service = new UpdateResourcesLocalStorageService(account, apiClientOptions);
      expect(ResourceLocalStorage._cachedData).not.toBeNull();
      await service.updateAll();

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(1);
      expect(resourcesLSDto).toEqual(resourcesDto);
    });

    it("does not update the local storage if the update period threshold given in parameter is not overdue.", async() => {
      expect.assertions(3);
      const resourcesDto = singleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");
      await ResourceLocalStorage.set(new ResourcesCollection(multipleResourceDtos()));

      const service = new UpdateResourcesLocalStorageService(account, apiClientOptions);
      await service.updateAll();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => multipleResourceDtos());
      await service.updateAll({updatePeriodThreshold: 1000});

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(1);
      expect(resourcesLSDto).toEqual(resourcesDto);
    });

    it("updates the local storage if the update period threshold given in parameter is overdue.", async() => {
      expect.assertions(3);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => singleResourceDtos());
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");
      await ResourceLocalStorage.set(new ResourcesCollection(multipleResourceDtos()));

      const service = new UpdateResourcesLocalStorageService(account, apiClientOptions);
      await service.updateAll();
      const resourcesDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.advanceTimersByTime(1001);
      await service.updateAll({updatePeriodThreshold: 1000});

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(2);
      expect(resourcesLSDto).toHaveLength(4);
      expect(resourcesLSDto).toEqual(resourcesDto);
    });

    it("waits any on-going call to the update.", async() => {
      expect.assertions(3);
      const resourcesDto = singleResourceDtos();
      let resolve;
      const promise = new Promise(_resolve => resolve = _resolve);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => promise);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");

      const service = new UpdateResourcesLocalStorageService(account, apiClientOptions);
      service.updateAll();
      const promiseSecondCall = service.updateAll();
      resolve(resourcesDto);
      await promiseSecondCall;
      const resourcesLSDto = await ResourceLocalStorage.get();

      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(1);
      expect(resourcesLSDto).toEqual(resourcesDto);
    });
  });
});
