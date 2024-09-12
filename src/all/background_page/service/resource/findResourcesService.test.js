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
import FindResourcesService from "./findResourcesService";
import ResourceTypeService from "../api/resourceType/resourceTypeService";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import {
  multipleResourceDtos,
  multipleResourceIncludingUnsupportedResourceTypesDtos
} from "./findResourcesService.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("FindResourcesService", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = new ApiClientOptions().setBaseUrl('https://localhost');

  describe("::findAllForLocalStorage", () => {
    it("uses the contains required by the local storage.", async() => {
      expect.assertions(2);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => []);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());

      const service = new FindResourcesService(account, apiClientOptions);
      const resources = await service.findAllForLocalStorage();

      expect(service.resourceService.findAll).toHaveBeenCalledWith({favorite: true, permission: true, tag: true});
      expect(resources).toBeInstanceOf(ResourcesCollection);
    });

    it("retrieves resources of all types.", async() => {
      expect.assertions(1);
      const resourcesDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());

      const service = new FindResourcesService(account, apiClientOptions);
      const resources = await service.findAllForLocalStorage();

      expect(resources.toDto(ResourceLocalStorage.DEFAULT_CONTAIN)).toEqual(resourcesDto);
    });


    it("should not throw an error if required field is missing with ignore strategy", async() => {
      expect.assertions(2);
      const multipleResources = multipleResourceIncludingUnsupportedResourceTypesDtos();
      const resourcesCollectionDto = multipleResources.concat([defaultResourceDto({
        resource_type_id: null
      })]);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesCollectionDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
      const expectedRetainedResource = [multipleResources[0], multipleResources[1], multipleResources[3], multipleResources[4]];

      const service = new FindResourcesService(account, apiClientOptions);
      const collection = await service.findAllForLocalStorage();

      expect(collection).toHaveLength(4);
      expect(collection.toDto(ResourceLocalStorage.DEFAULT_CONTAIN)).toEqual(expectedRetainedResource);
    });

    it("ignores resources having an unknown resource type.", async() => {
      expect.assertions(2);
      const resourcesDto = multipleResourceIncludingUnsupportedResourceTypesDtos();
      const expectedRetainedResource = [resourcesDto[0], resourcesDto[1], resourcesDto[3], resourcesDto[4]];
      const resourceTypesDto = resourceTypesCollectionDto();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesDto);

      const service = new FindResourcesService(account, apiClientOptions);
      const resources = await service.findAllForLocalStorage();

      expect(resources).toHaveLength(4);
      expect(resources.toDto(ResourceLocalStorage.DEFAULT_CONTAIN)).toEqual(expectedRetainedResource);
    });
  });
});
