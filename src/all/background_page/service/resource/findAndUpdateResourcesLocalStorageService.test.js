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
import FindAndUpdateResourcesLocalStorage from "./findAndUpdateResourcesLocalStorageService";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {multipleResourceDtos, singleResourceDtos} from "./findAndUpdateResourcesLocalStorageService.test.data";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceTypeService from "../api/resourceType/resourceTypeService";
import FindResourcesService from "./findResourcesService";
import {defaultResourceDto, resourceLegacyDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import {multipleResourceIncludingUnsupportedResourceTypesDtos, multipleResourceWithMetadataEncrypted} from "./findResourcesService.test.data";
import {metadata} from "passbolt-styleguide/test/fixture/encryptedMetadata/metadata";
import DecryptMessageService from "../crypto/decryptMessageService";
import {defaultDecryptedSharedMetadataKeysDtos} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import GetDecryptedUserPrivateKeyService from "../account/getDecryptedUserPrivateKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {v4 as uuidv4} from "uuid";

jest.useFakeTimers();

beforeEach(async() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("UpdateResourcesLocalStorage", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = new ApiClientOptions().setBaseUrl('https://localhost');

  describe("::findAndUpdateAll", () => {
    let service;

    beforeEach(() => {
      service = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
    });

    it("asserts updatePeriodThreshold parameter", async() => {
      expect.assertions(1);
      const options = new ApiClientOptions().setBaseUrl('https://localhost');
      const resourceLocalStorageUpdateService = new FindAndUpdateResourcesLocalStorage(account, options);
      expect(() => resourceLocalStorageUpdateService.findAndUpdateAll({updatePeriodThreshold: false})).rejects.toThrow("Parameter updatePeriodThreshold should be a number.");
    });

    it("updates local storage when no resources are returned by the API.", async() => {
      expect.assertions(3);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => []);
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");

      const resourcesCollection = await service.findAndUpdateAll();

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(0);
      expect(resourcesCollection).toEqual(new ResourcesCollection(resourcesLSDto));
    });

    it("updates local storage with a single resource.", async() => {
      expect.assertions(4);
      const resourcesDto = singleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");

      const resourcesCollection = await service.findAndUpdateAll();

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(1);
      expect(resourcesLSDto).toEqual(resourcesDto);
      expect(resourcesCollection).toEqual(new ResourcesCollection(resourcesDto));
    });

    it("updates local storage with multiple resources.", async() => {
      expect.assertions(5);
      const resourcesDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");

      expect(ResourceLocalStorage._cachedData).toBeNull();
      const resourcesCollection = await service.findAndUpdateAll();

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(4);
      expect(resourcesLSDto).toEqual(resourcesDto);
      expect(resourcesCollection).toEqual(new ResourcesCollection(resourcesDto));
    });

    it("overrides local storage with a second update call.", async() => {
      expect.assertions(5);
      const resourcesDto = singleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");
      await ResourceLocalStorage.set(new ResourcesCollection(multipleResourceDtos()));

      expect(ResourceLocalStorage._cachedData).not.toBeNull();
      const resourcesCollection = await service.findAndUpdateAll();

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(1);
      expect(resourcesLSDto).toEqual(resourcesDto);
      expect(resourcesCollection).toEqual(new ResourcesCollection(resourcesDto));
    });

    it("does not update the local storage if the update period threshold given in parameter is not overdue.", async() => {
      expect.assertions(6);
      const resourcesDto = singleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");
      jest.spyOn(ResourceLocalStorage, "get");
      await ResourceLocalStorage.set(new ResourcesCollection(multipleResourceDtos()));

      const resourcesCollection =  await service.findAndUpdateAll();
      const unexpectedDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => unexpectedDto);
      const resourcesCollectionWithThreshold =  await service.findAndUpdateAll({updatePeriodThreshold: 1000});

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.get).toHaveBeenCalledTimes(3);
      expect(resourcesLSDto).toHaveLength(1);
      expect(resourcesLSDto).toEqual(resourcesDto);
      expect(resourcesCollection).toEqual(new ResourcesCollection(resourcesDto));
      expect(resourcesCollectionWithThreshold).not.toEqual(new ResourcesCollection(unexpectedDto));
    });

    it("updates the local storage if the update period threshold given in parameter is overdue.", async() => {
      expect.assertions(5);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => singleResourceDtos());
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");
      await ResourceLocalStorage.set(new ResourcesCollection(multipleResourceDtos()));

      const resourcesCollection =  await service.findAndUpdateAll();
      const resourcesDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.advanceTimersByTime(1001);
      const resourcesCollectionOverdue =  await service.findAndUpdateAll({updatePeriodThreshold: 1000});

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(2);
      expect(resourcesLSDto).toHaveLength(4);
      expect(resourcesLSDto).toEqual(resourcesDto);
      expect(resourcesCollection).not.toEqual(resourcesCollectionOverdue);
      expect(resourcesCollectionOverdue).toEqual(new ResourcesCollection(resourcesDto));
    });

    it("should update the local storage without resources having unknown resource types.", async() => {
      expect.assertions(2);
      const apiResources = multipleResourceIncludingUnsupportedResourceTypesDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => apiResources);
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");
      await ResourceLocalStorage.set(new ResourcesCollection([]));

      await service.findAndUpdateAll();

      const resourcesLSDto = await ResourceLocalStorage.get();
      expect(apiResources).toHaveLength(6);
      expect(resourcesLSDto).toHaveLength(4);
    });

    it("should not decrypt resources if decryption result is already known and resource is unmodified.", async() => {
      expect.assertions(2);
      const localResource = [resourceLegacyDto({name: "Resource0"})];
      const resourceWithEncryptedMetadata = resourceLegacyDto(localResource[0]);
      resourceWithEncryptedMetadata.metadata = metadata.withAdaKey.encryptedMetadata[0];

      const apiResources = [resourceWithEncryptedMetadata];
      await ResourceLocalStorage.set(new ResourcesCollection(localResource));

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => apiResources);
      jest.spyOn(DecryptMessageService, "decrypt");

      const resourcesCollection = await service.findAndUpdateAll();

      expect(DecryptMessageService.decrypt).not.toHaveBeenCalled();
      expect(resourcesCollection.items[0].isMetadataDecrypted()).toStrictEqual(true);
    });

    it("should filter out all resources which throws an error.", async() => {
      expect.assertions(2);

      await ResourceLocalStorage.set(new ResourcesCollection([]));

      const resourceWithUnsupportedResourceType = multipleResourceIncludingUnsupportedResourceTypesDtos();
      const resourceWithError = defaultResourceDto({resource_type_id: null});
      const apiResources = resourceWithUnsupportedResourceType.concat(resourceWithError);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => apiResources);
      const storedResourceCollection = await service.findAndUpdateAll();

      expect(apiResources).toHaveLength(7);
      expect(storedResourceCollection).toHaveLength(4);
    });

    it("should return a collection with resources metadata decrypted", async() => {
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      const resourcesDto = multipleResourceWithMetadataEncrypted(metadataKeysDtos[0].id);
      const resourceTypesDto = resourceTypesCollectionDto();

      expect.assertions(2 + resourcesDto.length);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementation(() => OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted));
      jest.spyOn(service.decryptMetadataService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);

      const resources = await service.findAndUpdateAll();

      expect(resources).toHaveLength(resourcesDto.length);
      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(2);

      for (let i = 0; i < resources._items.length; i++) {
        expect(resources._items[i].isMetadataDecrypted()).toStrictEqual(true);
      }
    }, 10 * 1000);

    it("should return a collection with resources metadata decrypted and resources metadata encrypted filtered out (shared key cannot be found)", async() => {
      const metadata_key_id = uuidv4();
      const resourcesDto = multipleResourceWithMetadataEncrypted(metadata_key_id);
      const resourceTypesDto = resourceTypesCollectionDto();

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementation(() => OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted));
      jest.spyOn(service.decryptMetadataService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => new MetadataKeysCollection([]));

      const resources = await service.findAndUpdateAll();

      expect(resources).toHaveLength(4);

      expect.assertions(1 + 4);

      for (let i = 0; i < resources._items.length; i++) {
        expect(resources._items[i].isMetadataDecrypted()).toStrictEqual(true);
      }
    });

    it("waits any on-going call to the update and returns the result of the local storage.", async() => {
      expect.assertions(3);
      const resourcesDto = singleResourceDtos();
      let resolve;
      const promise = new Promise(_resolve => resolve = _resolve);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => promise);
      jest.spyOn(FindResourcesService.prototype, "findAllForLocalStorage");

      service.findAndUpdateAll();
      const promiseSecondCall = service.findAndUpdateAll();
      resolve(resourcesDto);
      await promiseSecondCall;
      const resourcesLSDto = await ResourceLocalStorage.get();

      expect(FindResourcesService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesLSDto).toHaveLength(1);
      expect(resourcesLSDto).toEqual(resourcesDto);
    });
  });

  describe("::findAndUpdateByIsSharedWithGroup", () => {
    let service;

    beforeEach(() => {
      service = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
    });

    it("should extract the id from the resource collection", async() => {
      expect.assertions(3);

      const resourcesDto = multipleResourceDtos();
      const expectedCollection = new ResourcesCollection(resourcesDto);
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(service.findResourcesServices, "findAllByIsSharedWithGroupForLocalStorage");

      const resourcesCollection = await service.findAndUpdateByIsSharedWithGroup();

      expect(service.findResourcesServices.findAllByIsSharedWithGroupForLocalStorage).toHaveBeenCalled();
      expect(service.findResourcesServices.findAllByIsSharedWithGroupForLocalStorage).toHaveBeenCalledTimes(1);
      expect(resourcesCollection).toEqual(expectedCollection);
    });

    it("should allow empty collection for a group ID", async() => {
      expect.assertions(1);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => []);

      const resourcesCollection = await service.findAndUpdateByIsSharedWithGroup();

      expect(resourcesCollection.length).toEqual(0);
    });

    it("should update localstorage with new resources", async() => {
      expect.assertions(6);

      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto();
      const resourceDto3 = defaultResourceDto();
      const resourceDto4 = defaultResourceDto();
      const resourcesDtos = [resourceDto1, resourceDto2, resourceDto3, resourceDto4];

      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDtos));

      const resources = [
        resourceDto1,
        {...resourceDto2, name: "Resource 2 name update"},
        resourceDto3,
        {...resourceDto4, name: "Resource 4 name update"},
      ];

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resources);

      await service.findAndUpdateByIsSharedWithGroup();

      const expectLocalStorageResult = await ResourceLocalStorage.get();

      expect(expectLocalStorageResult).toEqual(expect.any(Array));
      expect(expectLocalStorageResult).toHaveLength(4);
      expect(expectLocalStorageResult[0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto1));
      expect(expectLocalStorageResult[1]).toEqual(ResourceEntity.transformDtoFromV4toV5({...resourceDto2, name: "Resource 2 name update"}));
      expect(expectLocalStorageResult[2]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto3));
      expect(expectLocalStorageResult[3]).toEqual(ResourceEntity.transformDtoFromV4toV5({...resourceDto4, name: "Resource 4 name update"}));
    });

    it("should add new entry to localstorage with new resources", async() => {
      expect.assertions(4);

      const resourceDto1 = defaultResourceDto();
      const resourceDto2 = defaultResourceDto();
      const resourcesDtos = [resourceDto1];

      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDtos));

      const resources = [
        resourceDto1,
        resourceDto2
      ];

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resources);

      await service.findAndUpdateByIsSharedWithGroup();

      const expectLocalStorageResult = await ResourceLocalStorage.get();

      expect(expectLocalStorageResult).toEqual(expect.any(Array));
      expect(expectLocalStorageResult).toHaveLength(2);
      expect(expectLocalStorageResult[0]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto1));
      expect(expectLocalStorageResult[1]).toEqual(ResourceEntity.transformDtoFromV4toV5(resourceDto2));
    });
  });

  describe("::findAndUpdateAllByParentFolderId", () => {
    let service;

    beforeEach(() => {
      service = new FindAndUpdateResourcesLocalStorage(account, apiClientOptions);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
    });

    it("should extract the id from the resource collection", async() => {
      expect.assertions(2);

      const parentFolderId = uuidv4();

      const resourcesDto = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(service.findResourcesServices, "findAllByParentFolderIdForLocalStorage");

      await service.findAndUpdateAllByParentFolderId(parentFolderId);

      expect(service.findResourcesServices.findAllByParentFolderIdForLocalStorage).toHaveBeenCalledTimes(1);
      expect(service.findResourcesServices.findAllByParentFolderIdForLocalStorage).toHaveBeenCalledWith(parentFolderId);
    });

    it("should assert its parameter", async() => {
      expect.assertions(1);
      await expect(() => service.findAndUpdateAllByParentFolderId("test")).rejects.toThrow();
    });

    it("should update the local storage resource collection by removing deleted resources, moving resources and updating resources data", async() => {
      expect.assertions(8);

      const parentFolderId = uuidv4();
      const otherParentFolderId = uuidv4();

      /*
       * Resources collection in local storage:
       * Resource0.folderParentId = null;
       * Resource1.folderParentId = parentFolderId; // on API it should be modified only
       * Resource2.folderParentId = parentFolderId; // on API it should be moved
       * Resource3.folderParentId = parentFolderId; // on API it should be removed
       */

      const resourcesDto = multipleResourceDtos();
      resourcesDto[1].folder_parent_id = parentFolderId;
      resourcesDto[2].folder_parent_id = parentFolderId;
      resourcesDto[3].folder_parent_id = parentFolderId;

      delete resourcesDto[0].name;
      delete resourcesDto[1].name;
      delete resourcesDto[2].name;
      delete resourcesDto[3].name;

      const localStorageResourceCollection = new ResourcesCollection(resourcesDto);
      await ResourceLocalStorage.set(localStorageResourceCollection);

      // the resources in the folder on the API does not have resource2 anymore but resources1 remains and is changed.
      const apiResourcesDtoInFolder = [
        {...resourcesDto[1]},
      ];
      apiResourcesDtoInFolder[0].metadata.name = "Resource1 - UPDATED";
      apiResourcesDtoInFolder[0].modified = (new Date()).toISOString();

      // resource2 on the API will be return and updated, resource3 will never be sent back as it is deleted
      const allIdsApiResourcesDto = [
        {...resourcesDto[2]},
      ];
      allIdsApiResourcesDto[0].folder_parent_id = otherParentFolderId;

      async function mockedFindAllApi(_, filter) {
        const isParentFolderSearchRequest = Boolean(filter["has-parent"]);

        return isParentFolderSearchRequest
          ? apiResourcesDtoInFolder
          : allIdsApiResourcesDto;
      }

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(mockedFindAllApi);

      await service.findAndUpdateAllByParentFolderId(parentFolderId);

      const updatedResourceLocalStorage = new ResourcesCollection(await ResourceLocalStorage.get());

      expect(updatedResourceLocalStorage).toHaveLength(3); //1 resource should be removed compared to the original data
      const resource0 = updatedResourceLocalStorage.getFirstById(resourcesDto[0].id);
      expect(resource0.toDto(ResourceEntity.ALL_CONTAIN_OPTIONS)).toStrictEqual(resourcesDto[0]); //this resource should remain unchanged

      const updatedResource1 = updatedResourceLocalStorage.getFirstById(resourcesDto[1].id); // this resource should have been updated but not moved
      expect(updatedResource1.metadata.name).toStrictEqual("Resource1 - UPDATED");
      expect(updatedResource1.modified).toStrictEqual(apiResourcesDtoInFolder[0].modified);
      expect(updatedResource1.folderParentId).toStrictEqual(parentFolderId);

      const updatedResource2 = updatedResourceLocalStorage.getFirstById(resourcesDto[2].id); // this resource should not have changed per say but only moved
      expect(updatedResource2.modified).toStrictEqual(resourcesDto[2].modified);
      expect(updatedResource2.folderParentId).toStrictEqual(otherParentFolderId);

      const updatedResource3 = updatedResourceLocalStorage.getFirstById(resourcesDto[3].id); // this resource should have been removed
      expect(updatedResource3).toBeUndefined();
    });
  });
});
