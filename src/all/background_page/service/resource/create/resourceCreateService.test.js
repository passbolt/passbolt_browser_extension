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

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../../model/entity/account/accountEntity";
import ResourceCreateService from "./resourceCreateService";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import {
  defaultResourceDto, resourceWithTotpDto, resourceLegacyDto, resourceStandaloneTotpDto
} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {v4 as uuidv4} from "uuid";
import ResourceEntity from "../../../model/entity/resource/resourceEntity";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import Keyring from "../../../model/keyring";
import ProgressService from "../../progress/progressService";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import ResourceService from "../../api/resource/resourceService";
import DecryptMessageService from "../../crypto/decryptMessageService";
import {OpenpgpAssertion} from "../../../utils/openpgp/openpgpAssertions";
import ResourceTypeService from "../../api/resourceType/resourceTypeService";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {
  TEST_RESOURCE_TYPE_V5_DEFAULT, TEST_RESOURCE_TYPE_V5_DEFAULT_TOTP, TEST_RESOURCE_TYPE_V5_TOTP,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {plaintextSecretPasswordAndDescriptionDto, plaintextSecretPasswordDescriptionTotpDto, plaintextSecretPasswordStringDto, plaintextSecretTotpDto} from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import FolderService from "../../api/folder/folderService";
import ShareService from "../../api/share/shareService";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {
  defaultDecryptedSharedMetadataKeysDtos
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import FindMetadataKeysService from "../../metadata/findMetadataKeysService";
import ResourceSecretsCollection from "../../../model/entity/secret/resource/resourceSecretsCollection";
import DecryptMetadataService from "../../metadata/decryptMetadataService";
import expect from "expect";
import GetDecryptedUserPrivateKeyService from "../../account/getDecryptedUserPrivateKeyService";

jest.mock("../../../service/progress/progressService");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ResourceCreateService", () => {
  let resourceCreateService, worker, apiClientOptions;
  const secret = "secret";
  const account = new AccountEntity(defaultAccountDto());

  beforeEach(async() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    apiClientOptions = defaultApiClientOptions();
    jest.spyOn(Keyring.prototype, "sync").mockImplementation(() => jest.fn());
    jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
    jest.spyOn(ResourceLocalStorage, "addResource");
    resourceCreateService = new ResourceCreateService(account, apiClientOptions, new ProgressService(worker, ""));
  });

  describe("ResourceCreateService::exec", () => {
    it("Should call progress service during the different steps of creation", async() => {
      expect.assertions(4);

      const resourceDto = defaultResourceDto();
      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => defaultResourceDto());
      await resourceCreateService.create(resourceDto, secret, pgpKeys.ada.passphrase);

      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledTimes(2);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith('Creating password', true);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith("Encrypting secret", true);
      expect(resourceCreateService.progressService.updateGoals).toHaveBeenCalledWith(3);
    });


    it("Should create the resource with encrypted secrets <password> and dto", async() => {
      expect.assertions(3);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = resourceLegacyDto();
      const plaintextDto = plaintextSecretPasswordStringDto().password;

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
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

    it("Should create the resource with encrypted secrets <password && description> and dto", async() => {
      expect.assertions(3);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = defaultResourceDto();
      const plaintextDto = plaintextSecretPasswordAndDescriptionDto();

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
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

    it("Should create the resource with encrypted secrets <totp> and dto", async() => {
      expect.assertions(3);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = resourceStandaloneTotpDto();
      const plaintextDto = plaintextSecretTotpDto();

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
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

    it("Should create the resource with encrypted secrets <password && totp && description> and dto", async() => {
      expect.assertions(3);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = resourceWithTotpDto();
      const plaintextDto = plaintextSecretPasswordDescriptionTotpDto();

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
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

    it("Should create the resource V5 default", async() => {
      expect.assertions(4);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT});
      const plaintextDto = plaintextSecretPasswordAndDescriptionDto();
      const decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
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
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async() => decryptionKey);
      // Decrypt metadata
      const resourceEntityUpdated = new ResourceEntity(resourceToAPI);
      expect(resourceEntityUpdated.isMetadataDecrypted()).toBeFalsy();
      await decryptMetadataService.decryptOneWithUserKey(resourceEntityUpdated, pgpKeys.ada.passphrase);

      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      //Metadata decrypted should be equal
      expect(resourceEntityUpdated.metadata.toDto()).toEqual(resourceDto.metadata);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should create the resource V5 default totp", async() => {
      expect.assertions(4);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = defaultResourceDto({resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT_TOTP});
      const plaintextDto = plaintextSecretPasswordDescriptionTotpDto();
      const decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
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
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async() => decryptionKey);
      // Decrypt metadata
      const resourceEntityUpdated = new ResourceEntity(resourceToAPI);
      expect(resourceEntityUpdated.isMetadataDecrypted()).toBeFalsy();
      await decryptMetadataService.decryptOneWithUserKey(resourceEntityUpdated, pgpKeys.ada.passphrase);

      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      //Metadata decrypted should be equal
      expect(resourceEntityUpdated.metadata.toDto()).toEqual(resourceDto.metadata);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should create the resource V5 standalone totp", async() => {
      expect.assertions(4);
      let resourceToAPI, resourceLocalStorageExpected;
      const resourceDto = resourceStandaloneTotpDto({resource_type_id: TEST_RESOURCE_TYPE_V5_TOTP});
      const plaintextDto = plaintextSecretTotpDto();
      const decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
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
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(async() => decryptionKey);
      // Decrypt metadata
      const resourceEntityUpdated = new ResourceEntity(resourceToAPI);
      expect(resourceEntityUpdated.isMetadataDecrypted()).toBeFalsy();
      await decryptMetadataService.decryptOneWithUserKey(resourceEntityUpdated, pgpKeys.ada.passphrase);

      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      //Metadata decrypted should be equal
      expect(resourceEntityUpdated.metadata.toDto()).toEqual(resourceDto.metadata);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
    });

    it("Should not create the resource if the secret is longer than expected", async() => {
      expect.assertions(1);
      const resourceDto = defaultResourceDto();
      const promise = resourceCreateService.create(resourceDto, "a".repeat(4097), pgpKeys.ada.passphrase);

      return expect(promise).rejects.toThrow(new TypeError("The secret should be maximum 4096 characters in length."));
    });

    it("Should create the resource into folder parent", async() => {
      expect.assertions(1);

      const folderId = uuidv4();
      const resourceDto = defaultResourceDto({folder_parent_id: folderId});
      const shareResourceChanges  = {
        changes: {
          added: [],
          removed: []
        }
      };

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => [resourceDto]);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => resourceDto);
      jest.spyOn(FolderService.prototype, "findAllForShare").mockImplementation(() => [defaultFolderDto({id: folderId}, {withPermissions: true})]);
      jest.spyOn(ShareService.prototype, "simulateShareResource").mockImplementation(() => shareResourceChanges);
      jest.spyOn(ShareService.prototype, "shareFolder").mockImplementation(() => shareResourceChanges);
      jest.spyOn(ShareService.prototype, "shareResource").mockImplementation(() => jest.fn());

      jest.spyOn(resourceCreateService, "share");

      await resourceCreateService.create(resourceDto, plaintextSecretPasswordStringDto().password, pgpKeys.ada.passphrase);

      expect(resourceCreateService.share).toHaveBeenCalledTimes(1);
    });

    it("Should create the resource V5 into folder parent", async() => {
      expect.assertions(5);

      let resourceToAPI, resourceLocalStorageExpected;
      const folderId = uuidv4();
      const resourceDto = defaultResourceDto({folder_parent_id: folderId, resource_type_id: TEST_RESOURCE_TYPE_V5_DEFAULT});
      const plaintextDto = plaintextSecretPasswordDescriptionTotpDto();
      const decryptMetadataService = new DecryptMetadataService(apiClientOptions, account);
      const shareResourceChanges  = {
        changes: {
          added: [],
          removed: []
        }
      };
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        const resourceEntity = new ResourceEntity(resourceDto);
        resourceEntity.secrets = new ResourceSecretsCollection([resourceToAPI.secrets[0]]);
        resourceEntity.metadataKeyId = resourceToAPI.metadata_key_id;
        resourceEntity.metadataKeyType = resourceToAPI.metadata_key_type;
        resourceLocalStorageExpected = resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
        resourceEntity.metadata = resourceToAPI.metadata;
        return resourceEntity.toDto(ResourceLocalStorage.DEFAULT_CONTAIN);
      });
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => [resourceDto]);
      jest.spyOn(FolderService.prototype, "findAllForShare").mockImplementation(() => [defaultFolderDto({id: folderId}, {withPermissions: true})]);
      jest.spyOn(ShareService.prototype, "simulateShareResource").mockImplementation(() => shareResourceChanges);
      jest.spyOn(ShareService.prototype, "shareFolder").mockImplementation(() => shareResourceChanges);
      jest.spyOn(ShareService.prototype, "shareResource").mockImplementation(() => jest.fn());
      jest.spyOn(FindMetadataKeysService.prototype, "findAllForSessionStorage").mockImplementation(() => metadataKeys);

      jest.spyOn(resourceCreateService, "share");

      await resourceCreateService.create(resourceDto, plaintextDto, pgpKeys.ada.passphrase);

      // Decrypt metadata
      const resourceEntityUpdated = new ResourceEntity(resourceToAPI);
      expect(resourceEntityUpdated.isMetadataDecrypted()).toBeFalsy();
      await decryptMetadataService.decryptOneWithSharedKey(resourceEntityUpdated);

      expect(resourceCreateService.share).toHaveBeenCalledTimes(1);
      //Metadata decrypted should be equal
      expect(resourceEntityUpdated.metadata.toDto()).toEqual(resourceDto.metadata);
      // Resource local storage should add the resource
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(new ResourceEntity(resourceLocalStorageExpected));
      expect(resourceCreateService.progressService.updateGoals).toHaveBeenCalledWith(13);
    });
  });
});
