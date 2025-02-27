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
 * @since         4.12.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import {passboltReponseWithCollectionDto} from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity.test.data";
import MigrateMetadataResourcesService from "./migrateMetadataResourcesService";
import MigrateMetadataEntity from "passbolt-styleguide/src/shared/models/entity/metadata/migrateMetadataEntity";
import {defaultMigrateMetadataDto} from "passbolt-styleguide/src/shared/models/entity/metadata/migrateMetadataEntity.test.data";
import {defaultResourceDtosCollection} from "passbolt-styleguide/src/shared/models/entity/resource/resourcesCollection.test.data";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {defaultDecryptedSharedMetadataKeysDtos} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import GetOrFindMetadataKeysService from "../metadata/getOrFindMetadataKeysService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import {mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import {defaultProgressService} from "../progress/progressService.test.data";
import {TEST_RESOURCE_TYPE_TOTP, TEST_RESOURCE_TYPE_V5_DEFAULT, resourceTypePasswordAndDescriptionDto, resourceTypeTotpDto, resourceTypeV5DefaultDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {defaultMetadataKeysSettingsDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import {enableFetchMocks} from "jest-fetch-mock";

describe("MigrateMetadataResourcesService", () => {
  let account = null;

  beforeEach(() => {
    jest.clearAllMocks();

    MockExtension.withConfiguredAccount();
    account = new AccountEntity(defaultAccountDto());
    const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
    const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
    jest.spyOn(GetOrFindMetadataKeysService.prototype, "getOrFindAll").mockImplementation(() => metadataKeys);
    enableFetchMocks();
  });

  describe("::migrate", () => {
    it("should run the migration process", async() => {
      // set base data
      const progressService = defaultProgressService();
      const firstBatchToMigrate = defaultResourceDtosCollection();
      const nextBatchToMigrate = defaultResourceDtosCollection();
      const migrateMetadataEntity = new MigrateMetadataEntity(defaultMigrateMetadataDto());
      const apiResponseHeaderDto = {
        pagination: {
          count: firstBatchToMigrate.length + nextBatchToMigrate.length,
          limit: firstBatchToMigrate.length,
          page: 1,
        }
      };
      const migrationDetails = new PassboltResponseEntity(passboltReponseWithCollectionDto(firstBatchToMigrate, {header: apiResponseHeaderDto}));
      console.log(migrationDetails.header.pagination);
      const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
      let migrateCallCount = 0;

      expect.assertions(13 + firstBatchToMigrate.length * 2 + nextBatchToMigrate.length * 2);
      const service = new MigrateMetadataResourcesService(defaultApiClientOptions(), account, progressService);

      // Spy initialization
      jest.spyOn(service.migrateMetadataResourcesApiService, "migrate").mockImplementation(async() => migrateCallCount++ > 0
        ? new PassboltResponseEntity(passboltReponseWithCollectionDto([])) //second migrate call, there is no other resource to migrate
        : new PassboltResponseEntity(passboltReponseWithCollectionDto(nextBatchToMigrate))); //first migrate call, there is another page of resources to migrate
      jest.spyOn(service.migrateMetadataResourcesApiService, "findAll").mockReturnValue(migrationDetails);
      jest.spyOn(ResourceTypeModel.prototype, "getOrFindAll").mockReturnValue(resourceTypesCollection);
      jest.spyOn(service.encryptMetadataService.getOrFindMetadataSettingsService, "getOrFindKeysSettings").mockReturnValue(defaultMetadataKeysSettingsDto());

      // running process
      await service.migrate(migrateMetadataEntity, "ada@passbolt.com", {count: 0});

      // check expectation
      expect(service.migrateMetadataResourcesApiService.findAll).toHaveBeenCalledTimes(1);
      expect(service.migrateMetadataResourcesApiService.migrate).toHaveBeenCalledTimes(2);

      const firstMigrationCallArgs = service.migrateMetadataResourcesApiService.migrate.mock.calls[0];
      //args[0] is the resourceCollection
      expect(firstMigrationCallArgs[0]).toBeInstanceOf(ResourcesCollection);
      expect(firstMigrationCallArgs[0].length).toStrictEqual(firstBatchToMigrate.length);
      for (let i = 0; i < firstMigrationCallArgs[0].length; i++) {
        const resourceEntity = firstMigrationCallArgs[0].items[i];
        expect(resourceEntity.isMetadataDecrypted()).toStrictEqual(false); //checking if metadata is encrypted as expected
        expect(resourceEntity.resourceTypeId).not.toEqual(firstBatchToMigrate[i].resource_type_id); //checking if resource type has been updated
      }
      // args[1] is the `is-shared` param
      expect(firstMigrationCallArgs[1]).toStrictEqual({permissions: true});

      const secondMigrationCallArgs = service.migrateMetadataResourcesApiService.migrate.mock.calls[1];
      expect(secondMigrationCallArgs[0]).toBeInstanceOf(ResourcesCollection);
      expect(secondMigrationCallArgs[0].length).toStrictEqual(nextBatchToMigrate.length);
      for (let i = 0; i < secondMigrationCallArgs[0].length; i++) {
        const resourceEntity = secondMigrationCallArgs[0].items[i];
        expect(resourceEntity.isMetadataDecrypted()).toStrictEqual(false); //checking if metadata is encrypted as expected
        expect(resourceEntity.resourceTypeId).not.toEqual(nextBatchToMigrate[i].resource_type_id); //checking if resource type has been updated
      }
      expect(secondMigrationCallArgs[1]).toStrictEqual({permissions: true});

      expect(progressService.finishStep).toHaveBeenCalledTimes(3);
      expect(progressService.updateStepMessage).not.toHaveBeenCalled();
      expect(progressService.finishStep).toHaveBeenCalledWith(('Retrieving resource types'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Migrating resources metadata page 1/2'));
      expect(progressService.finishStep).toHaveBeenCalledWith(('Migrating resources metadata page 2/2'));
    }, 10_000);

    it("should retry the process multiple times before aborting it", async() => {
      expect.assertions(3);

      // set base data
      const firstBatchToMigrate = defaultResourceDtosCollection();
      const migrateMetadataEntity = new MigrateMetadataEntity(defaultMigrateMetadataDto());
      const migrationDetails = new PassboltResponseEntity(passboltReponseWithCollectionDto(firstBatchToMigrate));

      const service = new MigrateMetadataResourcesService(defaultApiClientOptions(), account, defaultProgressService());

      //mock fetch
      fetch.doMock(() => mockApiResponseError(409, "Somebody is running the migration meanwhile"));

      // Spy initialization
      jest.spyOn(service.migrateMetadataResourcesApiService, "findAll").mockReturnValue(migrationDetails);
      jest.spyOn(ResourceTypeModel.prototype, "getOrFindAll").mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
      jest.spyOn(service, "_migrateResources");
      jest.spyOn(service.encryptMetadataService.getOrFindMetadataSettingsService, "getOrFindKeysSettings").mockReturnValue(defaultMetadataKeysSettingsDto());

      // running process
      const replayOptions = {count: 0};
      try {
        await service.migrate(migrateMetadataEntity, "ada@passbolt.com", replayOptions);
      } catch (e) {
        const expectedError = new Error("Too many attempts to run a process. Aborting");
        expectedError.cause = new PassboltApiFetchError("Somebody is running the migration meanwhile");
        expect(e).toStrictEqual(expectedError);
      }

      // check expectation
      expect(service._migrateResources).toHaveBeenCalledTimes(3);
      expect(replayOptions.count).toStrictEqual(3);
    }, 10_000);

    it("should not retry the process if the error from the API is unexpected", async() => {
      expect.assertions(3);
      // set base data
      const firstBatchToMigrate = defaultResourceDtosCollection();
      const migrateMetadataEntity = new MigrateMetadataEntity(defaultMigrateMetadataDto());
      const migrationDetails = new PassboltResponseEntity(passboltReponseWithCollectionDto(firstBatchToMigrate));
      const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());

      const service = new MigrateMetadataResourcesService(defaultApiClientOptions(), account, defaultProgressService());

      //mock fetch
      fetch.doMock(() => mockApiResponseError(500, "Something went wrong!"));

      // Spy initialization
      jest.spyOn(service.migrateMetadataResourcesApiService, "findAll").mockReturnValue(migrationDetails);
      jest.spyOn(ResourceTypeModel.prototype, "getOrFindAll").mockReturnValue(resourceTypesCollection);
      jest.spyOn(service.encryptMetadataService.getOrFindMetadataSettingsService, "getOrFindKeysSettings").mockReturnValue(defaultMetadataKeysSettingsDto());
      jest.spyOn(service, "_migrateResources");

      // running process
      const replayOptions = {count: 0};
      try {
        await service.migrate(migrateMetadataEntity, "ada@passbolt.com", replayOptions);
      } catch (e) {
        expect(e).toStrictEqual(new PassboltApiFetchError("Something went wrong!"));
      }

      // check expectation
      expect(service._migrateResources).toHaveBeenCalledTimes(1);
      expect(replayOptions.count).toStrictEqual(0);
    }, 10_000);

    it("should abort the process if the given resource page can't be encrypted", async() => {
      expect.assertions(1);

      // set base data
      const firstBatchToMigrate = [defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT})];
      const migrateMetadataEntity = new MigrateMetadataEntity(defaultMigrateMetadataDto());
      const migrationDetails = new PassboltResponseEntity(passboltReponseWithCollectionDto(firstBatchToMigrate));
      const resourceTypesCollection = new ResourceTypesCollection(resourceTypesCollectionDto());

      const service = new MigrateMetadataResourcesService(defaultApiClientOptions(), account, defaultProgressService());

      // Spy initialization
      jest.spyOn(service.migrateMetadataResourcesApiService, "migrate");
      jest.spyOn(service.migrateMetadataResourcesApiService, "findAll").mockReturnValue(migrationDetails);
      jest.spyOn(ResourceTypeModel.prototype, "getOrFindAll").mockReturnValue(resourceTypesCollection);
      jest.spyOn(service.encryptMetadataService.getOrFindMetadataSettingsService, "getOrFindKeysSettings").mockReturnValue(defaultMetadataKeysSettingsDto());

      // running process
      try {
        await service.migrate(migrateMetadataEntity, "ada@passbolt.com", {count: 0});
      } catch (e) {
        expect(e).toStrictEqual(new Error("Unexpected empty resources collection to migrate"));
      }
    }, 10_000);

    it("should ignore V4 resource type that does not a matching V5 resource type", async() => {
      expect.assertions(3);

      // set base data
      const progressService = defaultProgressService();
      const firstBatchToMigrate = [defaultResourceDto(), defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_TOTP})];
      const migrateMetadataEntity = new MigrateMetadataEntity(defaultMigrateMetadataDto());
      const migrationDetails = new PassboltResponseEntity(passboltReponseWithCollectionDto(firstBatchToMigrate));
      const resourceTypesCollection = new ResourceTypesCollection([
        resourceTypePasswordAndDescriptionDto(),
        resourceTypeTotpDto(),
        resourceTypeV5DefaultDto(),
        //V5 totp resource type is missing on purpose
      ]);

      const service = new MigrateMetadataResourcesService(defaultApiClientOptions(), account, progressService);

      // Spy initialization
      jest.spyOn(service.migrateMetadataResourcesApiService, "migrate").mockImplementation(async() => new PassboltResponseEntity(passboltReponseWithCollectionDto([])));
      jest.spyOn(service.migrateMetadataResourcesApiService, "findAll").mockReturnValue(migrationDetails);
      jest.spyOn(ResourceTypeModel.prototype, "getOrFindAll").mockReturnValue(resourceTypesCollection);
      jest.spyOn(service.encryptMetadataService.getOrFindMetadataSettingsService, "getOrFindKeysSettings").mockReturnValue(defaultMetadataKeysSettingsDto());

      // running process
      await service.migrate(migrateMetadataEntity, "ada@passbolt.com", {count: 0});

      // check expectation
      const firstMigrationCallArgs = service.migrateMetadataResourcesApiService.migrate.mock.calls[0];
      //args[0] is the resourceCollection
      expect(firstMigrationCallArgs[0]).toBeInstanceOf(ResourcesCollection);
      expect(firstMigrationCallArgs[0].length).toStrictEqual(1);
      const resourceEntity = firstMigrationCallArgs[0].items[0];
      expect(resourceEntity.resourceTypeId).toEqual(TEST_RESOURCE_TYPE_V5_DEFAULT); //checking if resource type has been updated
    }, 10_000);
  });
});
