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
  multipleResourceIncludingUnsupportedResourceTypesDtos,
  multipleResourceWithMetadataEncrypted} from "./findResourcesService.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import {v4 as uuidv4} from "uuid";
import ExecuteConcurrentlyService from "../execute/executeConcurrentlyService";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import GetDecryptedUserPrivateKeyService from "../account/getDecryptedUserPrivateKeyService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {defaultDecryptedSharedMetadataKeysDtos} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

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

    it("does not retrieve the passphrase from the session storage if passed as parameter", async() => {
      expect.assertions(2);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      const resourcesDto = multipleResourceWithMetadataEncrypted(metadataKeysDtos[0].id);
      const resourceTypesDto = resourceTypesCollectionDto();

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesDto);
      jest.spyOn(PassphraseStorageService, "get");
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementation(() => OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted));
      jest.spyOn(findResourcesService.decryptMetadataService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);

      const resources = await findResourcesService.findAllForLocalStorage(pgpKeys.ada.passphrase);

      expect(resources).toHaveLength(resourcesDto.length);
      expect(PassphraseStorageService.get).not.toHaveBeenCalled();
    }, 10 * 1000);

    it("should return a collection with resources metadata decrypted from a mixed source of information (alread decrypted metadata and encrypted metadata)", async() => {
      expect.assertions(1);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      const resourcesDto = multipleResourceWithMetadataEncrypted(metadataKeysDtos[0].id);
      const decryptedMetadataResourcesDto = multipleResourceDtos();
      const resourceTypesDto = resourceTypesCollectionDto();

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => [...resourcesDto, ...decryptedMetadataResourcesDto]);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementation(() => OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted));
      jest.spyOn(findResourcesService.decryptMetadataService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);

      const resources = await findResourcesService.findAllForLocalStorage();

      expect(resources).toHaveLength(resourcesDto.length + decryptedMetadataResourcesDto.length);
    });
  });

  describe("::findAllByIsSharedWithGroupForLocalStorage", () => {
    let service;
    const groupId = uuidv4();

    beforeEach(() => {
      service = new FindResourcesService(account, apiClientOptions);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
    });

    it("should return resources shared with group id", async() => {
      expect.assertions(1);

      const collection = multipleResourceDtos();
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => collection);

      const resourcesCollection = await service.findAllByIsSharedWithGroupForLocalStorage(groupId);

      expect(resourcesCollection).toEqual(new ResourcesCollection(collection));
    });

    it("should call the api with is-shared-with-group and the groupId associated", async() => {
      expect.assertions(2);

      const collection = multipleResourceDtos();

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => collection);
      jest.spyOn(service, "findAll");

      await service.findAllByIsSharedWithGroupForLocalStorage(groupId);

      expect(service.findAll).toHaveBeenCalledWith(ResourceLocalStorage.DEFAULT_CONTAIN, {"is-shared-with-group": groupId}, true);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledWith(ResourceLocalStorage.DEFAULT_CONTAIN, {"is-shared-with-group": groupId});
    });

    it("should call the api with is-shared-with-group and the groupId associated", async() => {
      expect.assertions(2);

      const collection = multipleResourceDtos();

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => collection);
      jest.spyOn(service, "findAll");

      await service.findAllByIsSharedWithGroupForLocalStorage(groupId);

      expect(service.findAll).toHaveBeenCalledWith(ResourceLocalStorage.DEFAULT_CONTAIN, {"is-shared-with-group": groupId}, true);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledWith(ResourceLocalStorage.DEFAULT_CONTAIN, {"is-shared-with-group": groupId});
    });

    it("should return a collection with resources metadata decrypted", async() => {
      expect.assertions(2);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      const resourcesDto = multipleResourceWithMetadataEncrypted(metadataKeysDtos[0].id);
      const resourceTypesDto = resourceTypesCollectionDto();

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementation(() => OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted));
      jest.spyOn(findResourcesService.decryptMetadataService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);

      const resources = await findResourcesService.findAllByIsSharedWithGroupForLocalStorage(groupId);

      expect(resources).toHaveLength(resourcesDto.length);
      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(1);
    }, 10 * 1000);

    it("does not retrieve the passphrase from the session storage if passed as parameter", async() => {
      expect.assertions(2);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos();
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      const resourcesDto = multipleResourceWithMetadataEncrypted(metadataKeysDtos[0].id);
      const resourceTypesDto = resourceTypesCollectionDto();

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourcesDto);
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesDto);
      jest.spyOn(PassphraseStorageService, "get");
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementation(() => OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted));
      jest.spyOn(findResourcesService.decryptMetadataService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => metadataKeys);

      const resources = await findResourcesService.findAllByIsSharedWithGroupForLocalStorage(groupId, pgpKeys.ada.passphrase);

      expect(resources).toHaveLength(resourcesDto.length);
      expect(PassphraseStorageService.get).not.toHaveBeenCalled();
    }, 10 * 1000);
  });

  describe("::findAllByIds", () => {
    let service;

    beforeEach(() => {
      service = new FindResourcesService(account, apiClientOptions);
    });

    it("should call the api only 1 times when the array of ids length is less than the limit of 80", async() => {
      expect.assertions(4);

      const dtos = Array.from({length: 79}, () => defaultResourceDto());
      const ids = dtos.map(dto => dto.id);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => dtos);
      jest.spyOn(ExecuteConcurrentlyService.prototype, "execute");

      const result = await service.findAllByIds(ids, ResourceLocalStorage.DEFAULT_CONTAIN);

      expect(result).toEqual(new ResourcesCollection(dtos));
      expect(ResourceService.prototype.findAll).toHaveBeenCalledTimes(1);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledWith(ResourceLocalStorage.DEFAULT_CONTAIN, {
        "has-id": ids
      });
      expect(ResourceService.prototype.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("::findAllByIdsForShare", () => {
    let service, expectedContains;

    beforeEach(() => {
      service = new FindResourcesService(account, apiClientOptions);
      expectedContains = {
        "secret": true
      };
    });

    it("should call the api only 1 times when the resource is less than 80", async() => {
      expect.assertions(3);

      const dtos = Array.from({length: 80}, () => defaultResourceDto());
      const ids = dtos.map(dto => dto.id);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => dtos);
      jest.spyOn(ExecuteConcurrentlyService.prototype, "execute");

      const result = await service.findAllByIdsForShare(ids);

      expect(result).toEqual(new ResourcesCollection(dtos));
      expect(ResourceService.prototype.findAll).toHaveBeenCalledTimes(1);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledWith(expectedContains, {
        "has-id": ids
      });
    });

    it("should call the api only 2 times when the resource is more than 80", async() => {
      expect.assertions(4);

      const dtos = Array.from({length: 82}, () => defaultResourceDto());
      // @todo to review, it seems wrong
      const resultCollectionDto = [...dtos];
      const ids = dtos.map(collection => collection.id);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation((contains, filters) => {
        expect(contains).toEqual(expectedContains);
        return resultCollectionDto.splice(0, filters["has-id"].length);
      });

      const result = await service.findAllByIdsForShare(ids);

      expect(result.toDto()).toEqual(dtos);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledTimes(2);
    });
  });

  describe("::findAllByIdsForDisplayPermissions", () => {
    let service, expectedContains;

    beforeEach(() => {
      service = new FindResourcesService(account, apiClientOptions);
      expectedContains = {
        "permission": true,
        "permissions.user.profile": true,
        "permissions.group": true,
      };
    });

    it("should call the api only 1 times when the resource is less than 80", async() => {
      expect.assertions(3);

      const collectionDto = Array.from({length: 80}, () => defaultResourceDto());
      const collectionIds = collectionDto.map(collection => collection.id);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => collectionDto);

      const result = await service.findAllByIdsForDisplayPermissions(collectionIds);

      expect(result).toEqual(new ResourcesCollection(collectionDto));
      expect(ResourceService.prototype.findAll).toHaveBeenCalledTimes(1);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledWith(expectedContains, {
        "has-id": collectionIds
      });
    });

    it("should call the api only 2 times when the resource is more than 80", async() => {
      expect.assertions(4);

      const collectionDto = Array.from({length: 82}, () => defaultResourceDto());
      const resultCollectionDto = [...collectionDto];
      const collectionIds = collectionDto.map(collection => collection.id);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation((contains, filters) => {
        expect(contains).toEqual(expectedContains);
        return resultCollectionDto.splice(0, filters["has-id"].length);
      });

      const result = await service.findAllByIdsForDisplayPermissions(collectionIds);

      expect(result.toDto()).toEqual(collectionDto);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledTimes(2);
    });
  });

  describe("::findAllForDecrypt", () => {
    let service, expectedContains;

    beforeEach(() => {
      service = new FindResourcesService(account, apiClientOptions);
      expectedContains = {
        "secret": true
      };
    });

    it("should call the api only 1 times when the resource is less than 80", async() => {
      expect.assertions(3);

      const collectionDto = Array.from({length: 80}, () => defaultResourceDto());
      const resourcesIds = collectionDto.map(resource => resource.id);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => collectionDto);

      const result = await service.findAllForDecrypt(resourcesIds);

      expect(result).toEqual(new ResourcesCollection(collectionDto));
      expect(ResourceService.prototype.findAll).toHaveBeenCalledTimes(1);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledWith(expectedContains, {
        "has-id": resourcesIds
      });
    });

    it("should call the api only 2 times when the resource is more than 80", async() => {
      expect.assertions(4);

      const collectionDto = Array.from({length: 82}, () => defaultResourceDto());
      const resultCollectionDto = [...collectionDto];
      const resourcesIds = collectionDto.map(collection => collection.id);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation((contains, filters) => {
        expect(contains).toEqual(expectedContains);
        return resultCollectionDto.splice(0, filters["has-id"].length);
      });

      const result = await service.findAllForDecrypt(resourcesIds);

      expect(result.toDto()).toEqual(collectionDto);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledTimes(2);
    });
  });

  describe("::findOneById", () => {
    let service;

    beforeEach(() => {
      service = new FindResourcesService(account, apiClientOptions);
    });

    it("should retrieve the resource by an id with optional contain parameter", async() => {
      expect.assertions(3);

      const ressource = defaultResourceDto();

      jest.spyOn(ResourceService.prototype, "get").mockImplementation(() => ressource);

      const result = await service.findOneById(ressource.id);

      expect(result).toEqual(new ResourceEntity(ressource));
      expect(ResourceService.prototype.get).toHaveBeenCalledTimes(1);
      expect(ResourceService.prototype.get).toHaveBeenCalledWith(ressource.id, {});
    });

    it("should retrieve the resource by an id with contain parameter", async() => {
      expect.assertions(3);

      const ressource = defaultResourceDto();
      const contain = {
        creator: true,
        modifier: true,
      };

      jest.spyOn(ResourceService.prototype, "get").mockImplementation(() => ressource);

      const result = await service.findOneById(ressource.id, contain);

      expect(result).toEqual(new ResourceEntity(ressource));
      expect(ResourceService.prototype.get).toHaveBeenCalledTimes(1);
      expect(ResourceService.prototype.get).toHaveBeenCalledWith(ressource.id, contain);
    });

    it("should validate the resource id to be an uuid", async() => {
      expect.assertions(1);

      const promise = service.findOneById("Not an uuid");

      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });

    it("should validate the contains parameter", async() => {
      expect.assertions(1);
      const ressource = defaultResourceDto();

      const promise = service.findOneById(ressource.id, {"not-valid": true});

      await expect(promise).rejects.toThrowError("Unsupported contains parameter used, please check supported contains");
    });

    it("should throw an error in case of api error", async() => {
      expect.assertions(1);

      const ressource = defaultResourceDto();

      jest.spyOn(ResourceService.prototype, "get").mockImplementation(() => { throw new Error("API error"); });

      const promise = service.findOneById(ressource.id);

      await expect(promise).rejects.toThrowError("API error");
    });
  });

  describe("::findOneByIdForDetails", () => {
    let service, expectedContains;

    beforeEach(() => {
      service = new FindResourcesService(account, apiClientOptions);
      expectedContains = {
        "creator": true,
        "modifier": true
      };
    });

    it("should retrieve the resource by id for detail", async() => {
      expect.assertions(3);

      const ressource = defaultResourceDto();

      jest.spyOn(ResourceService.prototype, "get").mockImplementation(() => ressource);

      const result = await service.findOneByIdForDetails(ressource.id);

      expect(result).toEqual(new ResourceEntity(ressource));
      expect(ResourceService.prototype.get).toHaveBeenCalledTimes(1);
      expect(ResourceService.prototype.get).toHaveBeenCalledWith(ressource.id, expectedContains);
    });

    it("should validate the resource id to be an uuid", async() => {
      expect.assertions(1);

      const promise = service.findOneByIdForDetails("Not an uuid");

      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });

    it("should throw an error in case of api error", async() => {
      expect.assertions(1);

      const ressource = defaultResourceDto();

      jest.spyOn(ResourceService.prototype, "get").mockImplementation(() => { throw new Error("API error"); });

      const promise = service.findOneByIdForDetails(ressource.id);

      await expect(promise).rejects.toThrowError("API error");
    });
  });

  describe("::findAllByIdsForLocalStorage", () => {
    let service, expectedContains;

    beforeEach(() => {
      service = new FindResourcesService(account, apiClientOptions);
      expectedContains = {
        permission: true,
        favorite: true,
        tag: true
      };
    });

    it("should retrieve all resources by their ids", async() => {
      expect.assertions(3);

      const ressourcesDto = multipleResourceDtos();
      const resourcesIds = ressourcesDto.map(r => r.id);

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => ressourcesDto);

      const result = await service.findAllByIdsForLocalStorage(resourcesIds);

      const resourcesIdsFilter = {"has-id": resourcesIds};

      expect(result).toEqual(new ResourcesCollection(ressourcesDto));
      expect(ResourceService.prototype.findAll).toHaveBeenCalledTimes(1);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledWith(expectedContains, resourcesIdsFilter);
    });

    it("should assert the given ids", async() => {
      expect.assertions(1);

      const resourcesIds = [uuidv4(), "test"];
      await expect(() => service.findAllByIdsForLocalStorage(resourcesIds)).rejects.toThrowError();
    });
  });

  describe("::findAllByParentFolderIdForLocalStorage", () => {
    let service, expectedContains, expectedFilters;
    const parentFolderId = uuidv4();

    beforeEach(() => {
      service = new FindResourcesService(account, apiClientOptions);
      expectedContains = {
        permission: true,
        favorite: true,
        tag: true
      };

      expectedFilters = {
        'has-parent': parentFolderId
      };
    });

    it("should retrieve all resources by parent folder id", async() => {
      expect.assertions(3);

      const ressourcesDto = multipleResourceDtos();

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => ressourcesDto);

      const result = await service.findAllByParentFolderIdForLocalStorage(parentFolderId);

      expect(result).toEqual(new ResourcesCollection(ressourcesDto));
      expect(ResourceService.prototype.findAll).toHaveBeenCalledTimes(1);
      expect(ResourceService.prototype.findAll).toHaveBeenCalledWith(expectedContains, expectedFilters);
    });

    it("should assert the given id", async() => {
      expect.assertions(1);
      await expect(() => service.findAllByParentFolderIdForLocalStorage("test")).rejects.toThrowError();
    });
  });

  describe("::assertContains", () => {
    it("should not throw errors if all given contains are fine", () => {
      expect.assertions(1);

      const service = new FindResourcesService(account, apiClientOptions);
      const allContains = {
        'creator': true,
        'favorite': true,
        'modifier': true,
        'secret': true,
        'permission': true,
        'permissions': true,
        'permissions.user.profile': true,
        'permissions.group': true,
        'tag': true,
        'resource-type': true,
      };

      expect(() => service.assertContains(allContains)).not.toThrow();
    });

    it("should not throw errors if the contain has 1 element only", () => {
      expect.assertions(1);

      const service = new FindResourcesService(account, apiClientOptions);
      const contains = {'permissions.user.profile': true};

      expect(() => service.assertContains(contains)).not.toThrow();
    });

    it("should not throw errors if the contain is empty", () => {
      expect.assertions(1);

      const service = new FindResourcesService(account, apiClientOptions);
      const contains = {};

      expect(() => service.assertContains(contains)).not.toThrow();
    });

    it("should throw an error if at least of the contain is wrong", () => {
      expect.assertions(1);

      const service = new FindResourcesService(account, apiClientOptions);
      const allContains = {
        'creator': true,
        'favorite': true,
        'modifier': true,
        'secret': true,
        'permission': true,
        'permissions': true,
        'permissions.user.profile': true,
        'permissions.group': true,
        'tag': true,
        'resource-type': true,
        'resource-type-wrong': true,
      };

      expect(() => service.assertContains(allContains)).toThrow();
    });
  });


  describe("::assertFilters", () => {
    it("should not throw errors if all given filters are fine", () => {
      expect.assertions(1);

      const service = new FindResourcesService(account, apiClientOptions);
      const allFilters = {
        'is-favorite': true,
        'is-shared-with-group': uuidv4(),
        'is-owned-by-me': true,
        'is-shared-with-me': true,
        'has-id': uuidv4(),
        'has-tag': uuidv4(),
        "has-parent": uuidv4(),
      };

      expect(() => service.assertFilters(allFilters)).not.toThrow();
    });

    it("should not throw errors if the contain has 1 element only", () => {
      expect.assertions(1);

      const service = new FindResourcesService(account, apiClientOptions);
      const contains = {'is-shared-with-me': true};

      expect(() => service.assertFilters(contains)).not.toThrow();
    });

    it("should not throw errors if the filters is empty", () => {
      expect.assertions(1);

      const service = new FindResourcesService(account, apiClientOptions);
      const contains = {};

      expect(() => service.assertFilters(contains)).not.toThrow();
    });

    it("should throw an error if at least of the filters is wrong", () => {
      expect.assertions(1);

      const service = new FindResourcesService(account, apiClientOptions);
      const allContains = {
        'is-favorite': true,
        'is-shared-with-group': uuidv4(),
        'is-owned-by-me': true,
        'is-shared-with-me': true,
        'has-id': uuidv4(),
        'has-tag': uuidv4(),
        "has-parent": uuidv4(),
        "has-parent-wrong": uuidv4(),
      };

      expect(() => service.assertFilters(allContains)).toThrow();
    });
  });
});
