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
 * @since         4.10.0
 */
import each from "jest-each";
import AccountEntity from "../../model/entity/account/accountEntity";
import {adminAccountDto, defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import ShareResourceService, {PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL} from "./shareResourceService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {
  defaultPermissionDto,
  minimumPermissionDto
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import {
  defaultResourceDto,
  defaultResourceV4Dto,
  resourceStandaloneTotpDto
} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import Keyring from "../../model/keyring";
import EncryptMessageService from "../crypto/encryptMessageService";
import {simulateShareSecretsChangesDto} from "./shareResourceService.test.data";
import {
  plaintextSecretPasswordAndDescriptionDto,
  plaintextSecretPasswordDescriptionTotpDto, plaintextSecretPasswordStringDto,
  plaintextSecretTotpDto,
} from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {
  TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
  TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP,
  TEST_RESOURCE_TYPE_PASSWORD_STRING, TEST_RESOURCE_TYPE_TOTP,
  TEST_RESOURCE_TYPE_V5_DEFAULT, TEST_RESOURCE_TYPE_V5_DEFAULT_TOTP, TEST_RESOURCE_TYPE_V5_PASSWORD_STRING,
  TEST_RESOURCE_TYPE_V5_TOTP
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {v4 as uuidv4} from "uuid";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import MetadataKeysSessionStorage from "../session_storage/metadataKeysSessionStorage";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import expect from "expect";
import MockPort from "passbolt-styleguide/test/mocks/mockPort";
import ProgressService from "../progress/progressService";
import {METADATA_KEY_TYPE_METADATA_KEY, METADATA_KEY_TYPE_USER_KEY} from "../../model/entity/resource/resourceEntity";
import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import {
  defaultMetadataKeysSettingsDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import {
  defaultMetadataPrivateKeyDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";

beforeEach(() => {
  MetadataKeysSessionStorage._runtimeCachedData = {};
  jest.clearAllMocks();
});

describe("ShareResourceService", () => {
  let apiClientOptions, account, worker, progressService, service;

  beforeEach(() => {
    apiClientOptions = defaultApiClientOptions();
    account = new AccountEntity(adminAccountDto());
    worker = {port: new MockPort()};
    progressService = new ProgressService(worker);
    jest.spyOn(progressService, "finishStep");
    jest.spyOn(progressService, "finishSteps");
    jest.spyOn(progressService, "updateStepMessage");
    jest.spyOn(progressService, "_updateProgressBar").mockImplementation(jest.fn);

    service = new ShareResourceService(apiClientOptions, account, progressService);

    // Mock keyring.
    jest.spyOn(Keyring.prototype, "sync").mockImplementation(jest.fn);
    const keyring = new Keyring();
    keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
    keyring.importPublic(pgpKeys.betty.public, pgpKeys.betty.userId);
    keyring.importPublic(pgpKeys.carol.public, pgpKeys.carol.userId);
  });

  describe("::share", () => {
    each([
      {title: "with password string", secretClear: plaintextSecretPasswordStringDto(), resourceTypeId: TEST_RESOURCE_TYPE_PASSWORD_STRING},
      {title: "with password and description", secretClear: plaintextSecretPasswordAndDescriptionDto(), resourceTypeId: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION},
      {title: "with password description and totp", secretClear: plaintextSecretPasswordDescriptionTotpDto(), resourceTypeId: TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP},
      {title: "with standalone totp", secretClear: plaintextSecretTotpDto(), resourceTypeId: TEST_RESOURCE_TYPE_TOTP},
    ]).describe("should share a single resource in format v4", scenario => {
      it(`::${scenario.title}`, async() => {
        expect.assertions(19);
        const resourceIdToShare = uuidv4();

        // Permission changes to apply to the share (Modify one, add one and delete one)
        const carolPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.carol.userId,
          aco_foreign_key: resourceIdToShare,
          type: 1,
        });
        const bettyPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.betty.userId,
          aco_foreign_key: resourceIdToShare,
        });
        const adaPermissionChange = defaultPermissionDto({
          aro_foreign_key: pgpKeys.ada.userId,
          aco_foreign_key: resourceIdToShare,
          type: 7,
          delete: true
        });
        const permissionChanges = new PermissionChangesCollection([carolPermissionChange, bettyPermissionChange, adaPermissionChange]);

        // Mock request retrieving secrets that will need to be encrypted for new users through resources entry point.
        const resourceSecretData = await EncryptMessageService.encrypt(JSON.stringify(scenario.secretClear), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
        const resourceDto = defaultResourceV4Dto({
          id: resourceIdToShare,
          resource_type_id: scenario.resourceTypeId,
          secrets: [plaintextSecretPasswordAndDescriptionDto({resource_id: resourceIdToShare, data: resourceSecretData})]
        });
        jest.spyOn(service.findResourcesService, "findAllByIdsForShare").mockImplementation(() => new ResourcesCollection([resourceDto]));

        // Mock request simulating the share.
        let simulateRequestPermissions;
        const simulationResult = simulateShareSecretsChangesDto([pgpKeys.betty.userId], [pgpKeys.ada.userId]);
        jest.spyOn(service.shareService, "simulateShareResource").mockImplementation((resourceId, permissions) => {
          simulateRequestPermissions = permissions;
          return simulationResult;
        });

        // Mock request retrieving resource that are going to be shared.
        jest.spyOn(service.getOrFindResourcesService, "getOrFindByIds").mockImplementation(() => new ResourcesCollection([resourceDto]));

        // Mock request retrieving the resource types.
        jest.spyOn(service.resourceTypeModel, "getOrFindAll").mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

        // Mock the share request.
        // eslint-disable-next-line one-var
        let shareRequestData;
        jest.spyOn(service.shareService, "shareResource").mockImplementation((resourceId, data) => {
          shareRequestData = data;
          return {};
        });

        // Mock the local storage refresh
        jest.spyOn(service.findAndUpdateResourcesLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.shareAll([resourceDto.id], permissionChanges, pgpKeys.admin.passphrase);

        // Assert simulate API call.
        expect(permissionChanges.toDto()).toEqual(
          expect.arrayContaining([
            expect.objectContaining(simulateRequestPermissions[0].toDto()),
            expect.objectContaining(simulateRequestPermissions[1].toDto()),
            expect.objectContaining(simulateRequestPermissions[2].toDto())
          ])
        );

        // Assert share API call.
        expect(permissionChanges.toDto()).toEqual(
          expect.arrayContaining([
            expect.objectContaining(shareRequestData.permissions[0].toDto()),
            expect.objectContaining(shareRequestData.permissions[1].toDto()),
            expect.objectContaining(shareRequestData.permissions[2].toDto())
          ])
        );
        expect(shareRequestData.secrets?.length).toStrictEqual(1);
        await expect(shareRequestData.secrets[0].data)
          .toDecryptAndEqualTo(pgpKeys.betty.private_decrypted, JSON.stringify(scenario.secretClear));

        // Assert progress
        expect(progressService.finishStep).toHaveBeenCalledTimes(8);
        expect(progressService.updateStepMessage).toHaveBeenCalledTimes(4);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(1, "Updating resources metadata", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Calculating secrets", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(1, "Calculating secrets 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Retrieving secrets", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(4, "Decrypting secrets", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(2, "Decrypting secrets 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(5, "Synchronizing keyring", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(6, "Encrypting secrets", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(3, "Encrypting secrets 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(7, "Sharing resources", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(4, "Sharing resources 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(8, "Updating resources local storage", true);
        expect(progressService._progress).toEqual(PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL);
      });
    });

    each([
      {title: "with password string V5", secretClear: plaintextSecretPasswordStringDto(), resourceTypeId: TEST_RESOURCE_TYPE_V5_PASSWORD_STRING},
      {title: "with password and description V5", secretClear: plaintextSecretPasswordAndDescriptionDto(), resourceTypeId: TEST_RESOURCE_TYPE_V5_DEFAULT},
      {title: "with password description and totp V5", secretClear: plaintextSecretPasswordDescriptionTotpDto(), resourceTypeId: TEST_RESOURCE_TYPE_V5_DEFAULT_TOTP},
      {title: "with standalone totp V5", secretClear: plaintextSecretTotpDto(), resourceTypeId: TEST_RESOURCE_TYPE_V5_TOTP},
    ]).describe("should share a single resource in format v5", scenario => {
      it(`::${scenario.title}: with metadata already shared`, async() => {
        expect.assertions(19);
        const resourceIdToShare = uuidv4();

        // Permission changes to apply to the share (Modify one, add one and delete one)
        const carolPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.carol.userId,
          aco_foreign_key: resourceIdToShare,
          type: 1,
        });
        const bettyPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.betty.userId,
          aco_foreign_key: resourceIdToShare,
        });
        const adaPermissionChange = defaultPermissionDto({
          aro_foreign_key: pgpKeys.ada.userId,
          aco_foreign_key: resourceIdToShare,
          type: 7,
          delete: true
        });
        const permissionChanges = new PermissionChangesCollection([carolPermissionChange, bettyPermissionChange, adaPermissionChange]);

        // Mock request retrieving secrets that will need to be encrypted for new users through resources entry point.
        const resourceSecretData = await EncryptMessageService.encrypt(JSON.stringify(scenario.secretClear), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
        const resourceDto = defaultResourceDto({
          id: resourceIdToShare,
          resource_type_id: scenario.resourceTypeId,
          secrets: [plaintextSecretPasswordAndDescriptionDto({resource_id: resourceIdToShare, data: resourceSecretData})]
        });
        jest.spyOn(service.findResourcesService, "findAllByIdsForShare").mockImplementation(() => new ResourcesCollection([resourceDto]));

        // Mock request simulating the share.
        let simulateRequestPermissions;
        const simulationResult = simulateShareSecretsChangesDto([pgpKeys.betty.userId], [pgpKeys.ada.userId]);
        jest.spyOn(service.shareService, "simulateShareResource").mockImplementation((resourceId, permissions) => {
          simulateRequestPermissions = permissions;
          return simulationResult;
        });

        // Mock request retrieving resource that are going to be shared.
        jest.spyOn(service.getOrFindResourcesService, "getOrFindByIds").mockImplementation(() => new ResourcesCollection([resourceDto]));

        // Mock request retrieving the resource types.
        jest.spyOn(service.resourceTypeModel, "getOrFindAll").mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

        // Mock the share request.
        // eslint-disable-next-line one-var
        let shareRequestData;
        jest.spyOn(service.shareService, "shareResource").mockImplementation((resourceId, data) => {
          shareRequestData = data;
          return {};
        });

        // Mock the local storage refresh
        jest.spyOn(service.findAndUpdateResourcesLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.shareAll([resourceDto.id], permissionChanges, pgpKeys.admin.passphrase);

        // Assert simulate API call.
        expect(permissionChanges.toDto()).toEqual(
          expect.arrayContaining([
            expect.objectContaining(simulateRequestPermissions[0].toDto()),
            expect.objectContaining(simulateRequestPermissions[1].toDto()),
            expect.objectContaining(simulateRequestPermissions[2].toDto())
          ])
        );

        // Assert share API call.
        expect(permissionChanges.toDto()).toEqual(
          expect.arrayContaining([
            expect.objectContaining(shareRequestData.permissions[0].toDto()),
            expect.objectContaining(shareRequestData.permissions[1].toDto()),
            expect.objectContaining(shareRequestData.permissions[2].toDto())
          ])
        );
        expect(shareRequestData.secrets?.length).toStrictEqual(1);
        await expect(shareRequestData.secrets[0].data)
          .toDecryptAndEqualTo(pgpKeys.betty.private_decrypted, JSON.stringify(scenario.secretClear));

        // Assert progress dialog
        expect(progressService.finishStep).toHaveBeenCalledTimes(8);
        expect(progressService.updateStepMessage).toHaveBeenCalledTimes(4);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(1, "Updating resources metadata", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Calculating secrets", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(1, "Calculating secrets 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Retrieving secrets", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(4, "Decrypting secrets", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(2, "Decrypting secrets 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(5, "Synchronizing keyring", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(6, "Encrypting secrets", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(3, "Encrypting secrets 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(7, "Sharing resources", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(4, "Sharing resources 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(8, "Updating resources local storage", true);
        expect(progressService._progress).toEqual(PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL);
      });

      it(`::${scenario.title}: with metadata personal to re-encrypt with shared key`, async() => {
        expect.assertions(23);
        const resourceIdToShare = uuidv4();

        // Permission changes to apply to the share (Modify one, add one and delete one)
        const carolPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.carol.userId,
          aco_foreign_key: resourceIdToShare,
          type: 1,
        });
        const bettyPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.betty.userId,
          aco_foreign_key: resourceIdToShare,
        });
        const adaPermissionChange = defaultPermissionDto({
          aro_foreign_key: pgpKeys.ada.userId,
          aco_foreign_key: resourceIdToShare,
          type: 7,
          delete: true
        });
        const permissionChanges = new PermissionChangesCollection([carolPermissionChange, bettyPermissionChange, adaPermissionChange]);

        // Mock request retrieving secrets that will need to be encrypted for new users through resources entry point.
        const resourceSecretData = await EncryptMessageService.encrypt(JSON.stringify(scenario.secretClear), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
        const resourceDto = defaultResourceDto({
          id: resourceIdToShare,
          resource_type_id: scenario.resourceTypeId,
          metadata_key_type: METADATA_KEY_TYPE_USER_KEY,
          metadata_key_id: uuidv4(),
          secrets: [plaintextSecretPasswordAndDescriptionDto({resource_id: resourceIdToShare, data: resourceSecretData})]
        });
        jest.spyOn(service.findResourcesService, "findAllByIdsForShare").mockImplementation(() => new ResourcesCollection([resourceDto]));

        // Mock service retrieving resource that are going to be shared.
        jest.spyOn(service.getOrFindResourcesService, "getOrFindByIds").mockImplementation(() => new ResourcesCollection([resourceDto]));

        // Mock service retrieving the resource types.
        jest.spyOn(ResourceTypeModel.prototype, "getOrFindAll").mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

        // Mock service retrieving metadata keys settings.
        const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
        jest.spyOn(service.encryptMetadataService.getOrFindMetadataSettingsService, "getOrFindKeysSettings").mockImplementation(() => new MetadataKeysSettingsEntity(metadataKeysSettingsDto));

        // Mock service retrieving metadata keys (already decrypted).
        const metadataKeyId = uuidv4();
        const metadataPrivateKeysDto = [defaultMetadataPrivateKeyDto({metadata_key_id: metadataKeyId, data: JSON.parse(pgpKeys.metadataKey.decryptedMetadataPrivateKeyData)})];
        const metadataKeysDto = [defaultMetadataKeyDto({id: metadataKeyId, armored_key: pgpKeys.metadataKey.public, metadata_private_keys: metadataPrivateKeysDto})];
        jest.spyOn(service.encryptMetadataService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => new MetadataKeysCollection(metadataKeysDto));

        // Mock the resource update request.
        let updateRequestResourceDto;
        jest.spyOn(service.resourceService, "update").mockImplementation((_, resourceDto) => {
          updateRequestResourceDto = resourceDto;
          return defaultResourceDto(resourceDto, {withTags: true});
        });

        // Mock request simulating the share.
        // eslint-disable-next-line one-var
        let simulateRequestPermissions;
        const simulationResult = simulateShareSecretsChangesDto([pgpKeys.betty.userId], [pgpKeys.ada.userId]);
        jest.spyOn(service.shareService, "simulateShareResource").mockImplementation((resourceId, permissions) => {
          simulateRequestPermissions = permissions;
          return simulationResult;
        });

        // Mock the share request.
        // eslint-disable-next-line one-var
        let shareRequestData;
        jest.spyOn(service.shareService, "shareResource").mockImplementation((resourceId, data) => {
          shareRequestData = data;
          return {};
        });

        // Mock the local storage refresh
        jest.spyOn(service.findAndUpdateResourcesLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

        await service.shareAll([resourceDto.id], permissionChanges, pgpKeys.admin.passphrase);

        // Assert resource update API call (update metadata)
        expect(updateRequestResourceDto.metadata_key_type).toEqual(METADATA_KEY_TYPE_METADATA_KEY);
        expect(updateRequestResourceDto.metadata_key_id).toEqual(metadataKeyId);
        await expect(updateRequestResourceDto.metadata)
          .toDecryptAndEqualTo(pgpKeys.metadataKey.private_decrypted, JSON.stringify(resourceDto.metadata));

        // Assert simulate API call.
        expect(permissionChanges.toDto()).toEqual(
          expect.arrayContaining([
            expect.objectContaining(simulateRequestPermissions[0].toDto()),
            expect.objectContaining(simulateRequestPermissions[1].toDto()),
            expect.objectContaining(simulateRequestPermissions[2].toDto())
          ])
        );

        // Assert share API call.
        expect(permissionChanges.toDto()).toEqual(
          expect.arrayContaining([
            expect.objectContaining(shareRequestData.permissions[0].toDto()),
            expect.objectContaining(shareRequestData.permissions[1].toDto()),
            expect.objectContaining(shareRequestData.permissions[2].toDto())
          ])
        );
        expect(shareRequestData.secrets?.length).toStrictEqual(1);
        await expect(shareRequestData.secrets[0].data)
          .toDecryptAndEqualTo(pgpKeys.betty.private_decrypted, JSON.stringify(scenario.secretClear));

        // Assert progress
        expect(progressService.finishStep).toHaveBeenCalledTimes(8);
        expect(progressService.updateStepMessage).toHaveBeenCalledTimes(5);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(1, "Updating resources metadata", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(1, "Updating resources metadata 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Calculating secrets", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(2, "Calculating secrets 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Retrieving secrets", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(4, "Decrypting secrets", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(3, "Decrypting secrets 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(5, "Synchronizing keyring", true);
        expect(progressService.finishStep).toHaveBeenNthCalledWith(6, "Encrypting secrets", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(4, "Encrypting secrets 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(7, "Sharing resources", true);
        expect(progressService.updateStepMessage).toHaveBeenNthCalledWith(5, "Sharing resources 1/1");
        expect(progressService.finishStep).toHaveBeenNthCalledWith(8, "Updating resources local storage", true);
        expect(progressService._progress).toEqual(PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL);
      });
    });

    it(`shares multiple resources in v4 and v5 having different metadata encryption requirements with multiple users `, async() => {
      expect.assertions(57);
      const resourceId1V4 = uuidv4();
      const resourceId2V4 = uuidv4();
      const resourceId1V5 = uuidv4();
      const resourceId2V5 = uuidv4();
      const resourceId3V5 = uuidv4();

      // Permission changes to apply to the share (Modify one, add one and delete one)
      const permissionChangeR1V4Carol = minimumPermissionDto({
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: resourceId1V4,
        type: 1,
      });
      const permissionChangeR1V4Betty = minimumPermissionDto({
        aro_foreign_key: pgpKeys.betty.userId,
        aco_foreign_key: resourceId1V4,
        type: 1,
      });
      const permissionChangeR2V4Carol = minimumPermissionDto({
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: resourceId2V4,
        type: 1,
      });
      const permissionChangeR2V4Betty = minimumPermissionDto({
        aro_foreign_key: pgpKeys.betty.userId,
        aco_foreign_key: resourceId2V4,
        type: 1,
      });
      const permissionChangeR1V5Carol = minimumPermissionDto({
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: resourceId1V5,
        type: 1,
      });
      const permissionChangeR1V5Betty = minimumPermissionDto({
        aro_foreign_key: pgpKeys.betty.userId,
        aco_foreign_key: resourceId1V5,
        type: 1,
      });
      const permissionChangeR2V5Carol = minimumPermissionDto({
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: resourceId2V5,
        type: 1,
      });
      const permissionChangeR2V5Betty = minimumPermissionDto({
        aro_foreign_key: pgpKeys.betty.userId,
        aco_foreign_key: resourceId2V5,
        type: 1,
      });
      const permissionChangeR3V5Carol = minimumPermissionDto({
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: resourceId3V5,
        type: 1,
      });
      const permissionChangeR3V5Betty = minimumPermissionDto({
        aro_foreign_key: pgpKeys.betty.userId,
        aco_foreign_key: resourceId3V5,
        type: 1,
      });
      const permissionChanges = new PermissionChangesCollection([
        permissionChangeR1V4Carol, permissionChangeR1V4Betty, permissionChangeR2V4Carol, permissionChangeR2V4Betty,
        permissionChangeR1V5Carol, permissionChangeR1V5Betty, permissionChangeR2V5Carol, permissionChangeR2V5Betty,
        permissionChangeR3V5Carol, permissionChangeR3V5Betty,
      ]);

      /*
       * Mock request retrieving secrets that will need to be encrypted for new users through resources entry point.
       * - A resource v4 of type encrypted description
       * - A resource v4 of type encrypted description and totp
       * - A resource v5 of type default with personal metadata to share
       * - A resource v5 of type standalone totp with personal metadata to share
       * - A resource v5 of type password string with metadata already shared
       */
      const resource1V4SecretDataDto = plaintextSecretPasswordAndDescriptionDto();
      const resource1V4SecretData = await EncryptMessageService.encrypt(JSON.stringify(resource1V4SecretDataDto), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
      const resource1V4Dto = defaultResourceV4Dto({
        id: resourceId1V4,
        resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
        secrets: [plaintextSecretPasswordAndDescriptionDto({resource_id: resourceId1V4, data: resource1V4SecretData})]
      });
      const resource2V4SecretDataDto = plaintextSecretPasswordDescriptionTotpDto();
      const resource2V4SecretData = await EncryptMessageService.encrypt(JSON.stringify(resource2V4SecretDataDto), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
      const resource2V4Dto = defaultResourceV4Dto({
        id: resourceId2V4,
        resource_type_id: TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
        secrets: [plaintextSecretPasswordAndDescriptionDto({resource_id: resourceId2V4, data: resource2V4SecretData})]
      });
      const resource1V5SecretDataDto = plaintextSecretPasswordDescriptionTotpDto();
      const resource1V5SecretData = await EncryptMessageService.encrypt(JSON.stringify(resource1V5SecretDataDto), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
      const resource1V5Dto = defaultResourceDto({
        id: resourceId1V5,
        metadata_key_type: METADATA_KEY_TYPE_USER_KEY,
        metadata_key_id: uuidv4(),
        resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT,
        secrets: [plaintextSecretPasswordAndDescriptionDto({resource_id: resourceId1V5, data: resource1V5SecretData})]
      });
      const resource2V5SecretDataDto = plaintextSecretTotpDto();
      const resource2V5SecretData = await EncryptMessageService.encrypt(JSON.stringify(resource2V5SecretDataDto), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
      const resource2V5Dto = resourceStandaloneTotpDto({
        id: resourceId2V5,
        metadata_key_type: METADATA_KEY_TYPE_USER_KEY,
        metadata_key_id: uuidv4(),
        resource_type_id: TEST_RESOURCE_TYPE_V5_TOTP,
        secrets: [plaintextSecretPasswordAndDescriptionDto({resource_id: resourceId2V5, data: resource2V5SecretData})]
      });
      const resource3V5SecretDataDto = plaintextSecretPasswordStringDto();
      const resource3V5SecretData = await EncryptMessageService.encrypt(JSON.stringify(resource3V5SecretDataDto), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
      const resource3V5Dto = defaultResourceDto({
        id: resourceId3V5,
        resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT,
        secrets: [plaintextSecretPasswordAndDescriptionDto({resource_id: resourceId3V5, data: resource3V5SecretData})]
      });

      const resourcesDto = [resource1V4Dto, resource2V4Dto, resource1V5Dto, resource2V5Dto, resource3V5Dto];
      jest.spyOn(service.findResourcesService, "findAllByIdsForShare").mockImplementation(() => new ResourcesCollection(resourcesDto));

      // Mock service retrieving the resource types.
      jest.spyOn(ResourceTypeModel.prototype, "getOrFindAll").mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

      // Mock service retrieving metadata keys settings.
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      jest.spyOn(service.encryptMetadataService.getOrFindMetadataSettingsService, "getOrFindKeysSettings").mockImplementation(() => new MetadataKeysSettingsEntity(metadataKeysSettingsDto));

      // Mock service retrieving metadata keys (already decrypted).
      const metadataKeyId = uuidv4();
      const metadataPrivateKeysDto = [defaultMetadataPrivateKeyDto({metadata_key_id: metadataKeyId, data: JSON.parse(pgpKeys.metadataKey.decryptedMetadataPrivateKeyData)})];
      const metadataKeysDto = [defaultMetadataKeyDto({id: metadataKeyId, armored_key: pgpKeys.metadataKey.public, metadata_private_keys: metadataPrivateKeysDto})];
      jest.spyOn(service.encryptMetadataService.getOrFindMetadataKeysService, "getOrFindAll").mockImplementation(() => new MetadataKeysCollection(metadataKeysDto));

      // Mock the resource update request, for the ones requiring their metadata to be encrypted.
      let updateRequestResource1V5Dto, updateRequestResource2V5Dto;
      jest.spyOn(service.resourceService, "update").mockImplementation((resourceId, resourceDto) => {
        switch (resourceId) {
          case resourceId1V5:
            updateRequestResource1V5Dto = resourceDto;
            return defaultResourceDto(resourceDto, {withTags: true});
          case resourceId2V5:
            updateRequestResource2V5Dto = resourceDto;
            return defaultResourceDto(resourceDto, {withTags: true});
        }
      });

      // Mock request simulating the share.
      // eslint-disable-next-line one-var
      let simulateR1V4RequestPermissions, simulateR2V4RequestPermissions, simulateR1V5RequestPermissions, simulateR2V5RequestPermissions,
        simulateR3V5RequestPermissions;
      const simulateR1V4Result = simulateShareSecretsChangesDto([pgpKeys.betty.userId, pgpKeys.carol.userId]);
      const simulateR2V4Result = simulateShareSecretsChangesDto([pgpKeys.betty.userId, pgpKeys.carol.userId]);
      const simulateR1V5Result = simulateShareSecretsChangesDto([pgpKeys.betty.userId, pgpKeys.carol.userId]);
      const simulateR2V5Result = simulateShareSecretsChangesDto([pgpKeys.betty.userId, pgpKeys.carol.userId]);
      const simulateR3V5Result = simulateShareSecretsChangesDto([pgpKeys.betty.userId, pgpKeys.carol.userId]);
      jest.spyOn(service.shareService, "simulateShareResource").mockImplementation((resourceId, permissions) => {
        switch (resourceId) {
          case resourceId1V4:
            simulateR1V4RequestPermissions = permissions;
            return simulateR1V4Result;
          case resourceId2V4:
            simulateR2V4RequestPermissions = permissions;
            return simulateR2V4Result;
          case resourceId1V5:
            simulateR1V5RequestPermissions = permissions;
            return simulateR1V5Result;
          case resourceId2V5:
            simulateR2V5RequestPermissions = permissions;
            return simulateR2V5Result;
          case resourceId3V5:
            simulateR3V5RequestPermissions = permissions;
            return simulateR3V5Result;
        }
      });

      // Mock request retrieving resource that are going to be shared.
      jest.spyOn(service.getOrFindResourcesService, "getOrFindByIds").mockImplementation(() => new ResourcesCollection(resourcesDto));

      // Mock request retrieving the resource types.
      jest.spyOn(service.resourceTypeModel, "getOrFindAll").mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));

      // Mock the share request.
      // eslint-disable-next-line one-var
      let shareR1V4RequestData, shareR2V4RequestData, shareR1V5RequestData, shareR2V5RequestData, shareR3V5RequestData;
      jest.spyOn(service.shareService, "shareResource").mockImplementation((resourceId, data) => {
        switch (resourceId) {
          case resourceId1V4:
            shareR1V4RequestData = data;
            return {};
          case resourceId2V4:
            shareR2V4RequestData = data;
            return {};
          case resourceId1V5:
            shareR1V5RequestData = data;
            return {};
          case resourceId2V5:
            shareR2V5RequestData = data;
            return {};
          case resourceId3V5:
            shareR3V5RequestData = data;
            return {};
        }
      });

      // Mock the local storage refresh
      jest.spyOn(service.findAndUpdateResourcesLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);

      await service.shareAll([resource1V4Dto.id], permissionChanges, pgpKeys.admin.passphrase);

      // Assert resource update API call (update metadata)
      expect(service.resourceService.update).toHaveBeenCalledTimes(2);
      expect(updateRequestResource1V5Dto.metadata_key_type).toEqual(METADATA_KEY_TYPE_METADATA_KEY);
      expect(updateRequestResource1V5Dto.metadata_key_id).toEqual(metadataKeyId);
      await expect(updateRequestResource1V5Dto.metadata)
        .toDecryptAndEqualTo(pgpKeys.metadataKey.private_decrypted, JSON.stringify(resource1V5Dto.metadata));
      expect(updateRequestResource2V5Dto.metadata_key_type).toEqual(METADATA_KEY_TYPE_METADATA_KEY);
      expect(updateRequestResource2V5Dto.metadata_key_id).toEqual(metadataKeyId);
      await expect(updateRequestResource2V5Dto.metadata)
        .toDecryptAndEqualTo(pgpKeys.metadataKey.private_decrypted, JSON.stringify(resource2V5Dto.metadata));

      // Assert simulate API call.
      expect(permissionChanges.toDto()).toEqual(
        expect.arrayContaining([
          expect.objectContaining(simulateR1V4RequestPermissions[0].toDto()),
          expect.objectContaining(simulateR1V4RequestPermissions[1].toDto()),
          expect.objectContaining(simulateR2V4RequestPermissions[0].toDto()),
          expect.objectContaining(simulateR2V4RequestPermissions[1].toDto()),
          expect.objectContaining(simulateR1V5RequestPermissions[0].toDto()),
          expect.objectContaining(simulateR1V5RequestPermissions[1].toDto()),
          expect.objectContaining(simulateR2V5RequestPermissions[0].toDto()),
          expect.objectContaining(simulateR2V5RequestPermissions[1].toDto()),
          expect.objectContaining(simulateR3V5RequestPermissions[0].toDto()),
          expect.objectContaining(simulateR3V5RequestPermissions[1].toDto()),
        ])
      );

      // Assert share API call.
      expect(permissionChanges.toDto()).toEqual(
        expect.arrayContaining([
          expect.objectContaining(shareR1V4RequestData.permissions[0].toDto()),
          expect.objectContaining(shareR1V4RequestData.permissions[1].toDto()),
          expect.objectContaining(shareR2V4RequestData.permissions[0].toDto()),
          expect.objectContaining(shareR2V4RequestData.permissions[1].toDto()),
          expect.objectContaining(shareR1V5RequestData.permissions[0].toDto()),
          expect.objectContaining(shareR1V5RequestData.permissions[1].toDto()),
          expect.objectContaining(shareR2V5RequestData.permissions[0].toDto()),
          expect.objectContaining(shareR2V5RequestData.permissions[1].toDto()),
          expect.objectContaining(shareR3V5RequestData.permissions[0].toDto()),
          expect.objectContaining(shareR3V5RequestData.permissions[1].toDto()),
        ])
      );
      await expect(shareR1V4RequestData.secrets.find(secret => secret.userId === pgpKeys.betty.userId).data)
        .toDecryptAndEqualTo(pgpKeys.betty.private_decrypted, JSON.stringify(resource1V4SecretDataDto));
      await expect(shareR1V4RequestData.secrets.find(secret => secret.userId === pgpKeys.carol.userId).data)
        .toDecryptAndEqualTo(pgpKeys.carol.private_decrypted, JSON.stringify(resource1V4SecretDataDto));
      await expect(shareR2V4RequestData.secrets.find(secret => secret.userId === pgpKeys.betty.userId).data)
        .toDecryptAndEqualTo(pgpKeys.betty.private_decrypted, JSON.stringify(resource2V4SecretDataDto));
      await expect(shareR2V4RequestData.secrets.find(secret => secret.userId === pgpKeys.carol.userId).data)
        .toDecryptAndEqualTo(pgpKeys.carol.private_decrypted, JSON.stringify(resource2V4SecretDataDto));
      await expect(shareR1V5RequestData.secrets.find(secret => secret.userId === pgpKeys.betty.userId).data)
        .toDecryptAndEqualTo(pgpKeys.betty.private_decrypted, JSON.stringify(resource1V5SecretDataDto));
      await expect(shareR1V5RequestData.secrets.find(secret => secret.userId === pgpKeys.carol.userId).data)
        .toDecryptAndEqualTo(pgpKeys.carol.private_decrypted, JSON.stringify(resource1V5SecretDataDto));
      await expect(shareR2V5RequestData.secrets.find(secret => secret.userId === pgpKeys.betty.userId).data)
        .toDecryptAndEqualTo(pgpKeys.betty.private_decrypted, JSON.stringify(resource2V5SecretDataDto));
      await expect(shareR2V5RequestData.secrets.find(secret => secret.userId === pgpKeys.carol.userId).data)
        .toDecryptAndEqualTo(pgpKeys.carol.private_decrypted, JSON.stringify(resource2V5SecretDataDto));
      await expect(shareR3V5RequestData.secrets.find(secret => secret.userId === pgpKeys.betty.userId).data)
        .toDecryptAndEqualTo(pgpKeys.betty.private_decrypted, JSON.stringify(resource3V5SecretDataDto));
      await expect(shareR3V5RequestData.secrets.find(secret => secret.userId === pgpKeys.carol.userId).data)
        .toDecryptAndEqualTo(pgpKeys.carol.private_decrypted, JSON.stringify(resource3V5SecretDataDto));

      // Assert progress dialog
      expect(progressService.finishStep).toHaveBeenCalledTimes(8);
      expect(progressService.updateStepMessage).toHaveBeenCalledTimes(27);
      expect(progressService.finishStep).toHaveBeenCalledWith("Updating resources metadata", true);
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Updating resources metadata 1/2");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Updating resources metadata 2/2");
      expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Calculating secrets", true);
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Calculating secrets 1/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Calculating secrets 2/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Calculating secrets 3/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Calculating secrets 4/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Calculating secrets 5/5");
      expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Retrieving secrets", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(4, "Decrypting secrets", true);
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Decrypting secrets 1/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Decrypting secrets 2/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Decrypting secrets 3/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Decrypting secrets 4/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Decrypting secrets 5/5");
      expect(progressService.finishStep).toHaveBeenNthCalledWith(5, "Synchronizing keyring", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(6, "Encrypting secrets", true);
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Encrypting secrets 1/10");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Encrypting secrets 2/10");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Encrypting secrets 3/10");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Encrypting secrets 4/10");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Encrypting secrets 5/10");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Encrypting secrets 6/10");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Encrypting secrets 7/10");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Encrypting secrets 8/10");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Encrypting secrets 9/10");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Encrypting secrets 10/10");
      expect(progressService.finishStep).toHaveBeenNthCalledWith(7, "Sharing resources", true);
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Sharing resources 1/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Sharing resources 2/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Sharing resources 3/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Sharing resources 4/5");
      expect(progressService.updateStepMessage).toHaveBeenCalledWith("Sharing resources 5/5");
      expect(progressService.finishStep).toHaveBeenNthCalledWith(8, "Updating resources local storage", true);
      expect(progressService._progress).toEqual(PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL);
    });

    it("throws if the parameters are not valid.", async() => {
      expect.assertions(6);
      const apiClientOptions = defaultApiClientOptions();
      const account = new AccountEntity(defaultAccountDto());
      const mockedWorker = {port: new MockPort()};
      const progressService = new ProgressService(mockedWorker);
      const service = new ShareResourceService(apiClientOptions, account, progressService);

      await expect(() => service.shareAll("wrong", [])).rejects.toThrow(new TypeError('The parameter "resourcesIds" should be an array'));
      await expect(() => service.shareAll([], [])).rejects.toThrow(new TypeError('The parameter "resourcesIds" should be a non empty array'));
      await expect(() => service.shareAll(["test"], [])).rejects.toThrow(new TypeError('The parameter "resourcesIds" should contain only uuid', {cause: new TypeError("The given parameter is not a valid UUID")}));
      await expect(() => service.shareAll([uuidv4()], "not-valid")).rejects.toThrow(new TypeError('The parameter "permissionChanges" should be of type PermissionChangesCollection'));
      await expect(() => service.shareAll([uuidv4()], new PermissionChangesCollection([]))).rejects.toThrow(new TypeError('The parameter "passphrase" should be a string'));
      await expect(() => service.shareAll([uuidv4()], new PermissionChangesCollection([]), "")).rejects.toThrow(new TypeError('The parameter "passphrase" should not be empty'));
    });
  });
});
