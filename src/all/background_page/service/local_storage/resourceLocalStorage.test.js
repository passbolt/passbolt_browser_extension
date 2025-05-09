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
 * @since         4.9.0
 */
import {v4 as uuidv4} from 'uuid';
import ResourceLocalStorage, {RESOURCES_LOCAL_STORAGE_KEY} from "./resourceLocalStorage";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import {metadata} from "passbolt-styleguide/test/fixture/encryptedMetadata/metadata";

describe("ResourceLocalStorage", () => {
  describe("::get", () => {
    it("Should return undefined if nothing stored in the storage", async() => {
      expect.assertions(1);
      const result = await ResourceLocalStorage.get();
      expect(result).toBeUndefined();
    });

    it("Should return content stored in the local storage", async() => {
      expect.assertions(3);
      const resourcesDto = [defaultResourceDto()];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDto});
      const result = await ResourceLocalStorage.get();
      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(1);
      expect(result).toEqual(resourcesDto);
    });

    it("Should initialize the cache when getting the data for the first time", async() => {
      expect.assertions(5);
      const resourcesDto = [defaultResourceDto()];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDto});
      expect(ResourceLocalStorage.hasCachedData()).toBeFalsy();
      await ResourceLocalStorage.get();
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(ResourceLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(ResourceLocalStorage._cachedData).toHaveLength(1);
      expect(ResourceLocalStorage._cachedData).toEqual(resourcesDto);
    });

    it("Should return content stored in the local storage from the cache if set", async() => {
      expect.assertions(4);
      const resourcesDto = [defaultResourceDto()];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDto});
      // call a first time to initialize the cache.
      expect(ResourceLocalStorage.hasCachedData()).toBeFalsy();
      await ResourceLocalStorage.get();
      // delete voluntarily the local storage data to ensure it is not used.
      await browser.storage.local.remove([RESOURCES_LOCAL_STORAGE_KEY]);
      const result = await ResourceLocalStorage.get();
      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(1);
      expect(result).toEqual(resourcesDto);
    });
  });

  describe("::set", () => {
    it("Should throw if parameter is invalid.", async() => {
      expect.assertions(1);
      await expect(() => ResourceLocalStorage.set(42)).rejects.toThrowError("ResourceLocalStorage::set expects a ResourcesCollection");
    });

    it("Should set local storage with empty data", async() => {
      expect.assertions(2);
      const resources = new ResourcesCollection([]);
      await ResourceLocalStorage.set(resources);
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toHaveLength(0);
    });

    it("Should store data in the local storage", async() => {
      expect.assertions(3);
      const resourcesDto = [defaultResourceDto(), defaultResourceDto()];
      const resources = new ResourcesCollection(resourcesDto);
      await ResourceLocalStorage.set(resources);
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toBeInstanceOf(Array);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toHaveLength(2);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toEqual(resources.toDto(ResourceLocalStorage.DEFAULT_CONTAIN));
    });

    it("Should set the cache when setting the local storage", async() => {
      expect.assertions(5);
      const resourcesDto = [defaultResourceDto(), defaultResourceDto()];
      const resources = new ResourcesCollection(resourcesDto);
      expect(ResourceLocalStorage.hasCachedData()).toBeFalsy();
      await ResourceLocalStorage.set(resources);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(ResourceLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(ResourceLocalStorage._cachedData).toHaveLength(2);
      expect(ResourceLocalStorage._cachedData).toEqual(resources.toDto(ResourceLocalStorage.DEFAULT_CONTAIN));
    });
  });

  describe("::getResourceById", () => {
    it("Should return undefined if the local storage is not yet initialized", async() => {
      expect.assertions(1);
      const result = await ResourceLocalStorage.getResourceById(uuidv4());
      expect(result).toBeUndefined();
    });

    it("Should return nothing if the target resource is not found in the local storage", async() => {
      expect.assertions(1);
      const resourcesDto = [defaultResourceDto(), defaultResourceDto()];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDto});
      const result = await ResourceLocalStorage.getResourceById(uuidv4());
      expect(result).toBeUndefined();
    });

    it("Should return the target resource if found in the local storage", async() => {
      expect.assertions(2);
      const resourcesDto = [defaultResourceDto(), defaultResourceDto()];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDto});
      const result = await ResourceLocalStorage.getResourceById(resourcesDto[0].id);
      expect(result).toEqual(expect.any(Object));
      expect(result).toEqual(resourcesDto[0]);
    });
  });

  describe("::addResource", () => {
    it("Should throw if no data passed as parameter", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.addResource();
      await expect(promise).rejects.toThrow("ResourceLocalStorage expects a ResourceEntity to be set");
    });

    it("Should throw if the resource parameter is not a ResourceEntity", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.addResource(42);
      await expect(promise).rejects.toThrow("ResourceLocalStorage expects an object of type ResourceEntity");
    });

    it("Should throw if the resource does not validate", async() => {
      expect.assertions(1);
      const resourceDto = defaultResourceDto();
      delete resourceDto.id;
      const resource = new ResourceEntity(resourceDto);
      const promise = ResourceLocalStorage.addResource(resource);
      await expect(promise).rejects.toThrow("ResourceLocalStorage expects ResourceEntity id to be set");
    });

    it("Should store a new resource", async() => {
      expect.assertions(3);
      const resourceDto = defaultResourceDto();
      const resource = new ResourceEntity(resourceDto);
      await ResourceLocalStorage.addResource(resource);
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toHaveLength(1);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto));
    });

    it("Should update the cache with the added resource", async() => {
      expect.assertions(5);
      const resourceDto = defaultResourceDto();
      const resource = new ResourceEntity(resourceDto);
      expect(ResourceLocalStorage.hasCachedData()).toBeFalsy();
      await ResourceLocalStorage.addResource(resource);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(ResourceLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(ResourceLocalStorage._cachedData).toHaveLength(1);
      expect(ResourceLocalStorage._cachedData[0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto));
    });
  });

  describe("::addResources", () => {
    it("Should throw if no data passed as parameter", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.addResources();
      await expect(promise).rejects.toThrow("he `resources` parameter should be of type ResourcesCollection");
    });

    it("Should throw if the resourcesEntities parameter is not an array", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.addResources(42);
      await expect(promise).rejects.toThrow("he `resources` parameter should be of type ResourcesCollection");
    });

    it("Should throw if one of the resources does not validate", async() => {
      expect.assertions(1);
      const resourceDto1 = defaultResourceDto();
      delete resourceDto1.id;
      const resource1 = new ResourceEntity(resourceDto1);
      const resource2 = new ResourceEntity(defaultResourceDto());
      const resourcesArr = new ResourcesCollection([resource1, resource2]);
      const promise = ResourceLocalStorage.addResources(resourcesArr);
      await expect(promise).rejects.toThrow("ResourceLocalStorage expects ResourceEntity id to be set");
    });

    it("Should store new resources", async() => {
      expect.assertions(4);
      const resourceDto1 = defaultResourceDto();
      const resource1 = new ResourceEntity(resourceDto1);
      const resourceDto2 = defaultResourceDto();
      const resource2 = new ResourceEntity(resourceDto2);
      const resourcesArr = new ResourcesCollection([resource1, resource2]);
      await ResourceLocalStorage.addResources(resourcesArr);
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toHaveLength(2);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto1));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][1]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto2));
    });

    it("Should update the cache with the added resources", async() => {
      expect.assertions(6);
      const resourceDto1 = defaultResourceDto();
      const resource1 = new ResourceEntity(resourceDto1);
      const resourceDto2 = defaultResourceDto();
      const resource2 = new ResourceEntity(resourceDto2);
      const resourcesArr = new ResourcesCollection([resource1, resource2]);
      expect(ResourceLocalStorage.hasCachedData()).toBeFalsy();
      await ResourceLocalStorage.addResources(resourcesArr);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(ResourceLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(ResourceLocalStorage._cachedData).toHaveLength(2);
      expect(ResourceLocalStorage._cachedData[0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto1));
      expect(ResourceLocalStorage._cachedData[1]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto2));
    });
  });

  describe("::updateResource", () => {
    it("Should throw if no data passed as parameter", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.updateResource();
      await expect(promise).rejects.toThrow("ResourceLocalStorage expects a ResourceEntity to be set");
    });

    it("Should throw if the resource parameter is not a ResourceEntity", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.updateResource(42);
      await expect(promise).rejects.toThrow("ResourceLocalStorage expects an object of type ResourceEntity");
    });

    it("Should throw if the resource does not validate", async() => {
      expect.assertions(1);
      const resourceDto = defaultResourceDto();
      delete resourceDto.id;
      const resource = new ResourceEntity(resourceDto);
      const promise = ResourceLocalStorage.updateResource(resource);
      await expect(promise).rejects.toThrow("esourceLocalStorage expects ResourceEntity id to be set");
    });

    it("Should throw if the resource is not found in the local storage", async() => {
      expect.assertions(1);
      const resourceDto = defaultResourceDto();
      const resource = new ResourceEntity(resourceDto);
      const promise = ResourceLocalStorage.updateResource(resource);
      await expect(promise).rejects.toThrow('The resource could not be found in the local storage');
    });

    it("Should update the resource", async() => {
      expect.assertions(4);
      const resourceDto = defaultResourceDto();
      const resourcesDtos = [resourceDto];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDtos});
      const resource = new ResourceEntity({...resourceDto, name: "Updated name"});
      await ResourceLocalStorage.updateResource(resource);
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toHaveLength(1);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][0]).toEqual(resource.toDto(ResourceLocalStorage.DEFAULT_CONTAIN));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][0].name).not.toEqual(resourceDto.metadata.name);
    });

    it("Should update the cache with the updated resource", async() => {
      expect.assertions(6);
      const resourceDto = defaultResourceDto();
      const resourcesDtos = [resourceDto];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDtos});
      const resource = new ResourceEntity({...resourceDto, name: "Updated name"});
      expect(ResourceLocalStorage.hasCachedData()).toBeFalsy();
      await ResourceLocalStorage.updateResource(resource);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(ResourceLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(ResourceLocalStorage._cachedData).toHaveLength(1);
      expect(ResourceLocalStorage._cachedData[0]).toEqual(resource.toDto(ResourceLocalStorage.DEFAULT_CONTAIN));
      expect(ResourceLocalStorage._cachedData[0].name).not.toEqual(resourceDto.metadata.name);
    });
  });

  describe("::updateResourcesCollection", () => {
    it("Should throw if no data passed as parameter", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.updateResourcesCollection();
      await expect(promise).rejects.toThrow("The parameter resourcesEntities should be of ResourcesCollection type.");
    });

    it("Should throw if the resourcesEntities parameter is not an array", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.updateResourcesCollection(42);
      await expect(promise).rejects.toThrow("The parameter resourcesEntities should be of ResourcesCollection type.");
    });

    it("Should throw if one of the resources does not validate", async() => {
      expect.assertions(1);
      const resourceDto1 = defaultResourceDto();
      delete resourceDto1.id;
      const resourceDto2 = defaultResourceDto();
      const resources = new ResourcesCollection([resourceDto1, resourceDto2]);
      const promise = ResourceLocalStorage.updateResourcesCollection(resources);
      await expect(promise).rejects.toThrow("ResourceLocalStorage expects ResourceEntity id to be set");
    });

    it("Should throw if one of the resource is not found in the local storage", async() => {
      expect.assertions(1);

      const resourceDto = defaultResourceDto();
      const resources = new ResourcesCollection([resourceDto]);

      const promise = ResourceLocalStorage.updateResourcesCollection(resources);
      await expect(promise).rejects.toThrow('The resource could not be found in the local storage');
    });

    it("Should update resources", async() => {
      expect.assertions(6);
      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto();
      const resourceDto3 = defaultResourceDto();
      const resourceDto4 = defaultResourceDto();
      const resourcesDtos = [resourceDto1, resourceDto2, resourceDto3, resourceDto4];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDtos});
      const resources = new ResourcesCollection([
        resourceDto1,
        {...resourceDto2, name: "Resource 2 name update"},
        resourceDto3,
        {...resourceDto4, name: "Resource 4 name update"},
      ]);
      await ResourceLocalStorage.updateResourcesCollection(resources);
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toHaveLength(4);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto1));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][1]).toEqual(ResourceEntity.transformDtoFromV4toV5({...resourceDto2, name: "Resource 2 name update"}));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][2]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto3));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][3]).toEqual(ResourceEntity.transformDtoFromV4toV5({...resourceDto4, name: "Resource 4 name update"}));
    });

    it("Should update cache when updating resources", async() => {
      expect.assertions(8);
      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto();
      const resourceDto3 = defaultResourceDto();
      const resourceDto4 = defaultResourceDto();
      const resourcesDtos = [resourceDto1, resourceDto2, resourceDto3, resourceDto4];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDtos});
      const resources = new ResourcesCollection([
        resourceDto1,
        {...resourceDto2, name: "Resource 2 name update"},
        resourceDto3,
        {...resourceDto4, name: "Resource 4 name update"},
      ]);
      expect(ResourceLocalStorage.hasCachedData()).toBeFalsy();
      await ResourceLocalStorage.updateResourcesCollection(resources);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(ResourceLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(ResourceLocalStorage._cachedData).toHaveLength(4);
      expect(ResourceLocalStorage._cachedData[0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto1));
      expect(ResourceLocalStorage._cachedData[1]).toEqual(ResourceEntity.transformDtoFromV4toV5({...resourceDto2, name: "Resource 2 name update"}));
      expect(ResourceLocalStorage._cachedData[2]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto3));
      expect(ResourceLocalStorage._cachedData[3]).toEqual(ResourceEntity.transformDtoFromV4toV5({...resourceDto4, name: "Resource 4 name update"}));
    });
  });
  describe("::addOrReplaceResourcesCollection", () => {
    it("Should throw if no data passed as parameter", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.addOrReplaceResourcesCollection();
      await expect(promise).rejects.toThrow("The parameter resourcesEntities should be of ResourcesCollection type.");
    });

    it("Should throw if the resourcesEntities parameter is not an array", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.addOrReplaceResourcesCollection(42);
      await expect(promise).rejects.toThrow("The parameter resourcesEntities should be of ResourcesCollection type.");
    });

    it("Should throw if one of the resources does not validate", async() => {
      expect.assertions(1);
      const resourceDto1 = defaultResourceDto();
      delete resourceDto1.id;
      const resourceDto2 = defaultResourceDto();
      const resources = new ResourcesCollection([resourceDto1, resourceDto2]);
      const promise = ResourceLocalStorage.addOrReplaceResourcesCollection(resources);
      await expect(promise).rejects.toThrow("ResourceLocalStorage expects ResourceEntity id to be set");
    });

    it("Should add the resource if one of the resource is not found in the local storage", async() => {
      expect.assertions(3);

      const resourceDto = defaultResourceDto();
      const resources = new ResourcesCollection([resourceDto]);
      await ResourceLocalStorage.addOrReplaceResourcesCollection(resources);
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);

      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toHaveLength(1);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto));
    });

    it("Should update resources", async() => {
      expect.assertions(6);
      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto();
      const resourceDto3 = defaultResourceDto();
      const resourceDto4 = defaultResourceDto();
      const resourcesDtos = [resourceDto1, resourceDto2, resourceDto3, resourceDto4];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDtos});
      const resources = new ResourcesCollection([
        resourceDto1,
        {...resourceDto2, name: "Resource 2 name update"},
        resourceDto3,
        {...resourceDto4, name: "Resource 4 name update"},
      ]);
      await ResourceLocalStorage.addOrReplaceResourcesCollection(resources);
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toHaveLength(4);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto1));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][1]).toEqual(ResourceEntity.transformDtoFromV4toV5({...resourceDto2, name: "Resource 2 name update"}));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][2]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto3));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][3]).toEqual(ResourceEntity.transformDtoFromV4toV5({...resourceDto4, name: "Resource 4 name update"}));
    });

    it("Should update cache when updating resources", async() => {
      expect.assertions(8);
      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto();
      const resourceDto3 = defaultResourceDto();
      const resourceDto4 = defaultResourceDto();
      const resourcesDtos = [resourceDto1, resourceDto2, resourceDto3, resourceDto4];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDtos});
      const resources = new ResourcesCollection([
        resourceDto1,
        {...resourceDto2, name: "Resource 2 name update"},
        resourceDto3,
        {...resourceDto4, name: "Resource 4 name update"},
      ]);
      expect(ResourceLocalStorage.hasCachedData()).toBeFalsy();
      await ResourceLocalStorage.addOrReplaceResourcesCollection(resources);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(ResourceLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(ResourceLocalStorage._cachedData).toHaveLength(4);
      expect(ResourceLocalStorage._cachedData[0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto1));
      expect(ResourceLocalStorage._cachedData[1]).toEqual(ResourceEntity.transformDtoFromV4toV5({...resourceDto2, name: "Resource 2 name update"}));
      expect(ResourceLocalStorage._cachedData[2]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto3));
      expect(ResourceLocalStorage._cachedData[3]).toEqual(ResourceEntity.transformDtoFromV4toV5({...resourceDto4, name: "Resource 4 name update"}));
    });
  });

  describe("::deleteResource", () => {
    it("Should throw if no data passed as parameter", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.delete();
      await expect(promise).rejects.toThrow("The parameter resourceId should be a UUID.");
    });

    it("Should throw if the resource parameter is not a ResourceEntity", async() => {
      expect.assertions(1);
      const promise = ResourceLocalStorage.delete(42);
      await expect(promise).rejects.toThrow("The parameter resourceId should be a UUID.");
    });

    it("Should do nothing if the resource is not found in the local storage", async() => {
      expect.assertions(2);
      const resourceDto = defaultResourceDto();
      const resourcesDtos = [resourceDto];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDtos});
      await ResourceLocalStorage.delete(uuidv4());
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toHaveLength(1);
    });

    it("Should update the resource", async() => {
      expect.assertions(3);
      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto();
      const resourcesDtos = [resourceDto1, resourceDto2];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDtos});
      await ResourceLocalStorage.delete(resourceDto1.id);
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toHaveLength(1);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY][0]).toEqual(resourceDto2);
    });

    it("Should update cache after deleting the resource", async() => {
      expect.assertions(5);
      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto();
      const resourcesDtos = [resourceDto1, resourceDto2];
      await browser.storage.local.set({[RESOURCES_LOCAL_STORAGE_KEY]: resourcesDtos});
      expect(ResourceLocalStorage.hasCachedData()).toBeFalsy();
      await ResourceLocalStorage.delete(resourceDto1.id);
      expect(ResourceLocalStorage.hasCachedData()).toBeTruthy();
      expect(ResourceLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(ResourceLocalStorage._cachedData).toHaveLength(1);
      expect(ResourceLocalStorage._cachedData[0]).toEqual(resourceDto2);
    });
  });

  describe("::assertEntityBeforeSave", () => {
    it("Should throw if no data provided", async() => {
      expect.assertions(1);
      await expect(() => ResourceLocalStorage.assertEntityBeforeSave()).toThrow("ResourceLocalStorage expects a ResourceEntity to be set");
    });

    it("Should throw if not a ResourceEntity is provided", async() => {
      expect.assertions(1);
      await expect(() => ResourceLocalStorage.assertEntityBeforeSave(42)).toThrow("ResourceLocalStorage expects an object of type ResourceEntity");
    });

    it("Should throw if the resource has no id", async() => {
      expect.assertions(1);
      const resourceDto = defaultResourceDto();
      delete resourceDto.id;
      const resource = new ResourceEntity(resourceDto);
      await expect(() => ResourceLocalStorage.assertEntityBeforeSave(resource)).toThrow("ResourceLocalStorage expects ResourceEntity id to be set");
    });

    it("Should throw if the resource has no permission", async() => {
      expect.assertions(1);
      const resourceDto = defaultResourceDto();
      delete resourceDto.permission;
      const resource = new ResourceEntity(resourceDto);
      await expect(() => ResourceLocalStorage.assertEntityBeforeSave(resource)).toThrow("ResourceLocalStorage::set expects ResourceEntity permission to be set");
    });

    it("Should throw if the resource metadata are encrypted", async() => {
      expect.assertions(1);
      const resourceDto = defaultResourceDto({metadata: metadata.withSharedKey.encryptedMetadata[0]});
      const resource = new ResourceEntity(resourceDto);
      await expect(() => ResourceLocalStorage.assertEntityBeforeSave(resource)).toThrow("ResourceLocalStorage::set expects ResourceEntity metadata to be decrypted");
    });
  });

  describe("::flush", () => {
    it("Should flush not initialized local storage and cache", async() => {
      expect.assertions(2);
      await ResourceLocalStorage.flush();
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toBeUndefined();
      expect(ResourceLocalStorage._cachedData).toBeNull();
    });

    it("Should flush", async() => {
      expect.assertions(2);
      const resourcesDto = [defaultResourceDto(), defaultResourceDto()];
      const resources = new ResourcesCollection(resourcesDto);
      await ResourceLocalStorage.set(resources);
      await ResourceLocalStorage.flush();
      const localStorageData = await browser.storage.local.get([RESOURCES_LOCAL_STORAGE_KEY]);
      expect(localStorageData[RESOURCES_LOCAL_STORAGE_KEY]).toBeUndefined();
      expect(ResourceLocalStorage._cachedData).toBeNull();
    });
  });
});
