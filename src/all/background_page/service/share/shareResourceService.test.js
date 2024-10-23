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
import AccountEntity from "../../model/entity/account/accountEntity";
import {adminAccountDto, defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import ShareResourceService from "./shareResourceService";
import ProgressService from "../progress/progressService";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import GetDecryptedUserPrivateKeyService from "../account/getDecryptedUserPrivateKeyService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {defaultPermissionDto, minimumPermissionDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import {defaultResourceDto, defaultResourceV4Dto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import Keyring from "../../model/keyring";
import {enableFetchMocks} from "jest-fetch-mock";
import EncryptMessageService from "../crypto/encryptMessageService";
import DecryptMessageService from "../crypto/decryptMessageService";
import {defaultPermissionSimulation} from "./shareResourceService.test.data";
import {
  plaintextSecretPasswordStringDto,
  plaintextSecretPasswordAndDescriptionDto,
  plaintextSecretPasswordDescriptionTotpDto,
  plaintextSecretTotpDto,
} from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import each from "jest-each";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import {TEST_RESOURCE_TYPE_V5_DEFAULT_TOTP} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {defaultMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import {v4 as uuidv4} from "uuid";
import MetadataKeysApiService from "../api/metadata/metadataKeysApiService";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("ShareResourceService", () => {
  describe("::share", () => {
    each([
      {title: "with password string", value: plaintextSecretPasswordStringDto()},
      {title: "with password and description", value: plaintextSecretPasswordAndDescriptionDto()},
      {title: "with password description and totp", value: plaintextSecretPasswordDescriptionTotpDto()},
      {title: "with standalon totp", value: plaintextSecretTotpDto()},
    ]).describe("should share the given resource v4", scenario => {
      it(`::${scenario.title}: with personal set to 'false'`, async() => {
        expect.assertions(14);

        const apiClientOptions = defaultApiClientOptions();
        const account = new AccountEntity(adminAccountDto());
        const mockedProgressService = {finishStep: jest.fn()};

        const service = new ShareResourceService(apiClientOptions, account, mockedProgressService);

        const spyOnKeyringSync = jest.spyOn(Keyring.prototype, "sync");
        const spyOnKeyringFindPublic = jest.spyOn(Keyring.prototype, "findPublic");
        const spyOnFindResourceService = jest.spyOn(service.findAndUpdateResourcesLocalStorage, "findAndUpdateAll");
        const spyOnFindResourceType = jest.spyOn(service.resourceTypeModel, "getOrFindAll");
        const spyOnGetOrFindResource = jest.spyOn(service.getOrFindResourcesService, "getOrFindAll");

        const userKeys = {
          [pgpKeys.ada.userId]: {armoredKey: pgpKeys.ada.public},
          [pgpKeys.betty.userId]: {armoredKey: pgpKeys.betty.public},
          [pgpKeys.carol.userId]: {armoredKey: pgpKeys.carol.public},
        };

        const clearSecret = plaintextSecretPasswordDescriptionTotpDto();
        const encryptedSecret = await EncryptMessageService.encrypt(JSON.stringify(clearSecret), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));

        const resource = defaultResourceV4Dto();
        resource.secrets = [{
          data: encryptedSecret
        }];

        spyOnKeyringSync.mockImplementation(() => undefined);
        spyOnFindResourceService.mockImplementation(() => undefined);
        spyOnFindResourceType.mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
        spyOnGetOrFindResource.mockImplementation(() => new ResourcesCollection([resource]));
        spyOnKeyringFindPublic.mockImplementation(userId => userKeys[userId]);

        const carolPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.carol.userId,
          aco_foreign_key: resource.id,
          type: 1,
        });

        const bettyPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.betty.userId,
          aco_foreign_key: resource.id,
        });

        const adaPermissionChange = defaultPermissionDto({
          aro_foreign_key: pgpKeys.ada.userId,
          aco_foreign_key: resource.id,
          type: 7,
          delete: true,
          group: null,
        }, {withUser: true});

        const permissionChanges = [carolPermissionChange, bettyPermissionChange, adaPermissionChange];
        const simulationResult = defaultPermissionSimulation([pgpKeys.betty.userId, pgpKeys.carol.userId], [pgpKeys.ada.userId]);

        fetch.doMockOnceIf(/share\/simulate\/resource\/.*/, async req => {
          const body = JSON.parse(await req.text());
          // @todo make the assertion happens out of the response mocked implementation.
          expect(permissionChanges).toEqual(
            expect.arrayContaining([
              expect.objectContaining(body.permissions[0]),
              expect.objectContaining(body.permissions[1]),
              expect.objectContaining(body.permissions[2])
            ])
          );
          return await mockApiResponse(simulationResult);
        });

        fetch.doMockOnceIf(/share\/resource\/.*/, async req => {
          const body = JSON.parse(await req.text());

          expect(permissionChanges).toEqual(
            expect.arrayContaining([
              expect.objectContaining(body.permissions[0]),
              expect.objectContaining(body.permissions[1]),
              expect.objectContaining(body.permissions[2])
            ])
          );
          expect(body.secrets?.length).toStrictEqual(2);

          await expect(() => OpenpgpAssertion.readMessageOrFail(body.secrets[0].data)).not.toThrow();
          await expect(() => OpenpgpAssertion.readMessageOrFail(body.secrets[1].data)).not.toThrow();

          const bettysEncryptedMessage = body.secrets.find(secret => secret.user_id === pgpKeys.betty.userId);
          const carolsEncryptedMessage = body.secrets.find(secret => secret.user_id === pgpKeys.carol.userId);

          const bettysPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
          const carolsPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.carol.private_decrypted);

          const bettysDecryptedMessage = await DecryptMessageService.decrypt(await OpenpgpAssertion.readMessageOrFail(bettysEncryptedMessage.data), bettysPrivateKey);
          const carolsDecryptedMessage = await DecryptMessageService.decrypt(await OpenpgpAssertion.readMessageOrFail(carolsEncryptedMessage.data), carolsPrivateKey);

          expect(JSON.parse(bettysDecryptedMessage)).toStrictEqual(clearSecret);
          expect(JSON.parse(carolsDecryptedMessage)).toStrictEqual(clearSecret);

          return mockApiResponse(null);
        });

        await service.exec([resource], permissionChanges, pgpKeys.admin.passphrase);

        expect(mockedProgressService.finishStep).toHaveBeenCalledWith('Synchronizing keys', true);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Calculating resource permissions 1/1`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Encrypting resource secret 1/2`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Encrypting resource secret 2/2`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Sharing resource 1/1`);
        expect(spyOnKeyringSync).toHaveBeenCalledTimes(1);
        expect(spyOnFindResourceService).toHaveBeenCalledTimes(1);
      }, 10 * 1000);

      it(`::${scenario.title}: with personal set to 'true'`, async() => {
        expect.assertions(14);

        const apiClientOptions = defaultApiClientOptions();
        const account = new AccountEntity(adminAccountDto());
        const mockedProgressService = {finishStep: jest.fn()};

        const service = new ShareResourceService(apiClientOptions, account, mockedProgressService);

        const spyOnKeyringSync = jest.spyOn(Keyring.prototype, "sync");
        const spyOnKeyringFindPublic = jest.spyOn(Keyring.prototype, "findPublic");
        const spyOnFindResourceService = jest.spyOn(service.findAndUpdateResourcesLocalStorage, "findAndUpdateAll");
        const spyOnFindResourceType = jest.spyOn(service.resourceTypeModel, "getOrFindAll");
        const spyOnGetOrFindResource = jest.spyOn(service.getOrFindResourcesService, "getOrFindAll");

        const userKeys = {
          [pgpKeys.ada.userId]: {armoredKey: pgpKeys.ada.public},
          [pgpKeys.betty.userId]: {armoredKey: pgpKeys.betty.public},
          [pgpKeys.carol.userId]: {armoredKey: pgpKeys.carol.public},
        };

        const clearSecret = plaintextSecretPasswordDescriptionTotpDto();
        const encryptedSecret = await EncryptMessageService.encrypt(JSON.stringify(clearSecret), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));

        const resource = defaultResourceV4Dto();
        resource.secrets = [{
          data: encryptedSecret
        }];

        spyOnKeyringSync.mockImplementation(() => undefined);
        spyOnFindResourceService.mockImplementation(() => undefined);
        spyOnFindResourceType.mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
        spyOnKeyringFindPublic.mockImplementation(userId => userKeys[userId]);
        spyOnGetOrFindResource.mockImplementation(() => new ResourcesCollection([resource]));

        const carolPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.carol.userId,
          aco_foreign_key: resource.id,
          type: 1,
        });

        const bettyPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.betty.userId,
          aco_foreign_key: resource.id,
        });

        const adaPermissionChange = defaultPermissionDto({
          aro_foreign_key: pgpKeys.ada.userId,
          aco_foreign_key: resource.id,
          type: 7,
          delete: true,
          group: null,
        }, {withUser: true});

        const permissionChanges = [carolPermissionChange, bettyPermissionChange, adaPermissionChange];
        const simulationResult = defaultPermissionSimulation([pgpKeys.betty.userId, pgpKeys.carol.userId], [pgpKeys.ada.userId]);

        fetch.doMockOnceIf(/share\/simulate\/resource\/.*/, async req => {
          const body = JSON.parse(await req.text());
          // @todo make the assertion happens out of the response mocked implementation.
          expect(permissionChanges).toEqual(
            expect.arrayContaining([
              expect.objectContaining(body.permissions[0]),
              expect.objectContaining(body.permissions[1]),
              expect.objectContaining(body.permissions[2])
            ])
          );
          return await mockApiResponse(simulationResult);
        });

        fetch.doMockOnceIf(/share\/resource\/.*/, async req => {
          const body = JSON.parse(await req.text());

          expect(permissionChanges).toEqual(
            expect.arrayContaining([
              expect.objectContaining(body.permissions[0]),
              expect.objectContaining(body.permissions[1]),
              expect.objectContaining(body.permissions[2])
            ])
          );
          expect(body.secrets?.length).toStrictEqual(2);

          await expect(() => OpenpgpAssertion.readMessageOrFail(body.secrets[0].data)).not.toThrow();
          await expect(() => OpenpgpAssertion.readMessageOrFail(body.secrets[1].data)).not.toThrow();

          const bettysEncryptedMessage = body.secrets.find(secret => secret.user_id === pgpKeys.betty.userId);
          const carolsEncryptedMessage = body.secrets.find(secret => secret.user_id === pgpKeys.carol.userId);

          const bettysPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
          const carolsPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.carol.private_decrypted);

          const bettysDecryptedMessage = await DecryptMessageService.decrypt(await OpenpgpAssertion.readMessageOrFail(bettysEncryptedMessage.data), bettysPrivateKey);
          const carolsDecryptedMessage = await DecryptMessageService.decrypt(await OpenpgpAssertion.readMessageOrFail(carolsEncryptedMessage.data), carolsPrivateKey);

          expect(JSON.parse(bettysDecryptedMessage)).toStrictEqual(clearSecret);
          expect(JSON.parse(carolsDecryptedMessage)).toStrictEqual(clearSecret);

          return mockApiResponse(null);
        });

        await service.exec([resource], permissionChanges, pgpKeys.admin.passphrase);

        expect(mockedProgressService.finishStep).toHaveBeenCalledWith('Synchronizing keys', true);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Calculating resource permissions 1/1`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Encrypting resource secret 1/2`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Encrypting resource secret 2/2`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Sharing resource 1/1`);
        expect(spyOnKeyringSync).toHaveBeenCalledTimes(1);
        expect(spyOnFindResourceService).toHaveBeenCalledTimes(1);
      }, 10 * 1000);
    });

    each([
      {title: "with password string V5", value: plaintextSecretPasswordStringDto()},
      {title: "with password and description V5", value: plaintextSecretPasswordAndDescriptionDto()},
      {title: "with password description and totp V5", value: plaintextSecretPasswordDescriptionTotpDto()},
      {title: "with standalon totp V5", value: plaintextSecretTotpDto()},
    ]).describe("should share the given resource", scenario => {
      it(`::${scenario.title}: with personal set to 'false'`, async() => {
        expect.assertions(15);

        const apiClientOptions = defaultApiClientOptions();
        const account = new AccountEntity(adminAccountDto());
        const mockedProgressService = {finishStep: jest.fn()};

        const service = new ShareResourceService(apiClientOptions, account, mockedProgressService);

        const spyOnKeyringSync = jest.spyOn(Keyring.prototype, "sync");
        const spyOnKeyringFindPublic = jest.spyOn(Keyring.prototype, "findPublic");
        const spyOnFindResourceService = jest.spyOn(service.findAndUpdateResourcesLocalStorage, "findAndUpdateAll");
        const spyOnFindResourceType = jest.spyOn(service.resourceTypeModel, "getOrFindAll");
        const spyOnResourceUpdate = jest.spyOn(service.resourceService, "update");
        const spyOnGetOrFindResource = jest.spyOn(service.getOrFindResourcesService, "getOrFindAll");

        spyOnKeyringSync.mockImplementation(() => undefined);
        spyOnFindResourceService.mockImplementation(() => undefined);
        spyOnFindResourceType.mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
        spyOnGetOrFindResource.mockImplementation(() => new ResourcesCollection([resource]));
        spyOnResourceUpdate.mockImplementation((resourceId, data, contains) => {
          expect(resourceId).toStrictEqual(resource.id);
          expect(data).toStrictEqual(resource);
          expect(contains).toStrictEqual(ResourceLocalStorage.DEFAULT_CONTAIN);
          return mockApiResponse(data);
        });

        const userKeys = {
          [pgpKeys.ada.userId]: {armoredKey: pgpKeys.ada.public},
          [pgpKeys.betty.userId]: {armoredKey: pgpKeys.betty.public},
          [pgpKeys.carol.userId]: {armoredKey: pgpKeys.carol.public},
        };
        spyOnKeyringFindPublic.mockImplementation(userId => userKeys[userId]);

        const clearSecret = plaintextSecretPasswordDescriptionTotpDto();
        const encryptedSecret = await EncryptMessageService.encrypt(JSON.stringify(clearSecret), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));

        const resource = defaultResourceDto({
          secrets: [{data: encryptedSecret}]
        });

        const carolPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.carol.userId,
          aco_foreign_key: resource.id,
          type: 1,
        });

        const bettyPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.betty.userId,
          aco_foreign_key: resource.id,
        });

        const adaPermissionChange = defaultPermissionDto({
          aro_foreign_key: pgpKeys.ada.userId,
          aco_foreign_key: resource.id,
          type: 7,
          delete: true,
          group: null,
        }, {withUser: true});

        const permissionChanges = [carolPermissionChange, bettyPermissionChange, adaPermissionChange];
        const simulationResult = defaultPermissionSimulation([pgpKeys.betty.userId, pgpKeys.carol.userId], [pgpKeys.ada.userId]);

        fetch.doMockOnceIf(/share\/simulate\/resource\/.*/, async req => {
          const body = JSON.parse(await req.text());
          // @todo make the assertion happens out of the response mocked implementation.
          expect(permissionChanges).toEqual(
            expect.arrayContaining([
              expect.objectContaining(body.permissions[0]),
              expect.objectContaining(body.permissions[1]),
              expect.objectContaining(body.permissions[2])
            ])
          );
          return await mockApiResponse(simulationResult);
        });

        fetch.doMockOnceIf(/share\/resource\/.*/, async req => {
          const body = JSON.parse(await req.text());

          expect(permissionChanges).toEqual(
            expect.arrayContaining([
              expect.objectContaining(body.permissions[0]),
              expect.objectContaining(body.permissions[1]),
              expect.objectContaining(body.permissions[2])
            ])
          );
          expect(body.secrets?.length).toStrictEqual(2);

          await expect(() => OpenpgpAssertion.readMessageOrFail(body.secrets[0].data)).not.toThrow();
          await expect(() => OpenpgpAssertion.readMessageOrFail(body.secrets[1].data)).not.toThrow();

          const bettysEncryptedMessage = body.secrets.find(secret => secret.user_id === pgpKeys.betty.userId);
          const carolsEncryptedMessage = body.secrets.find(secret => secret.user_id === pgpKeys.carol.userId);

          const bettysPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
          const carolsPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.carol.private_decrypted);

          const bettysDecryptedMessage = await DecryptMessageService.decrypt(await OpenpgpAssertion.readMessageOrFail(bettysEncryptedMessage.data), bettysPrivateKey);
          const carolsDecryptedMessage = await DecryptMessageService.decrypt(await OpenpgpAssertion.readMessageOrFail(carolsEncryptedMessage.data), carolsPrivateKey);

          expect(JSON.parse(bettysDecryptedMessage)).toStrictEqual(clearSecret);
          expect(JSON.parse(carolsDecryptedMessage)).toStrictEqual(clearSecret);

          return mockApiResponse(null);
        });

        await service.exec([resource], permissionChanges, pgpKeys.admin.passphrase);

        expect(mockedProgressService.finishStep).toHaveBeenCalledWith('Synchronizing keys', true);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Calculating resource permissions 1/1`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Encrypting resource secret 1/2`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Encrypting resource secret 2/2`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Sharing resource 1/1`);
        expect(spyOnKeyringSync).toHaveBeenCalledTimes(1);
        expect(spyOnFindResourceService).toHaveBeenCalledTimes(1);
        expect(spyOnResourceUpdate).not.toHaveBeenCalled();
      }, 10 * 1000);

      it(`::${scenario.title}: with personal set to 'true'`, async() => {
        expect.assertions(21);

        const apiClientOptions = defaultApiClientOptions();
        const account = new AccountEntity(defaultAccountDto());
        const mockedProgressService = {finishStep: jest.fn(), updateGoals: jest.fn()};

        const service = new ShareResourceService(apiClientOptions, account, mockedProgressService);

        const spyOnKeyringSync = jest.spyOn(Keyring.prototype, "sync");
        const spyOnKeyringFindPublic = jest.spyOn(Keyring.prototype, "findPublic");
        const spyOnFindResourceService = jest.spyOn(service.findAndUpdateResourcesLocalStorage, "findAndUpdateAll");
        const spyOnFindResourceType = jest.spyOn(service.resourceTypeModel, "getOrFindAll");
        const spyOnResourceUpdate = jest.spyOn(service.resourceService, "update");
        const spyOnFindMetadataKeyService = jest.spyOn(MetadataKeysApiService.prototype, "findAll");
        const spyOnPasswordLocalStorage = jest.spyOn(PassphraseStorageService, "get");
        const spyOnResourceLocalStorage = jest.spyOn(ResourceLocalStorage, "updateResource");
        const spyOnGetOrFindResource = jest.spyOn(service.getOrFindResourcesService, "getOrFindAll");

        const id = uuidv4();
        const metadata_private_keys = [defaultMetadataPrivateKeyDto({metadata_key_id: id, data: pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage})];
        const apiMetadataKeysCollection = [defaultMetadataKeyDto({id, metadata_private_keys}, {withMetadataPrivateKeys: true})];

        const userKeys = {
          [pgpKeys.ada.userId]: {armoredKey: pgpKeys.ada.public},
          [pgpKeys.betty.userId]: {armoredKey: pgpKeys.betty.public},
          [pgpKeys.carol.userId]: {armoredKey: pgpKeys.carol.public},
        };

        const clearSecret = plaintextSecretPasswordDescriptionTotpDto();
        const encryptedSecret = await EncryptMessageService.encrypt(JSON.stringify(clearSecret), await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public));

        const resource = defaultResourceDto({
          resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT_TOTP,
          secrets: [{data: encryptedSecret}],
          personal: true,
        });

        spyOnKeyringSync.mockImplementation(() => undefined);
        spyOnFindResourceService.mockImplementation(() => undefined);
        spyOnFindResourceType.mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
        spyOnPasswordLocalStorage.mockImplementation(() => pgpKeys.ada.passphrase);
        spyOnFindMetadataKeyService.mockImplementation(() => apiMetadataKeysCollection);
        spyOnResourceUpdate.mockImplementation((resourceId, data, contains) => {
          expect(resourceId).toStrictEqual(resource.id);
          expect(data.metadata_key_id).toStrictEqual(id);
          expect(data.metadata_key_type).toStrictEqual("shared_key");
          expect(data.personal).toStrictEqual(false);
          expect(contains).toStrictEqual(ResourceLocalStorage.DEFAULT_CONTAIN);
          return defaultResourceDto(data);
        });
        spyOnResourceLocalStorage.mockImplementation(r => {
          expect(r.id).toStrictEqual(resource.id);
        });
        spyOnKeyringFindPublic.mockImplementation(userId => userKeys[userId]);
        spyOnGetOrFindResource.mockImplementation(() => new ResourcesCollection([resource]));

        const carolPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.carol.userId,
          aco_foreign_key: resource.id,
          type: 1,
        });

        const bettyPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.betty.userId,
          aco_foreign_key: resource.id,
        });

        const adaPermissionChange = defaultPermissionDto({
          aro_foreign_key: pgpKeys.ada.userId,
          aco_foreign_key: resource.id,
          type: 7,
          delete: true,
          group: null,
        }, {withUser: true});

        const permissionChanges = [carolPermissionChange, bettyPermissionChange, adaPermissionChange];
        const simulationResult = defaultPermissionSimulation([pgpKeys.betty.userId, pgpKeys.carol.userId], [pgpKeys.ada.userId]);

        fetch.doMockOnceIf(/share\/simulate\/resource\/.*/, async req => {
          const body = JSON.parse(await req.text());
          // @todo make the assertion happens out of the response mocked implementation.
          expect(permissionChanges).toEqual(
            expect.arrayContaining([
              expect.objectContaining(body.permissions[0]),
              expect.objectContaining(body.permissions[1]),
              expect.objectContaining(body.permissions[2])
            ])
          );
          return await mockApiResponse(simulationResult);
        });

        fetch.doMockOnceIf(/share\/resource\/.*/, async req => {
          const body = JSON.parse(await req.text());

          expect(permissionChanges).toEqual(
            expect.arrayContaining([
              expect.objectContaining(body.permissions[0]),
              expect.objectContaining(body.permissions[1]),
              expect.objectContaining(body.permissions[2])
            ])
          );
          expect(body.secrets?.length).toStrictEqual(2);

          await expect(() => OpenpgpAssertion.readMessageOrFail(body.secrets[0].data)).not.toThrow();
          await expect(() => OpenpgpAssertion.readMessageOrFail(body.secrets[1].data)).not.toThrow();

          const bettysEncryptedMessage = body.secrets.find(secret => secret.user_id === pgpKeys.betty.userId);
          const carolsEncryptedMessage = body.secrets.find(secret => secret.user_id === pgpKeys.carol.userId);

          const bettysPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
          const carolsPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.carol.private_decrypted);

          const bettysDecryptedMessage = await DecryptMessageService.decrypt(await OpenpgpAssertion.readMessageOrFail(bettysEncryptedMessage.data), bettysPrivateKey);
          const carolsDecryptedMessage = await DecryptMessageService.decrypt(await OpenpgpAssertion.readMessageOrFail(carolsEncryptedMessage.data), carolsPrivateKey);

          expect(JSON.parse(bettysDecryptedMessage)).toStrictEqual(clearSecret);
          expect(JSON.parse(carolsDecryptedMessage)).toStrictEqual(clearSecret);

          return mockApiResponse(null);
        });

        await service.exec([resource], permissionChanges, pgpKeys.ada.passphrase);

        expect(mockedProgressService.finishStep).toHaveBeenCalledWith('Synchronizing keys', true);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Calculating resource permissions 1/1`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Encrypting resource secret 1/2`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Encrypting resource secret 2/2`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith(`Sharing resource 1/1`);
        expect(mockedProgressService.finishStep).toHaveBeenCalledWith('Updating resources metadata 1/1');
        expect(spyOnKeyringSync).toHaveBeenCalledTimes(1);
        expect(spyOnFindResourceService).toHaveBeenCalledTimes(1);
      }, 10 * 1000);
    });

    it("should assert its parameters.", async() => {
      expect.assertions(2);
      const apiClientOptions = defaultApiClientOptions();
      const account = new AccountEntity(defaultAccountDto());
      const mockedWorker = {port: new MockPort()};
      const progressService = new ProgressService(mockedWorker);
      const service = new ShareResourceService(apiClientOptions, account, progressService);

      await expect(() => service.exec("wrong", [])).rejects.toThrow(new TypeError("resources should be an non empty array"));
      await expect(() => service.exec(["test"], [])).rejects.toThrow(new TypeError("changes should be an non empty array"));
    });

    describe("should throw an error if something wrong happens during the share process.", () => {
      it("when the keyring cannot be synced", async() => {
        expect.assertions(2);

        const apiClientOptions = defaultApiClientOptions();
        const account = new AccountEntity(defaultAccountDto());
        const mockedProgressService = {finishStep: jest.fn()};

        const service = new ShareResourceService(apiClientOptions, account, mockedProgressService);

        const spyOnGetUserPrivateKey = jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey");
        const spyOnKeyringSync = jest.spyOn(Keyring.prototype, "sync");
        const spyOnFindResourceType = jest.spyOn(service.resourceTypeModel, "getOrFindAll");
        const spyOnGetOrFindResource = jest.spyOn(service.getOrFindResourcesService, "getOrFindAll");

        const expectedError = new Error("something wrong happened");
        const resource = defaultResourceDto();

        spyOnKeyringSync.mockImplementation(() => { throw expectedError; });
        spyOnGetUserPrivateKey.mockImplementation(() => pgpKeys.ada.private_decrypted);
        spyOnFindResourceType.mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
        spyOnGetOrFindResource.mockImplementation(() => new ResourcesCollection([resource]));

        const permissionChanges = [minimumPermissionDto()];
        await expect(() => service.exec([resource], permissionChanges, pgpKeys.ada.passphrase)).rejects.toThrow(expectedError);

        expect(spyOnKeyringSync).toHaveBeenCalledTimes(1);
      });

      it("when public key cannot be found", async() => {
        expect.assertions(1);

        const apiClientOptions = defaultApiClientOptions();
        const account = new AccountEntity(adminAccountDto());
        const mockedProgressService = {finishStep: jest.fn()};

        const service = new ShareResourceService(apiClientOptions, account, mockedProgressService);

        const spyOnGetUserPrivateKey = jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey");
        const spyOnKeyringSync = jest.spyOn(Keyring.prototype, "sync");
        const spyOnKeyringFindPublic = jest.spyOn(Keyring.prototype, "findPublic");
        const spyOnFindResourceType = jest.spyOn(service.resourceTypeModel, "getOrFindAll");
        const spyOnGetOrFindResource = jest.spyOn(service.getOrFindResourcesService, "getOrFindAll");

        const clearSecret = plaintextSecretPasswordDescriptionTotpDto();
        const encryptedSecret = await EncryptMessageService.encrypt(JSON.stringify(clearSecret), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));

        const resource = defaultResourceDto({
          secrets: [{data: encryptedSecret}],
          personal: true,
        });

        spyOnKeyringSync.mockImplementation(() => undefined);
        spyOnGetUserPrivateKey.mockImplementation(() => OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted));
        spyOnKeyringFindPublic.mockImplementation(() => undefined);
        spyOnFindResourceType.mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
        spyOnGetOrFindResource.mockImplementation(() => new ResourcesCollection([resource]));

        const carolPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.carol.userId,
          aco_foreign_key: resource.id,
          type: 1,
        });

        const permissionChanges = [carolPermissionChange];
        const simulationResult = defaultPermissionSimulation([pgpKeys.betty.userId, pgpKeys.carol.userId], [pgpKeys.ada.userId]);

        fetch.doMockOnceIf(/share\/simulate\/resource\/.*/, async() => mockApiResponse(simulationResult));

        const expectedError = new Error("Cannot read properties of undefined (reading 'armoredKey')");
        await expect(() => service.exec([resource], permissionChanges, pgpKeys.admin.passphrase)).rejects.toThrow(expectedError);
      }, 10 * 1000);

      it("when local storage cannot be refreshed", async() => {
        expect.assertions(2);

        const apiClientOptions = defaultApiClientOptions();
        const account = new AccountEntity(adminAccountDto());
        const mockedProgressService = {finishStep: jest.fn()};

        const service = new ShareResourceService(apiClientOptions, account, mockedProgressService);

        const spyOnGetUserPrivateKey = jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey");
        const spyOnKeyringSync = jest.spyOn(Keyring.prototype, "sync");
        const spyOnFindResourceService = jest.spyOn(service.findAndUpdateResourcesLocalStorage, "findAndUpdateAll");
        const spyOnFindResourceType = jest.spyOn(service.resourceTypeModel, "getOrFindAll");
        const spyOnGetOrFindResource = jest.spyOn(service.getOrFindResourcesService, "getOrFindAll");

        const expectedError = new Error("Something went wrong on the API");

        const clearSecret = plaintextSecretPasswordDescriptionTotpDto();
        const encryptedSecret = await EncryptMessageService.encrypt(JSON.stringify(clearSecret), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));

        const resource = defaultResourceDto({
          secrets: [{data: encryptedSecret}],
          personal: true,
        });

        spyOnKeyringSync.mockImplementation(() => undefined);
        spyOnFindResourceService.mockImplementation(() => { throw expectedError; });
        spyOnGetUserPrivateKey.mockImplementation(() => OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted));
        spyOnFindResourceType.mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
        spyOnGetOrFindResource.mockImplementation(() => new ResourcesCollection([resource]));

        const adaPermissionChange = defaultPermissionDto({
          aro_foreign_key: pgpKeys.ada.userId,
          aco_foreign_key: resource.id,
          type: 7,
          delete: true,
          group: null,
        }, {withUser: true});

        const permissionChanges = [adaPermissionChange];
        const simulationResult = defaultPermissionSimulation([], [pgpKeys.ada.userId]);

        fetch.doMockOnceIf(/share\/simulate\/resource\/.*/, async() => mockApiResponse(simulationResult));
        fetch.doMockOnceIf(/share\/resource\/.*/, async() => mockApiResponse(null));

        await expect(() => service.exec([resource], permissionChanges, pgpKeys.admin.passphrase)).rejects.toThrow(expectedError);
        expect(spyOnFindResourceService).toHaveBeenCalledTimes(1);
      }, 10 * 1000);

      it("when simulation on API crashes", async() => {
        expect.assertions(1);

        const apiClientOptions = defaultApiClientOptions();
        const account = new AccountEntity(adminAccountDto());
        const mockedProgressService = {finishStep: jest.fn()};

        const service = new ShareResourceService(apiClientOptions, account, mockedProgressService);

        const spyOnGetUserPrivateKey = jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey");
        const spyOnKeyringSync = jest.spyOn(Keyring.prototype, "sync");
        const spyOnFindResourceType = jest.spyOn(service.resourceTypeModel, "getOrFindAll");
        const spyOnGetOrFindResource = jest.spyOn(service.getOrFindResourcesService, "getOrFindAll");

        const resource = defaultResourceDto();
        const permissionChanges = [minimumPermissionDto({
          aco_foreign_key: resource.id,
        })];

        spyOnKeyringSync.mockImplementation(() => undefined);
        spyOnGetUserPrivateKey.mockImplementation(() => OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted));
        spyOnFindResourceType.mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
        spyOnGetOrFindResource.mockImplementation(() => new ResourcesCollection([resource]));

        const errorMessage = "Something wrong happened during simulation";
        fetch.doMockOnceIf(/share\/simulate\/resource\/.*/, () => mockApiResponseError(500, errorMessage));

        await expect(() => service.exec([resource], permissionChanges, pgpKeys.admin.passphrase)).rejects.toThrow(errorMessage);
      });

      it("when update on API crashes", async() => {
        expect.assertions(1);

        const apiClientOptions = defaultApiClientOptions();
        const account = new AccountEntity(adminAccountDto());
        const mockedProgressService = {finishStep: jest.fn()};

        const service = new ShareResourceService(apiClientOptions, account, mockedProgressService);

        const spyOnGetUserPrivateKey = jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey");
        const spyOnKeyringSync = jest.spyOn(Keyring.prototype, "sync");
        const spyOnKeyringFindPublic = jest.spyOn(Keyring.prototype, "findPublic");
        const spyOnFindResourceType = jest.spyOn(service.resourceTypeModel, "getOrFindAll");
        const spyOnGetOrFindResource = jest.spyOn(service.getOrFindResourcesService, "getOrFindAll");

        const userKeys = {
          [pgpKeys.carol.userId]: {armoredKey: pgpKeys.carol.public},
        };
        spyOnKeyringFindPublic.mockImplementation(userId => userKeys[userId]);

        const clearSecret = plaintextSecretPasswordDescriptionTotpDto();
        const encryptedSecret = await EncryptMessageService.encrypt(JSON.stringify(clearSecret), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));

        const resource = defaultResourceDto({
          secrets: [{data: encryptedSecret}]
        });

        spyOnKeyringSync.mockImplementation(() => undefined);
        spyOnGetUserPrivateKey.mockImplementation(() => OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted));
        spyOnFindResourceType.mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
        spyOnGetOrFindResource.mockImplementation(() => new ResourcesCollection([resource]));

        const carolPermissionChange = minimumPermissionDto({
          aro_foreign_key: pgpKeys.carol.userId,
          aco_foreign_key: resource.id,
          type: 1,
        });

        const permissionChanges = [carolPermissionChange];
        const simulationResult = defaultPermissionSimulation([pgpKeys.carol.userId]);

        fetch.doMockOnceIf(/share\/simulate\/resource\/.*/, () => mockApiResponse(simulationResult));

        const errorMessage = "Something went wrong during update on the API";
        fetch.doMockOnceIf(/share\/resource\/.*/, () => mockApiResponseError(500, errorMessage));

        await expect(() => service.exec([resource], permissionChanges, pgpKeys.admin.passphrase)).rejects.toThrow(errorMessage);
      }, 10 * 1000);
    });
  });
});
