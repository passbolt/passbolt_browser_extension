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
  multipleResourceIncludingUnsupportedResourceTypesDtos} from "./findResourcesService.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";


beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindResourcesService", () => {
  let findResourcesService, apiClientOptions;
  const account = new AccountEntity(defaultAccountDto());

  beforeEach(async() => {
    apiClientOptions = defaultApiClientOptions();
    findResourcesService = new FindResourcesService(account, apiClientOptions);
  });

  describe("::findAll", () => {
    it("should return all items with any params.", async() => {
      expect.assertions(2);

      const collection = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => collection);

      const resources = await findResourcesService.findAll();

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(resources.toDto()).toEqual(collection);
    });

    it("should filter collection when param is defined.", async() => {
      expect.assertions(3);

      const collection = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => collection);

      const resources = await findResourcesService.findAll(null, {
        "has-tag": false,
        "is-favorite": true
      });

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(findResourcesService.resourceService.findAll).toHaveBeenCalledWith(null, {
        "has-tag": false,
        "is-favorite": true
      });
      expect(resources.toDto()).toEqual(collection);
    });

    it("should add field to collection when contains param is defined.", async() => {
      expect.assertions(3);

      const collection = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => collection);

      const resources = await findResourcesService.findAll({favorite: true, permission: true, tag: true}, null);

      expect(resources).toBeInstanceOf(ResourcesCollection);
      expect(findResourcesService.resourceService.findAll).toHaveBeenCalledWith({favorite: true, permission: true, tag: true}, null);
      expect(resources.toDto()).toEqual(collection);
    });

    it("should skip invalid entity with ignore strategy.", async() => {
      expect.assertions(2);

      const multipleResources = multipleResourceIncludingUnsupportedResourceTypesDtos();
      const resourcesCollectionDto = multipleResources.concat([defaultResourceDto({
        resource_type_id: null
      })]);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesCollectionDto);
      const resources = await findResourcesService.findAll(null, null, true);

      expect(resources).toHaveLength(6);
      expect(resources.toDto(ResourceLocalStorage.DEFAULT_CONTAIN)).toEqual(multipleResources);
    });

    it("should not skip invalid entity without ignore strategy.", async() => {
      expect.assertions(1);

      const multipleResources = multipleResourceIncludingUnsupportedResourceTypesDtos();
      const resourcesCollectionDto = multipleResources.concat([defaultResourceDto({
        resource_type_id: null
      })]);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesCollectionDto);
      const promise = findResourcesService.findAll(null, null, false);

      await expect(promise).rejects.toThrow(CollectionValidationError);
    });

    it("should not allow invalid contains params.", async() => {
      expect.assertions(1);

      const collection = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => collection);

      const promise = findResourcesService.findAll({
        invalid: true
      });

      expect(promise).rejects.toThrow(Error("Unsupported contains parameter used, please check supported contains"));
    });

    it("should not allow invalid filters params.", async() => {
      expect.assertions(1);

      const collection = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => collection);

      const promise = findResourcesService.findAll(null, {
        "is-not-supported": true
      });

      expect(promise).rejects.toThrow(Error("Unsupported filter parameter used, please check supported filters"));
    });
  });
  describe("::findAllForLocalStorage", () => {
    it("uses the contains required by the local storage.", async() => {
      expect.assertions(2);
      jest.spyOn(findResourcesService, "findAll");
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => []);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());

      const resources = await findResourcesService.findAllForLocalStorage();

      expect(findResourcesService.resourceService.findAll).toHaveBeenCalledWith({favorite: true, permission: true, tag: true}, null);
      expect(resources).toBeInstanceOf(ResourcesCollection);
    });

    it("retrieves resources of all types.", async() => {
      expect.assertions(1);
      const resourcesDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());

      const resources = await findResourcesService.findAllForLocalStorage();

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

      const collection = await findResourcesService.findAllForLocalStorage();

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

      const resources = await findResourcesService.findAllForLocalStorage();

      expect(resources).toHaveLength(4);
      expect(resources.toDto(ResourceLocalStorage.DEFAULT_CONTAIN)).toEqual(expectedRetainedResource);
    });
  });
});
