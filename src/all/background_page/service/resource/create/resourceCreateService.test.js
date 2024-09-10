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
import {defaultResourceDto, defaultResourceV4Dto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from "../../../../../../test/mocks/mockApiResponse";
import {v4 as uuidv4} from "uuid";
import ResourceEntity from "../../../model/entity/resource/resourceEntity";
import EncryptMessageService from "../../crypto/encryptMessageService";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import {folderDto, folderModelMock, resourceModelMock, shareModelMock} from "./resourceCreateService.test.data";
import Keyring from "../../../model/keyring";
import FolderEntity from "../../../model/entity/folder/folderEntity";
import ProgressService from "../../progress/progressService";

jest.mock("../../../service/progress/progressService");

beforeEach(() => {
  enableFetchMocks();
});

describe("ResourceCreateService", () => {
  let resourceCreateService, resourceDto, worker, apiClientOptions;
  const plaintextDto = "secret";
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
    resourceCreateService = new ResourceCreateService(account, apiClientOptions, new ProgressService(worker, ""));
    fetch.doMockOnce(() => mockApiResponse(defaultResourceV4Dto()));
  });

  describe("ResourceCreateService::exec", () => {
    it("Should call progress service during the differents steps of creation", async() => {
      expect.assertions(3);

      await resourceCreateService.exec(resourceDto, plaintextDto, pgpKeys.ada.passphrase);

      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledTimes(2);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith('Creating password', true);
      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledWith("Encrypting secret", true);
    });

    it("Should create the resource with encrypted secrets and dto", async() => {
      expect.assertions(5);

      jest.spyOn(EncryptMessageService, "encrypt");
      jest.spyOn(resourceCreateService.resourceModel, "serializePlaintextDto");
      jest.spyOn(resourceCreateService, "create");

      const entity = new ResourceEntity(resourceDto);

      await resourceCreateService.exec(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      expect(resourceCreateService.create).toHaveBeenCalledTimes(1);
      expect(resourceCreateService.create).toHaveBeenCalledWith(expect.objectContaining(entity));
      expect(EncryptMessageService.encrypt).toHaveBeenCalledTimes(1);
      expect(resourceCreateService.resourceModel.serializePlaintextDto).toHaveBeenCalledTimes(1);
      expect(resourceCreateService.resourceModel.serializePlaintextDto).toHaveBeenCalledWith(entity.resourceTypeId, plaintextDto);
    });


    it("Should create the resource into folder parent", async() => {
      expect.assertions(1);

      jest.spyOn(resourceCreateService, "handleCreateInFolder").mockImplementation(() => jest.fn());
      jest.spyOn(resourceCreateService, "create").mockImplementation(() => defaultResourceDto({
        folderParentId: uuidv4()
      }));

      await resourceCreateService.exec(resourceDto, plaintextDto, pgpKeys.ada.passphrase);

      expect(resourceCreateService.handleCreateInFolder).toHaveBeenCalledTimes(1);
    });
  });
  describe("ResourceCreateService::create", () => {
    let entity;

    beforeEach(async() => {
      entity = new ResourceEntity(resourceDto);
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
      expect(result.metadata.description).toBeNull();
    });
  });

  describe("ResourceCreateService::handleCreateInFolder", () => {
    let entity;

    beforeEach(async() => {
      entity = new ResourceEntity(resourceDto);
      //Mock models
      resourceCreateService.resourceModel = resourceModelMock();
      resourceCreateService.folderModel = folderModelMock();
      resourceCreateService.shareModel = shareModelMock();
    });

    it("Should call progressService step to inform about step", async() => {
      expect.assertions(4);

      await resourceCreateService.handleCreateInFolder(entity);

      expect(resourceCreateService.progressService.finishStep).toHaveBeenCalledTimes(3);
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
      expect(resourceCreateService.resourceModel.calculatePermissionsChangesForCreate).toHaveBeenCalledWith(entity, new FolderEntity(folderDto()));
      expect(resourceCreateService.progressService.updateGoals).toHaveBeenCalledTimes(1);
      expect(resourceCreateService.progressService.updateGoals).toHaveBeenCalledWith(85);
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

      await resourceCreateService.handleCreateInFolder(entity);

      expect(resourceCreateService.resourceModel.updateLocalStorage).toHaveBeenCalledTimes(1);
    });

    it("Should call sync the keyring", async() => {
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
