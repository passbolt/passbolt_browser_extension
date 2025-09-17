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
 * @since         5.6.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import {passboltReponseWithCollectionDto} from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity.test.data";
import RotateResourcesMetadataKeyService from "./rotateResourcesMetadataKeyService";
import {defaultSharedResourcesWithEncryptedMetadataDtos} from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import MockExtension from "../../../../../../test/mocks/mockExtension";
import {defaultDecryptedSharedMetadataKeysDtos} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import GetOrFindMetadataKeysService from "../../metadata/getOrFindMetadataKeysService";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";
import {mockApiResponseError} from "../../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import {defaultProgressService} from "../../progress/progressService.test.data";
import {defaultMetadataKeysSettingsDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import {enableFetchMocks} from "jest-fetch-mock";
import ResourceTypeModel from "../../../model/resourceType/resourceTypeModel";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {
  TEST_RESOURCE_TYPE_V5_DEFAULT,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";

describe("RotateResourcesMetadataKeyService", () => {
  let account, metadataKeysDtos;

  beforeEach(() => {
    jest.clearAllMocks();

    MockExtension.withConfiguredAccount();
    account = new AccountEntity(defaultAccountDto());
    metadataKeysDtos = [
      ...defaultDecryptedSharedMetadataKeysDtos(),
      ...defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public, created: "2024-10-11T08:09:00+00:00", modified: "2024-10-11T08:09:00+00:00"})
    ];
    const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
    jest.spyOn(GetOrFindMetadataKeysService.prototype, "getOrFindAll").mockImplementation(() => metadataKeys);
    enableFetchMocks();
  });

  describe("::rotate", () => {
    it("should run the rotation process", async() => {
      // set base data
      const progressService = defaultProgressService();
      const firstBatchToRotate = defaultSharedResourcesWithEncryptedMetadataDtos(20, {
        metadata_key_id: metadataKeysDtos[1].id,
        resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT
      });
      const nextBatchToRotate =  defaultSharedResourcesWithEncryptedMetadataDtos(10, {
        metadata_key_id: metadataKeysDtos[1].id,
        resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT
      });
      const apiResponseHeaderDto = {
        pagination: {
          count: firstBatchToRotate.length + nextBatchToRotate.length,
          limit: firstBatchToRotate.length,
          page: 1,
        }
      };
      const rotationDetails = new PassboltResponseEntity(passboltReponseWithCollectionDto(firstBatchToRotate, {header: apiResponseHeaderDto}));
      const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
      let rotateCallCount = 0;

      expect.assertions(14 + firstBatchToRotate.length + nextBatchToRotate.length);
      const service = new RotateResourcesMetadataKeyService(account, defaultApiClientOptions(), progressService);

      // Spy initialization
      jest.spyOn(service.metadataRotateKeysResourcesApiService, "rotate").mockImplementation(async() => rotateCallCount++ > 0
        ? new PassboltResponseEntity(passboltReponseWithCollectionDto([])) //second rotate call, there is no other resource to rotate
        : new PassboltResponseEntity(passboltReponseWithCollectionDto(nextBatchToRotate))); //first rotate call, there is another page of resources to rotate
      jest.spyOn(service.metadataRotateKeysResourcesApiService, "findAll").mockReturnValue(rotationDetails);
      jest.spyOn(ResourceTypeModel.prototype, "getOrFindAll").mockReturnValue(resourceTypesCollection);
      jest.spyOn(service.encryptMetadataService.getOrFindMetadataSettingsService, "getOrFindKeysSettings").mockReturnValue(defaultMetadataKeysSettingsDto());
      jest.spyOn(service.encryptMetadataService, "encryptAllFromForeignModels");
      jest.spyOn(service.decryptMetadataService, "decryptAllFromForeignModels");

      // running process
      await service.rotate("ada@passbolt.com", {count: 0});

      // check expectation
      expect(service.metadataRotateKeysResourcesApiService.findAll).toHaveBeenCalledTimes(1);
      expect(service.metadataRotateKeysResourcesApiService.rotate).toHaveBeenCalledTimes(2);

      const firstRotationCallArgs = service.metadataRotateKeysResourcesApiService.rotate.mock.calls[0];
      //args[0] is the resourceCollection
      expect(firstRotationCallArgs[0]).toBeInstanceOf(ResourcesCollection);
      expect(firstRotationCallArgs[0].length).toStrictEqual(firstBatchToRotate.length);
      for (let i = 0; i < firstRotationCallArgs[0].length; i++) {
        const resourceEntity = firstRotationCallArgs[0].items[i];
        expect(resourceEntity.isMetadataDecrypted()).toBeFalsy(); //checking if metadata is encrypted as expected
      }

      const secondRotationCallArgs = service.metadataRotateKeysResourcesApiService.rotate.mock.calls[1];
      expect(secondRotationCallArgs[0]).toBeInstanceOf(ResourcesCollection);
      expect(secondRotationCallArgs[0].length).toStrictEqual(nextBatchToRotate.length);
      for (let i = 0; i < secondRotationCallArgs[0].length; i++) {
        const resourceEntity = secondRotationCallArgs[0].items[i];
        expect(resourceEntity.isMetadataDecrypted()).toBeFalsy(); //checking if metadata is encrypted as expected
      }

      expect(progressService.finishStep).toHaveBeenCalledTimes(3);
      expect(progressService.updateGoals).toHaveBeenNthCalledWith(1, 5); // total page (2) + Start + Retrieving resources + Done
      expect(progressService.updateStepMessage).not.toHaveBeenCalled();
      expect(progressService.finishStep).toHaveBeenCalledWith(('Retrieving resources'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Rotating resources metadata page 1/2'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Rotating resources metadata page 2/2'));
      expect(service.encryptMetadataService.encryptAllFromForeignModels).toHaveBeenCalledTimes(2);
      expect(service.decryptMetadataService.decryptAllFromForeignModels).toHaveBeenCalledTimes(2);
    }, 10_000);

    it("should retry the process multiple times before aborting it", async() => {
      expect.assertions(3);

      // set base data
      const firstBatchToRotate = defaultSharedResourcesWithEncryptedMetadataDtos(20, {
        metadata_key_id: metadataKeysDtos[1].id,
        resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT
      });
      const rotationDetails = new PassboltResponseEntity(passboltReponseWithCollectionDto(firstBatchToRotate));
      const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());

      const service = new RotateResourcesMetadataKeyService(account, defaultApiClientOptions(), defaultProgressService());

      //mock fetch
      fetch.doMock(() => mockApiResponseError(409, "Somebody is running the rotation meanwhile"));

      // Spy initialization
      jest.spyOn(service.metadataRotateKeysResourcesApiService, "findAll").mockReturnValue(rotationDetails);
      jest.spyOn(ResourceTypeModel.prototype, "getOrFindAll").mockReturnValue(resourceTypesCollection);
      jest.spyOn(service, "_rotateResources");
      jest.spyOn(service.encryptMetadataService.getOrFindMetadataSettingsService, "getOrFindKeysSettings").mockReturnValue(defaultMetadataKeysSettingsDto());

      // running process
      const replayOptions = {count: 0};
      try {
        await service.rotate("ada@passbolt.com", replayOptions);
      } catch (e) {
        const expectedError = new Error("Too many attempts to run a process. Aborting");
        expectedError.cause = new PassboltApiFetchError("Somebody is running the rotation meanwhile");
        expect(e).toStrictEqual(expectedError);
      }

      // check expectation
      expect(service._rotateResources).toHaveBeenCalledTimes(3);
      expect(replayOptions.count).toStrictEqual(3);
    }, 10_000);

    it("should not retry the process if the error from the API is unexpected", async() => {
      expect.assertions(3);
      // set base data
      const firstBatchToRotate = defaultSharedResourcesWithEncryptedMetadataDtos(20, {
        metadata_key_id: metadataKeysDtos[1].id,
        resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT
      });
      const rotationDetails = new PassboltResponseEntity(passboltReponseWithCollectionDto(firstBatchToRotate));
      const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());

      const service = new RotateResourcesMetadataKeyService(account, defaultApiClientOptions(), defaultProgressService());

      //mock fetch
      fetch.doMock(() => mockApiResponseError(500, "Something went wrong!"));

      // Spy initialization
      jest.spyOn(service.metadataRotateKeysResourcesApiService, "findAll").mockReturnValue(rotationDetails);
      jest.spyOn(service.encryptMetadataService.getOrFindMetadataSettingsService, "getOrFindKeysSettings").mockReturnValue(defaultMetadataKeysSettingsDto());
      jest.spyOn(service, "_rotateResources");
      jest.spyOn(ResourceTypeModel.prototype, "getOrFindAll").mockReturnValue(resourceTypesCollection);

      // running process
      const replayOptions = {count: 0};
      try {
        await service.rotate("ada@passbolt.com", replayOptions);
      } catch (e) {
        expect(e).toStrictEqual(new PassboltApiFetchError("Something went wrong!"));
      }

      // check expectation
      expect(service._rotateResources).toHaveBeenCalledTimes(1);
      expect(replayOptions.count).toStrictEqual(0);
    }, 10_000);
  });
});
