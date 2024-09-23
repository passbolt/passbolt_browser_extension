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
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {v4 as uuidv4} from "uuid";
import ResourceEntity from "../../../model/entity/resource/resourceEntity";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import {folderModelMock, resourceModelMock, shareModelMock} from "./resourceCreateService.test.data";
import Keyring from "../../../model/keyring";
import FolderEntity from "../../../model/entity/folder/folderEntity";
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
  TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP,
  TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION,
  TEST_RESOURCE_TYPE_TOTP
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {plaintextSecretPasswordAndDescriptionDto, plaintextSecretPasswordDescriptionTotpDto, plaintextSecretPasswordStringDto, plaintextSecretTotpDto} from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import FolderService from "../../api/folder/folderService";
import ShareService from "../../api/share/shareService";

jest.mock("../../../service/progress/progressService");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ResourceCreateService", () => {
  let resourceCreateService, resourceDto, worker, apiClientOptions;
  const secret = "secret";
  const account = new AccountEntity(defaultAccountDto());

  beforeEach(async() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    apiClientOptions = defaultApiClientOptions();
    resourceDto = defaultResourceDto();
    jest.spyOn(Keyring.prototype, "sync").mockImplementation(() => jest.fn());
    jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypesCollectionDto());
    resourceCreateService = new ResourceCreateService(account, apiClientOptions, new ProgressService(worker, ""));
  });

  describe("ResourceCreateService::exec", () => {
    it("Should call progress service during the differents steps of creation", async() => {
      expect.assertions(3);

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => defaultResourceDto());
      await resourceCreateService.exec(resourceDto, secret, pgpKeys.ada.passphrase);

      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledTimes(2);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith('Creating password', true);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith("Encrypting secret", true);
    });


    it("Should create the resource with encrypted secrets <password> and dto", async() => {
      expect.assertions(3);
      let resourceToAPI;
      const plaintextDto = plaintextSecretPasswordStringDto().password;

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        return defaultResourceDto(resource);
      });

      await resourceCreateService.exec(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);

      expect(resourceToAPI.secrets.length).toEqual(1);
      //Validate secret
      expect(decryptedSecretSent).toEqual(plaintextDto);
      //Description should not be encrypted
      expect(resourceToAPI.description).toEqual(resourceToAPI.description);
    });

    it("Should create the resource with encrypted secrets <password && description> and dto", async() => {
      expect.assertions(3);
      let resourceToAPI;
      const plaintextDto = plaintextSecretPasswordAndDescriptionDto();

      resourceDto.resource_type_id = TEST_RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION;

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        return defaultResourceDto(resource);
      });

      await resourceCreateService.exec(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);

      expect(resourceToAPI.secrets.length).toEqual(1);
      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      //Description should be encrypted
      expect(resourceToAPI.description).not.toEqual(resourceDto.description);
    });

    it("Should create the resource with encrypted secrets <password && totp> and dto", async() => {
      expect.assertions(3);
      let resourceToAPI;
      const plaintextDto = plaintextSecretTotpDto();

      resourceDto.resource_type_id = TEST_RESOURCE_TYPE_TOTP;

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        return defaultResourceDto(resource);
      });

      await resourceCreateService.exec(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);

      expect(resourceToAPI.secrets.length).toEqual(1);
      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      //Description should be encrypted
      expect(resourceToAPI.description).not.toEqual(resourceDto.description);
    });

    it("Should create the resource with encrypted secrets <password && totp && description> and dto", async() => {
      expect.assertions(3);
      let resourceToAPI;
      const plaintextDto = plaintextSecretPasswordDescriptionTotpDto();

      resourceDto.resource_type_id = TEST_RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP;

      jest.spyOn(ResourceService.prototype, "create").mockImplementation(resource => {
        //Used to check the data sent to API
        resourceToAPI = resource;
        return defaultResourceDto(resource);
      });

      await resourceCreateService.exec(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      //Decrypt secret
      const decryptionKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(resourceToAPI.secrets[0].data);
      const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const decryptedSecretSent = await DecryptMessageService.decrypt(secretMessage, decryptionKey, [verifyingKey]);

      expect(resourceToAPI.secrets.length).toEqual(1);
      //Validate secret
      expect(JSON.parse(decryptedSecretSent)).toEqual(plaintextDto);
      //Description should be encrypted
      expect(resourceToAPI.description).not.toEqual(resourceDto.description);
    });

    it("Should not create the resource if the secret is longer than expected", async() => {
      expect.assertions(1);

      const promise = resourceCreateService.exec(resourceDto, "a".repeat(4097), pgpKeys.ada.passphrase);

      return expect(promise).rejects.toThrow(new TypeError("The secret should be maximum 4096 characters in length."));
    });

    it("Should create the resource into folder parent", async() => {
      expect.assertions(1);

      const folderId = uuidv4();
      const shareResourceChanges  = {
        changes: {
          added: [],
          removed: []
        }
      };

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => [defaultResourceDto({folder_parent_id: folderId})]);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => defaultResourceDto({folder_parent_id: folderId}));
      jest.spyOn(FolderService.prototype, "findAllForShare").mockImplementation(() => [defaultFolderDto({id: folderId}, {withPermissions: true})]);
      jest.spyOn(ShareService.prototype, "simulateShareResource").mockImplementation(() => shareResourceChanges);
      jest.spyOn(ShareService.prototype, "shareFolder").mockImplementation(() => shareResourceChanges);
      jest.spyOn(ShareService.prototype, "shareResource").mockImplementation(() => jest.fn());

      jest.spyOn(resourceCreateService, "handleCreateInFolder");

      await resourceCreateService.exec(resourceDto, plaintextSecretPasswordStringDto().password, pgpKeys.ada.passphrase);

      expect(resourceCreateService.handleCreateInFolder).toHaveBeenCalledTimes(1);
    });
  });

  describe("ResourceCreateService::create", () => {
    let entity;

    beforeEach(async() => {
      entity = new ResourceEntity(resourceDto);
      jest.spyOn(resourceCreateService.resourceService, "create").mockImplementation(() => defaultResourceDto());
    });

    it("Should convert data to v4 format when calling API", async() => {
      expect.assertions(2);
      jest.spyOn(entity, 'toV4Dto');

      await resourceCreateService.create(entity);

      expect(entity.toV4Dto).toHaveBeenCalledTimes(1);
      expect(entity.toV4Dto).toHaveBeenCalledWith({
        secrets: true
      });
    });

    it("Should call API with the permission, favorite, tags and folder params", async() => {
      expect.assertions(2);

      jest.spyOn(resourceCreateService.resourceService, 'create');
      const entityV4 = entity.toV4Dto({secrets: true});

      await resourceCreateService.create(entity);

      expect(resourceCreateService.resourceService.create).toHaveBeenCalledTimes(1);
      expect(resourceCreateService.resourceService.create).toHaveBeenCalledWith(
        entityV4,
        {permission: true, favorite: true, tags: true, folder: true}
      );
    });
    it("Should update ResourceLocalStorage with the newest resource", async() => {
      expect.assertions(2);
      jest.spyOn(ResourceLocalStorage, 'addResource');

      const result = await resourceCreateService.create(entity);

      expect(ResourceLocalStorage.addResource).toHaveBeenCalledTimes(1);
      expect(ResourceLocalStorage.addResource).toHaveBeenCalledWith(result);
    });
    it("Should return the entity created", async() => {
      expect.assertions(4);
      jest.spyOn(entity, 'toV4Dto');

      const result = await resourceCreateService.create(entity);

      expect(result.metadata.name).toEqual(entity.metadata.name);
      expect(result.metadata.username).toEqual(entity.metadata.username);
      expect(result.metadata.uris).toEqual(entity.metadata.uris);
      expect(result.metadata.description).toEqual(entity.metadata.description);
    });
  });
  describe("ResourceCreateService::handleCreateInFolder", () => {
    let entity, folder;
    const folderId = uuidv4();
    const shareResourceChanges  = {
      changes: {
        added: [],
        removed: []
      }
    };

    beforeEach(async() => {
      entity = new ResourceEntity(resourceDto);
      folder = defaultFolderDto({id: folderId}, {withPermissions: true});
      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => [defaultResourceDto({folder_parent_id: folderId})]);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => defaultResourceDto({folder_parent_id: folderId}));
      jest.spyOn(FolderService.prototype, "findAllForShare").mockImplementation(() => [folder]);
      jest.spyOn(ShareService.prototype, "simulateShareResource").mockImplementation(() => shareResourceChanges);
      jest.spyOn(ShareService.prototype, "shareFolder").mockImplementation(() => shareResourceChanges);
      jest.spyOn(ShareService.prototype, "shareResource").mockImplementation(() => jest.fn());
    });

    it("Should call progressService step to inform about step", async() => {
      expect.assertions(4);

      jest.spyOn(resourceCreateService.progressService, "finishStep");

      await resourceCreateService.handleCreateInFolder(entity);

      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledTimes(5);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith('Calculate permissions', true);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith('Synchronizing keys', true);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith('Start sharing', true);
    });

    it("Should update goals with the permission change size", async() => {
      expect.assertions(4);

      jest.spyOn(resourceCreateService.resourceModel, "calculatePermissionsChangesForCreate");
      resourceCreateService.progressService.progress = 80;
      await resourceCreateService.handleCreateInFolder(entity);

      expect(resourceCreateService.resourceModel.calculatePermissionsChangesForCreate).toHaveBeenCalledTimes(1);
      expect(resourceCreateService.resourceModel.calculatePermissionsChangesForCreate).toHaveBeenCalledWith(entity, new FolderEntity(folder));
      expect(resourceCreateService.progressService.updateGoals).toHaveBeenCalledTimes(1);
      expect(resourceCreateService.progressService.updateGoals).toHaveBeenCalledWith(88);
    });

    it("Should not call progressService step for sharing in case of non permissions changes", async() => {
      expect.assertions(2);
      jest.spyOn(resourceCreateService.resourceModel, "calculatePermissionsChangesForCreate").mockImplementation(() => []);

      await resourceCreateService.handleCreateInFolder(entity);

      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledTimes(1);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith('Calculate permissions', true);
    });

    it("Should share resources with user targeted", async() => {
      expect.assertions(1);
      jest.spyOn(resourceCreateService.shareModel, "bulkShareResources");

      await resourceCreateService.handleCreateInFolder(entity);

      expect(resourceCreateService.shareModel.bulkShareResources).toHaveBeenCalledTimes(1);
    });

    it("Should update the localstorage from resourceModel", async() => {
      expect.assertions(1);

      jest.spyOn(resourceCreateService.findAndUpdateResourcesLocalStorage, "findAndUpdateAll");

      await resourceCreateService.handleCreateInFolder(entity);

      expect(resourceCreateService.findAndUpdateResourcesLocalStorage.findAndUpdateAll).toHaveBeenCalledTimes(1);
    });

    it("Should sync the keyring", async() => {
      expect.assertions(1);

      await resourceCreateService.handleCreateInFolder(entity);

      expect(resourceCreateService.keyring.sync).toHaveBeenCalled();
    });

    it("Should allow processService as optional", async() => {
      expect.assertions(1);

      resourceCreateService = new ResourceCreateService(account, apiClientOptions);
      resourceCreateService.resourceModel = resourceModelMock();
      resourceCreateService.folderModel = folderModelMock();
      resourceCreateService.shareModel = shareModelMock();

      await resourceCreateService.handleCreateInFolder(entity);

      expect(resourceCreateService.keyring.sync).toHaveBeenCalled();
    });
  });
});
