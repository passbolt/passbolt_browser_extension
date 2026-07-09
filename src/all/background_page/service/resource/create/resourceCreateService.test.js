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

import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../../model/entity/account/accountEntity";
import ResourceCreateService from "./resourceCreateService";
import { defaultAccountDto } from "../../../model/entity/account/accountEntity.test.data";
import {
  defaultResourceDto,
  resourceLegacyDto,
  resourceStandaloneTotpDto,
  resourceWithTotpDto,
} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import { pgpKeys } from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import { v4 as uuidv4 } from "uuid";
import ResourceEntity from "../../../model/entity/resource/resourceEntity";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import Keyring from "../../../model/keyring";
import ProgressService from "../../progress/progressService";
import ResourceService from "../../api/resource/resourceService";
import DecryptMessageService from "../../crypto/decryptMessageService";
import { OpenpgpAssertion } from "../../../utils/openpgp/openpgpAssertions";
import ResourceTypeService from "../../api/resourceType/resourceTypeService";
import { resourceTypesCollectionDto } from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {
  TEST_RESOURCE_TYPE_V5_DEFAULT,
  TEST_RESOURCE_TYPE_V5_DEFAULT_TOTP,
  TEST_RESOURCE_TYPE_V5_TOTP,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {
  plaintextSecretPasswordAndDescriptionDto,
  plaintextSecretPasswordDescriptionTotpDto,
  plaintextSecretPasswordStringDto,
  plaintextSecretTotpDto,
} from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import FindFoldersService from "../../folder/findFoldersService";
import ShareApiService from "../../api/share/shareApiService";
import ResourceSecretsCollection from "../../../model/entity/secret/resource/resourceSecretsCollection";
import DecryptMetadataService from "../../metadata/decryptMetadataService";
import GetDecryptedUserPrivateKeyService from "../../account/getDecryptedUserPrivateKeyService";
import { defaultMetadataKeysSettingsDto } from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";

jest.mock("../../../service/progress/progressService");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ResourceCreateService", () => {
  let resourceCreateService, worker, apiClientOptions;
  const secret = "secret";
  const account = new AccountEntity(defaultAccountDto());

  beforeEach(async () => {
    worker = {
      port: {
        emit: jest.fn(),
      },
    };
    apiClientOptions = defaultApiClientOptions();
    jest.spyOn(Keyring.prototype, "sync").mockImplementation(() => jest.fn());
    jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
    jest.spyOn(ResourceLocalStorage, "addResource");
    resourceCreateService = new ResourceCreateService(account, apiClientOptions, new ProgressService(worker, ""));
  });

  describe("ResourceCreateService::exec", () => {
    it("Should call progress service during the different steps of creation", async () => {
      expect.assertions(4);

      const resourceDto = defaultResourceDto();
      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => defaultResourceDto());
      await resourceCreateService.create(resourceDto, secret, pgpKeys.ada.passphrase);

      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledTimes(2);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith("Creating resource", true);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith("Encrypting secret", true);
      expect(resourceCreateService.progressService.updateGoals).toHaveBeenCalledWith(3);
    });

    it("Should create the resource with encrypted secrets <password> and dto", async () => {
      expect.assertions(3);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = resourceLegacyDto();
      const plaintextDto = plaintextSecretPasswordStringDto().password;

      jest.spyOn(ResourceService.prototype, "create").mockImplementation((resource) => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        const resourceEntity = new ResourceEntity(resourceDto);
        resourceEntity.secrets = new ResourceSecretsCollection([resourceToAPI.secrets[0]]);
        resourceLocalStorageExpected = resourceEntity.toV4Dto(ResourceLocalStorage.DEFAULT_CONTAIN);
        return resourceLocalStorageExpected;
      });

      await resourceCreateService.create(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);

      expect(resourceToAPI.secrets.length).toEqual(1);
      //Validate secret
      expect(decryptedSecretSent).toEqual(plaintextDto);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should create the resource with encrypted secrets <password && description> and dto", async () => {
      expect.assertions(3);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = defaultResourceDto();
      const plaintextDto = plaintextSecretPasswordAndDescriptionDto();

      jest.spyOn(ResourceService.prototype, "create").mockImplementation((resource) => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        const resourceEntity = new ResourceEntity(resourceDto);
        resourceEntity.secrets = new ResourceSecretsCollection([resourceToAPI.secrets[0]]);
        resourceLocalStorageExpected = resourceEntity.toV4Dto(ResourceLocalStorage.DEFAULT_CONTAIN);
        return resourceLocalStorageExpected;
      });

      await resourceCreateService.create(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);

      expect(resourceToAPI.secrets.length).toEqual(1);
      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should create the resource with encrypted secrets <totp> and dto", async () => {
      expect.assertions(3);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = resourceStandaloneTotpDto();
      const plaintextDto = plaintextSecretTotpDto();

      jest.spyOn(ResourceService.prototype, "create").mockImplementation((resource) => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        const resourceEntity = new ResourceEntity(resourceDto);
        resourceEntity.secrets = new ResourceSecretsCollection([resourceToAPI.secrets[0]]);
        resourceLocalStorageExpected = resourceEntity.toV4Dto(ResourceLocalStorage.DEFAULT_CONTAIN);
        return resourceLocalStorageExpected;
      });

      await resourceCreateService.create(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);

      expect(resourceToAPI.secrets.length).toEqual(1);
      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should create the resource with encrypted secrets <password && totp && description> and dto", async () => {
      expect.assertions(3);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = resourceWithTotpDto();
      const plaintextDto = plaintextSecretPasswordDescriptionTotpDto();

      jest.spyOn(ResourceService.prototype, "create").mockImplementation((resource) => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        const resourceEntity = new ResourceEntity(resourceDto);
        resourceEntity.secrets = new ResourceSecretsCollection([resourceToAPI.secrets[0]]);
        resourceLocalStorageExpected = resourceEntity.toV4Dto(ResourceLocalStorage.DEFAULT_CONTAIN);
        return resourceLocalStorageExpected;
      });

      await resourceCreateService.create(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);

      expect(resourceToAPI.secrets.length).toEqual(1);
      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should create the resource V5 default", async () => {
      expect.assertions(4);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = defaultResourceDto({ resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT });
      const plaintextDto = plaintextSecretPasswordAndDescriptionDto();
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);

      jest
        .spyOn(
          resourceCreateService.encryptMetadataKeysService.getOrFindMetadataSettingsService
            .findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService
            .metadataKeysSettingsApiService,
          "findSettings",
        )
        .mockImplementation(() => metadataKeysSettingsDto);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation((resource) => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        const resourceEntity = new ResourceEntity(resourceDto);
        resourceEntity.secrets = new ResourceSecretsCollection([resourceToAPI.secrets[0]]);
        resourceEntity.metadataKeyType = resourceToAPI.metadata_key_type;
        resourceLocalStorageExpected = resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
        resourceEntity.metadata = resourceToAPI.metadata;
        return resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
      });

      await resourceCreateService.create(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async () => decryptionKey);
      // Decrypt metadata
      const resourceEntityUpdated = new ResourceEntity(resourceToAPI);
      expect(resourceEntityUpdated.isMetadataDecrypted()).toBeFalsy();
      const privateKeyDecrypted = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      await decryptMetadataService.decryptMetadataWithGpgKey(resourceEntityUpdated, privateKeyDecrypted);

      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      //Metadata decrypted should be equal
      expect(resourceEntityUpdated.metadata.toDto()).toEqual(resourceDto.metadata);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should create the resource V5 default totp", async () => {
      expect.assertions(4);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = defaultResourceDto({ resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT_TOTP });
      const plaintextDto = plaintextSecretPasswordDescriptionTotpDto();
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);

      jest
        .spyOn(
          resourceCreateService.encryptMetadataKeysService.getOrFindMetadataSettingsService
            .findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService
            .metadataKeysSettingsApiService,
          "findSettings",
        )
        .mockImplementation(() => metadataKeysSettingsDto);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation((resource) => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        const resourceEntity = new ResourceEntity(resourceDto);
        resourceEntity.secrets = new ResourceSecretsCollection([resourceToAPI.secrets[0]]);
        resourceEntity.metadataKeyType = resourceToAPI.metadata_key_type;
        resourceLocalStorageExpected = resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
        resourceEntity.metadata = resourceToAPI.metadata;
        return resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
      });

      await resourceCreateService.create(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async () => decryptionKey);
      // Decrypt metadata
      const resourceEntityUpdated = new ResourceEntity(resourceToAPI);
      expect(resourceEntityUpdated.isMetadataDecrypted()).toBeFalsy();
      const privateKeyDecrypted = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      await decryptMetadataService.decryptMetadataWithGpgKey(resourceEntityUpdated, privateKeyDecrypted);

      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      //Metadata decrypted should be equal
      expect(resourceEntityUpdated.metadata.toDto()).toEqual(resourceDto.metadata);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should create the resource V5 standalone totp", async () => {
      expect.assertions(4);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = resourceStandaloneTotpDto({ resource_type_id: TEST_RESOURCE_TYPE_V5_TOTP });
      const plaintextDto = plaintextSecretTotpDto();
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);

      jest
        .spyOn(
          resourceCreateService.encryptMetadataKeysService.getOrFindMetadataSettingsService
            .findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService
            .metadataKeysSettingsApiService,
          "findSettings",
        )
        .mockImplementation(() => metadataKeysSettingsDto);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation((resource) => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        const resourceEntity = new ResourceEntity(resourceDto);
        resourceEntity.secrets = new ResourceSecretsCollection([resourceToAPI.secrets[0]]);
        resourceEntity.metadataKeyType = resourceToAPI.metadata_key_type;
        resourceLocalStorageExpected = resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
        resourceEntity.metadata = resourceToAPI.metadata;
        return resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
      });

      await resourceCreateService.create(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async () => decryptionKey);
      // Decrypt metadata
      const resourceEntityUpdated = new ResourceEntity(resourceToAPI);
      expect(resourceEntityUpdated.isMetadataDecrypted()).toBeFalsy();
      const privateKeyDecrypted = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      await decryptMetadataService.decryptMetadataWithGpgKey(resourceEntityUpdated, privateKeyDecrypted);

      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      //Metadata decrypted should be equal
      expect(resourceEntityUpdated.metadata.toDto()).toEqual(resourceDto.metadata);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should not create the resource if the secret is longer than expected", async () => {
      expect.assertions(1);
      const resourceDto = defaultResourceDto();
      const promise = resourceCreateService.create(resourceDto, "a".repeat(4097), pgpKeys.ada.passphrase);

      return expect(promise).rejects.toThrow("The secret should be maximum 4096 characters in length.");
    });

    it("Should create the resource operator-only and skip the share step when no permissionChanges are passed", async () => {
      expect.assertions(3);

      const folderId = uuidv4();
      const resourceDto = defaultResourceDto({ folder_parent_id: folderId });
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => [resourceDto]);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => resourceDto);
      jest.spyOn(FindFoldersService.prototype, "findByIdWithPermissions");
      jest.spyOn(ShareApiService.prototype, "shareResource");
      jest.spyOn(resourceCreateService.shareResourceService, "shareAll");

      await resourceCreateService.create(
        resourceDto,
        plaintextSecretPasswordStringDto().password,
        pgpKeys.ada.passphrase,
      );

      // No parent folder permission lookup, no implicit inheritance, no share step — the resource
      // is created with only the operator's secret encrypted. Sharing is opt-in via the new
      // `permissionChanges` argument.
      expect(FindFoldersService.prototype.findByIdWithPermissions).not.toHaveBeenCalled();
      expect(ShareApiService.prototype.shareResource).not.toHaveBeenCalled();
      expect(resourceCreateService.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("Should create the resource operator-only and then run shareResourceService.shareAll when permissionChanges are passed", async () => {
      expect.assertions(3);

      const folderId = uuidv4();
      const createdResourceId = uuidv4();
      const resourceDto = defaultResourceDto({ id: createdResourceId, folder_parent_id: folderId });
      const aroForeignKey = uuidv4();
      const permissionChanges = [
        {
          is_new: true,
          aro: "User",
          aro_foreign_key: aroForeignKey,
          aco: "Resource",
          aco_foreign_key: createdResourceId,
          type: 1,
        },
      ];
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => [resourceDto]);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => resourceDto);
      jest.spyOn(resourceCreateService.shareResourceService, "shareAll").mockImplementation(() => {});

      await resourceCreateService.create(
        resourceDto,
        plaintextSecretPasswordStringDto().password,
        pgpKeys.ada.passphrase,
        permissionChanges,
      );

      expect(resourceCreateService.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      const [resourcesIds, changesCollection] = resourceCreateService.shareResourceService.shareAll.mock.calls[0];
      expect(resourcesIds).toEqual([createdResourceId]);
      // The service wraps the caller's plain DTO list into a PermissionChangesCollection before
      // handing it to shareAll. We check the aro/aco wiring; `is_new` is implied for new rows and
      // normalized away by the collection.
      expect(changesCollection.toDto()).toEqual([
        expect.objectContaining({
          aro: "User",
          aro_foreign_key: aroForeignKey,
          aco: "Resource",
          aco_foreign_key: createdResourceId,
          type: 1,
        }),
      ]);
    });

    it("Should create a V5 resource with personal metadata even when the parent folder is shared (workflow re-shares it afterwards)", async () => {
      expect.assertions(4);

      let resourceToAPI, resourceLocalStorageExpected;
      const folderId = uuidv4();
      const resourceDto = defaultResourceDto({
        folder_parent_id: folderId,
        resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT,
      });
      const plaintextDto = plaintextSecretPasswordDescriptionTotpDto();
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();
      const decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);

      jest
        .spyOn(
          resourceCreateService.encryptMetadataKeysService.getOrFindMetadataSettingsService
            .findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService
            .metadataKeysSettingsApiService,
          "findSettings",
        )
        .mockImplementation(() => metadataKeysSettingsDto);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation((resource) => {
        resourceToAPI = resource;
        const resourceEntity = new ResourceEntity(resourceDto);
        resourceEntity.secrets = new ResourceSecretsCollection([resourceToAPI.secrets[0]]);
        resourceEntity.metadataKeyType = resourceToAPI.metadata_key_type;
        resourceLocalStorageExpected = resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
        resourceEntity.metadata = resourceToAPI.metadata;
        return resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
      });
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => [resourceDto]);
      jest.spyOn(FindFoldersService.prototype, "findByIdWithPermissions");
      jest.spyOn(ShareApiService.prototype, "shareResource");

      await resourceCreateService.create(resourceDto, plaintextDto, pgpKeys.ada.passphrase);

      // Decrypt metadata: the resource is created personal, so its metadata is encrypted with the
      // operator's personal key, not the shared metadata key.
      const resourceEntityUpdated = new ResourceEntity(resourceToAPI);
      const privateKeyDecrypted = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      await decryptMetadataService.decryptMetadataWithGpgKey(resourceEntityUpdated, privateKeyDecrypted);

      expect(FindFoldersService.prototype.findByIdWithPermissions).not.toHaveBeenCalled();
      expect(ShareApiService.prototype.shareResource).not.toHaveBeenCalled();
      expect(resourceEntityUpdated.metadata.toDto()).toEqual(resourceDto.metadata);
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should call updateGoals with the operator-only step count regardless of whether the parent folder is set", async () => {
      expect.assertions(1);

      const folderId = uuidv4();
      const resourceDto = defaultResourceDto({
        folder_parent_id: folderId,
        resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT,
      });
      const plaintextDto = plaintextSecretPasswordDescriptionTotpDto();
      const metadataKeysSettingsDto = defaultMetadataKeysSettingsDto();

      jest
        .spyOn(
          resourceCreateService.encryptMetadataKeysService.getOrFindMetadataSettingsService
            .findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService
            .metadataKeysSettingsApiService,
          "findSettings",
        )
        .mockImplementation(() => metadataKeysSettingsDto);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => {
        const resourceEntity = new ResourceEntity(resourceDto);
        return resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
      });
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => [resourceDto]);

      await resourceCreateService.create(resourceDto, plaintextDto, pgpKeys.ada.passphrase);

      // Operator-only V5: 4 steps (encrypt metadata + encrypt secret + create + local storage),
      // no share-related steps anymore.
      expect(resourceCreateService.progressService.updateGoals).toHaveBeenCalledWith(4);
    });
  });
});
