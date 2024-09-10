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

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../../model/entity/account/accountEntity";
import ResourceUpdateService from "./resourceUpdateService";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuidv4} from "uuid";
import ResourceEntity from "../../../model/entity/resource/resourceEntity";
import EncryptMessageService from "../../crypto/encryptMessageService";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import Keyring from "../../../model/keyring";
import ProgressService from "../../progress/progressService";
import UserModel from "../../../model/user/userModel";
import ResourceService from "../../api/resource/resourceService";

jest.mock("../../../service/progress/progressService");

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("ResourceUpdateService", () => {
  let resourceUpdateService, resourceDto, worker, apiClientOptions;
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
    jest.spyOn(ResourceLocalStorage, "updateResource").mockImplementation(() => jest.fn());
    jest.spyOn(Keyring.prototype, "sync").mockImplementation(() => jest.fn());
    jest.spyOn(Keyring.prototype, "findPublic").mockImplementation(() => ({armoredKey: pgpKeys.ada.public}));
    jest.spyOn(UserModel.prototype, "findAllIdsForResourceUpdate").mockImplementation(() => [uuidv4()]);
    resourceUpdateService = new ResourceUpdateService(account, apiClientOptions, new ProgressService(worker, ""));
    jest.spyOn(ResourceService.prototype, "update").mockImplementation((resourceIdToUpdate, resourceDtoToUpdate) =>
      (new ResourceEntity(resourceDtoToUpdate)).toV4Dto(ResourceEntity.ALL_CONTAIN_OPTIONS));
  });

  describe("ResourceUpdateService::exec", () => {
    it("Should call progress service during the different steps of creation", async() => {
      expect.assertions(7);

      await resourceUpdateService.exec(resourceDto, plaintextDto, pgpKeys.ada.passphrase);

      expect(resourceUpdateService.progressService.updateGoals).toHaveBeenCalledTimes(1);
      expect(resourceUpdateService.progressService.updateGoals).toHaveBeenCalledWith(4);
      expect(resourceUpdateService.progressService.finishStep).toHaveBeenCalledTimes(3);
      expect(resourceUpdateService.progressService.finishStep).toHaveBeenCalledWith('Synchronizing keyring', true);
      expect(resourceUpdateService.progressService.finishStep).toHaveBeenCalledWith('Encrypting', true);
      expect(resourceUpdateService.progressService.finishStep).toHaveBeenCalledWith("Saving resource", true);
      expect(ResourceLocalStorage.updateResource).toHaveBeenCalledTimes(1);
    });

    it("Should Update the resource with encrypted secrets and dto", async() => {
      expect.assertions(5);

      jest.spyOn(EncryptMessageService, "encrypt");
      jest.spyOn(resourceUpdateService.resourceModel, "serializePlaintextDto");
      jest.spyOn(resourceUpdateService, "update");

      const entity = new ResourceEntity(resourceDto);

      await resourceUpdateService.exec(resourceDto, plaintextDto, pgpKeys.ada.passphrase);
      expect(resourceUpdateService.update).toHaveBeenCalledTimes(1);
      expect(resourceUpdateService.update).toHaveBeenCalledWith(expect.objectContaining(entity));
      expect(EncryptMessageService.encrypt).toHaveBeenCalledTimes(1);
      expect(resourceUpdateService.resourceModel.serializePlaintextDto).toHaveBeenCalledTimes(1);
      expect(resourceUpdateService.resourceModel.serializePlaintextDto).toHaveBeenCalledWith(entity.resourceTypeId, plaintextDto);
    });

    it("Should Update the resource without secret", async() => {
      expect.assertions(1);

      const entity = new ResourceEntity(resourceDto);
      jest.spyOn(resourceUpdateService, "update");

      await resourceUpdateService.exec(resourceDto, null, pgpKeys.ada.passphrase);

      expect(resourceUpdateService.update).toHaveBeenCalledWith(entity);
    });
  });

  describe("ResourceUpdateService::update", () => {
    let entity;

    beforeEach(async() => {
      entity = new ResourceEntity(resourceDto);
    });

    it("Should convert data to v4 format when calling API", async() => {
      expect.assertions(2);
      jest.spyOn(entity, 'toV4Dto');

      await resourceUpdateService.update(entity);

      expect(entity.toV4Dto).toHaveBeenCalledTimes(1);
      expect(entity.toV4Dto).toHaveBeenCalledWith({
        secrets: true
      });
    });

    it("Should call API with the permission, favorite, tags and folder params", async() => {
      expect.assertions(2);

      jest.spyOn(resourceUpdateService.resourceService, 'update');
      const entityV4 = entity.toV4Dto({secrets: true});

      await resourceUpdateService.update(entity);

      expect(resourceUpdateService.resourceService.update).toHaveBeenCalledTimes(1);
      expect(resourceUpdateService.resourceService.update).toHaveBeenCalledWith(
        entityV4.id,
        entityV4,
        ResourceLocalStorage.DEFAULT_CONTAIN
      );
    });

    it("Should update ResourceLocalStorage with the newest resource", async() => {
      expect.assertions(1);
      jest.spyOn(ResourceLocalStorage, "updateResource").mockImplementation(() => jest.fn());
      const result = await resourceUpdateService.update(entity);

      expect(ResourceLocalStorage.updateResource).toHaveBeenCalledWith(result);
    });

    it("Should return the entity updated", async() => {
      expect.assertions(4);
      jest.spyOn(entity, 'toV4Dto');

      const result = await resourceUpdateService.update(entity);

      expect(result.metadata.name).toEqual(entity.metadata.name);
      expect(result.metadata.username).toEqual(entity.metadata.username);
      expect(result.metadata.uris).toEqual(entity.metadata.uris);
      expect(result.metadata.description).toEqual(entity.metadata.description);
    });
  });
});
