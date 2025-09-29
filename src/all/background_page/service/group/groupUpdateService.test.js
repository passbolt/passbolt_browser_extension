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
 * @since         4.10.1
 */
import GroupUpdateService from "./groupUpdateService";
import GroupEntity from "../../model/entity/group/groupEntity";
import GroupUpdateEntity from "../../model/entity/group/update/groupUpdateEntity";
import GroupUpdateDryRunResultEntity from "../../model/entity/group/update/groupUpdateDryRunResultEntity";
import EncryptMessageService from "../crypto/encryptMessageService";
import AccountEntity from "../../model/entity/account/accountEntity";
import Keyring from "../../model/keyring";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultGroupDto} from "passbolt-styleguide/src/shared/models/entity/group/groupEntity.test.data";
import {createGroupUser} from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity.test.data";
import {defaultResourcesSecretsDtos} from "../../model/entity/secret/groupUpdate/groupUpdateSecretsCollection.test.data";
import DecryptMessageService from "../crypto/decryptMessageService";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import GroupUserEntity from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity";
import {plaintextSecretPasswordAndDescriptionDto} from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import GroupLocalStorage from "../local_storage/groupLocalStorage";

beforeEach(() => {
  jest.resetAllMocks();
});

describe("GroupUpdateService", () => {
  it("should update the group without cryptographic operations if only the name changed", async() => {
    expect.assertions(12);

    const apiClientOptions = defaultApiClientOptions();
    const account = new AccountEntity(defaultAccountDto());
    const progressService = {
      start: jest.fn(),
      finishStep: jest.fn(),
      close: jest.fn(),
      goals: 10,
      updateGoals: jest.fn(),
    };

    const existingEntityDto = defaultGroupDto({
      name: "old name",
    }, {withGroupsUsers: true});

    const updateGroupEntity = new GroupEntity(defaultGroupDto({
      ...existingEntityDto,
      name: "New name",
    }));

    const mixGroupUpdateDto = {
      ...existingEntityDto,
      name: updateGroupEntity.name,
      groups_users: [],
    };

    const groupUpdateDryRunResultDto = {needed_secrets: [], secrets: []};

    const diffGroupUpdateEntity = new GroupUpdateEntity(mixGroupUpdateDto);

    const service = new GroupUpdateService(apiClientOptions, account, progressService);

    const spyOnGroupModelGetById = jest.spyOn(service.groupModel, "getById");
    const spyOnGroupModelDryRun = jest.spyOn(service.groupModel, "updateDryRun");
    const spyOnGroupServiceUpdate = jest.spyOn(service.groupService, "update");

    spyOnGroupModelGetById.mockImplementation(async() => new GroupEntity(existingEntityDto));
    spyOnGroupModelDryRun.mockImplementation(async() => new GroupUpdateDryRunResultEntity(groupUpdateDryRunResultDto));
    spyOnGroupServiceUpdate.mockImplementation(async(_, groupDto) => groupDto);
    jest.spyOn(GroupLocalStorage, "updateGroup").mockImplementation(() => {});

    await service.exec(updateGroupEntity, "");

    expect(spyOnGroupModelGetById).toHaveBeenCalledTimes(1);
    expect(spyOnGroupModelGetById).toHaveBeenCalledWith(updateGroupEntity.id);

    expect(spyOnGroupModelDryRun).toHaveBeenCalledTimes(1);
    expect(spyOnGroupModelDryRun).toHaveBeenCalledWith(diffGroupUpdateEntity);

    expect(spyOnGroupServiceUpdate).toHaveBeenCalledTimes(1);
    const expectedDiffGropuUpdateEntityDto = diffGroupUpdateEntity.toDto();
    delete expectedDiffGropuUpdateEntityDto.groups_users;
    expect(spyOnGroupServiceUpdate).toHaveBeenCalledWith(diffGroupUpdateEntity.id, expectedDiffGropuUpdateEntityDto);

    //Exepctation for the progressSerivce when there is no crypto involved
    expect(progressService.start).toHaveBeenCalledTimes(1);
    expect(progressService.start).toHaveBeenCalledWith(10, "Initialize");
    expect(progressService.updateGoals).toHaveBeenCalledWith(10);
    expect(progressService.finishStep).toHaveBeenCalledTimes(4);
    expect(progressService.finishStep).toHaveBeenCalledWith(null, true);
    expect(progressService.finishStep).toHaveBeenCalledWith("Updating group", true);
  });

  it("should update the group without cryptographic operations if only the permission changed", async() => {
    expect.assertions(7);

    const apiClientOptions = defaultApiClientOptions();
    const account = new AccountEntity(defaultAccountDto());
    const progressService = {
      start: jest.fn(),
      finishStep: jest.fn(),
      close: jest.fn(),
      goals: 10,
      updateGoals: jest.fn(),
    };

    const existingEntityDto = defaultGroupDto({
      name: "old name",
    }, {withGroupsUsers: 2});

    const updateGroupEntity = new GroupEntity(defaultGroupDto({
      ...existingEntityDto,
      groups_users: [
        {...existingEntityDto.groups_users[0]},
        {...existingEntityDto.groups_users[1]},
      ]
    }));

    const updatedUser = updateGroupEntity._groups_users._items[1];
    updatedUser._props.is_admin = false;

    const mixGroupUpdateDto = {
      ...existingEntityDto,
      groups_users: [{
        id: updatedUser.id,
        is_admin: updatedUser._props.is_admin,
      }],
    };

    const groupUpdateDryRunResultDto = {needed_secrets: [], secrets: []};

    const diffGroupUpdateEntity = new GroupUpdateEntity(mixGroupUpdateDto);

    const service = new GroupUpdateService(apiClientOptions, account, progressService);

    const spyOnGroupModelGetById = jest.spyOn(service.groupModel, "getById");
    const spyOnGroupModelDryRun = jest.spyOn(service.groupModel, "updateDryRun");
    const spyOnGroupServiceUpdate = jest.spyOn(service.groupService, "update");
    jest.spyOn(GroupLocalStorage, "updateGroup").mockImplementation(() => {});

    spyOnGroupModelGetById.mockImplementation(async() => new GroupEntity(existingEntityDto));
    spyOnGroupModelDryRun.mockImplementation(async() => new GroupUpdateDryRunResultEntity(groupUpdateDryRunResultDto));
    spyOnGroupServiceUpdate.mockImplementation(async(_, groupDto) => groupDto);

    await service.exec(updateGroupEntity, "");

    expect(spyOnGroupModelGetById).toHaveBeenCalledTimes(1);
    expect(spyOnGroupModelGetById).toHaveBeenCalledWith(updateGroupEntity.id);

    expect(spyOnGroupModelDryRun).toHaveBeenCalledTimes(1);
    expect(spyOnGroupModelDryRun).toHaveBeenCalledWith(diffGroupUpdateEntity);

    expect(spyOnGroupServiceUpdate).toHaveBeenCalledTimes(2);
    const expectedDiffGropuUpdateEntityDto1 = diffGroupUpdateEntity.toDto();
    delete expectedDiffGropuUpdateEntityDto1.groups_users;

    const expectedDiffGropuUpdateEntityDto2 = diffGroupUpdateEntity.toDto();

    expect(spyOnGroupServiceUpdate).toHaveBeenCalledWith(diffGroupUpdateEntity.id, expectedDiffGropuUpdateEntityDto1);
    expect(spyOnGroupServiceUpdate).toHaveBeenCalledWith(diffGroupUpdateEntity.id, expectedDiffGropuUpdateEntityDto2);
  });

  it("should update the group without cryptographic operations if users have only been removed", async() => {
    expect.assertions(7);

    const apiClientOptions = defaultApiClientOptions();
    const account = new AccountEntity(defaultAccountDto());
    const progressService = {
      start: jest.fn(),
      finishStep: jest.fn(),
      close: jest.fn(),
      goals: 10,
      updateGoals: jest.fn(),
    };

    const existingEntityDto = defaultGroupDto({
      name: "old name",
    }, {withGroupsUsers: 2});

    const updateGroupEntity = new GroupEntity(defaultGroupDto({
      ...existingEntityDto,
      groups_users: [
        {...existingEntityDto.groups_users[0]},
      ]
    }));

    const deletedUser = existingEntityDto.groups_users[1];

    const mixGroupUpdateDto = {
      ...existingEntityDto,
      groups_users: [{
        id: deletedUser.id,
        delete: true,
      }],
    };

    const groupUpdateDryRunResultDto = {needed_secrets: [], secrets: []};

    const diffGroupUpdateEntity = new GroupUpdateEntity(mixGroupUpdateDto);

    const service = new GroupUpdateService(apiClientOptions, account, progressService);

    const spyOnGroupModelGetById = jest.spyOn(service.groupModel, "getById");
    const spyOnGroupModelDryRun = jest.spyOn(service.groupModel, "updateDryRun");
    const spyOnGroupServiceUpdate = jest.spyOn(service.groupService, "update");
    jest.spyOn(GroupLocalStorage, "updateGroup").mockImplementation(() => {});

    spyOnGroupModelGetById.mockImplementation(async() => new GroupEntity(existingEntityDto));
    spyOnGroupModelDryRun.mockImplementation(async() => new GroupUpdateDryRunResultEntity(groupUpdateDryRunResultDto));
    spyOnGroupServiceUpdate.mockImplementation(async(_, groupDto) => groupDto);

    await service.exec(updateGroupEntity, "");

    expect(spyOnGroupModelGetById).toHaveBeenCalledTimes(1);
    expect(spyOnGroupModelGetById).toHaveBeenCalledWith(updateGroupEntity.id);

    expect(spyOnGroupModelDryRun).toHaveBeenCalledTimes(1);
    expect(spyOnGroupModelDryRun).toHaveBeenCalledWith(diffGroupUpdateEntity);

    expect(spyOnGroupServiceUpdate).toHaveBeenCalledTimes(2);
    const expectedDiffGropuUpdateEntityDto1 = diffGroupUpdateEntity.toDto();
    delete expectedDiffGropuUpdateEntityDto1.groups_users;

    const expectedDiffGropuUpdateEntityDto2 = diffGroupUpdateEntity.toDto();

    expect(spyOnGroupServiceUpdate).toHaveBeenCalledWith(diffGroupUpdateEntity.id, expectedDiffGropuUpdateEntityDto1);
    expect(spyOnGroupServiceUpdate).toHaveBeenCalledWith(diffGroupUpdateEntity.id, expectedDiffGropuUpdateEntityDto2);
  });

  it("should update the group and encrypt secrets for the new users", async() => {
    expect.assertions(26);

    const apiClientOptions = defaultApiClientOptions();
    const account = new AccountEntity(defaultAccountDto());
    const progressService = {
      start: jest.fn(),
      finishStep: jest.fn(),
      close: jest.fn(),
      goals: 10,
      updateGoals: jest.fn(),
    };

    const existingEntityDto = defaultGroupDto({}, {withGroupsUsers: 1});
    const updateGroupEntity = new GroupEntity({...existingEntityDto});

    const newUser = new GroupUserEntity(createGroupUser({group_id: existingEntityDto.id}));
    updateGroupEntity._groups_users._items = [...updateGroupEntity._groups_users.items, newUser];

    const mixGroupUpdateDto = {
      ...existingEntityDto,
      groups_users: [{
        user_id: newUser._props.user_id,
        is_admin: newUser._props.is_admin,
      }],
    };

    const secrets = defaultResourcesSecretsDtos(1);

    const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
    const originalDecryptedSecret = plaintextSecretPasswordAndDescriptionDto();
    secrets[0].data = await EncryptMessageService.encrypt(JSON.stringify(originalDecryptedSecret), adaPublicKey);
    const needed_secrets = [{
      user_id: newUser._props.user_id,
      resource_id: secrets[0].resource_id,
    }];
    const groupUpdateDryRunResultDto = {needed_secrets, secrets};
    const diffGroupUpdateEntity = new GroupUpdateEntity(mixGroupUpdateDto);

    const service = new GroupUpdateService(apiClientOptions, account, progressService);

    const spyOnGroupModelGetById = jest.spyOn(service.groupModel, "getById");
    const spyOnGroupModelDryRun = jest.spyOn(service.groupModel, "updateDryRun");
    const spyOnGroupServiceUpdate = jest.spyOn(service.groupService, "update");
    const spyOnKeyringSync = jest.spyOn(Keyring.prototype, "sync");
    const spyOnKeyringFindPublic = jest.spyOn(Keyring.prototype, "findPublic");
    jest.spyOn(GroupLocalStorage, "updateGroup").mockImplementation(() => {});

    spyOnGroupModelGetById.mockImplementation(async() => new GroupEntity(existingEntityDto));
    spyOnKeyringSync.mockImplementation(async() => {});
    spyOnKeyringFindPublic.mockImplementation(() => ({armoredKey: pgpKeys.betty.public}));

    spyOnGroupServiceUpdate.mockImplementation(async(groupUpdateId, groupUpdateDto) => {
      if (!groupUpdateDto.groups_users) {
        //it's the first step and  a group name update only operation
        expect(groupUpdateDto.id).toStrictEqual(diffGroupUpdateEntity.id);
        expect(groupUpdateDto.name).toStrictEqual(diffGroupUpdateEntity.name);
        return groupUpdateDto; // ignoring first step
      }

      expect(groupUpdateId).toStrictEqual(diffGroupUpdateEntity.id);
      expect(groupUpdateDto.id).toStrictEqual(diffGroupUpdateEntity.id);
      expect(groupUpdateDto.name).toStrictEqual(diffGroupUpdateEntity.name);
      expect(groupUpdateDto.groups_users).toStrictEqual(diffGroupUpdateEntity.groupsUsers.toDto());
      expect(groupUpdateDto.secrets).toHaveLength(1);

      const secret = groupUpdateDto.secrets[0];
      expect(secret.resource_id).toStrictEqual(secrets[0].resource_id);
      expect(secret.user_id).toStrictEqual(newUser._props.user_id);

      const decryptedData = await DecryptMessageService.decrypt(await OpenpgpAssertion.readMessageOrFail(secret.data), await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted));
      expect(JSON.parse(decryptedData)).toStrictEqual(originalDecryptedSecret);

      return groupUpdateDto;
    });

    spyOnGroupModelDryRun.mockImplementation(async groupUpdateEntity => {
      expect(groupUpdateEntity).toStrictEqual(diffGroupUpdateEntity);
      return new GroupUpdateDryRunResultEntity(groupUpdateDryRunResultDto);
    });

    await service.exec(updateGroupEntity, "ada@passbolt.com");

    expect(spyOnKeyringSync).toHaveBeenCalledTimes(1);
    expect(spyOnKeyringFindPublic).toHaveBeenCalledWith(newUser._props.user_id);

    expect(spyOnGroupModelGetById).toHaveBeenCalledTimes(1);
    expect(spyOnGroupModelGetById).toHaveBeenCalledWith(updateGroupEntity.id);

    expect(spyOnGroupModelDryRun).toHaveBeenCalledTimes(1);

    expect(spyOnGroupServiceUpdate).toHaveBeenCalledTimes(2);

    //Exepctation for the progressSerivce when there is no crypto involved
    expect(progressService.start).toHaveBeenCalledTimes(1);
    expect(progressService.start).toHaveBeenCalledWith(10, "Initialize");
    expect(progressService.updateGoals).toHaveBeenCalledWith(12);

    expect(progressService.finishStep).toHaveBeenCalledTimes(7);
    expect(progressService.finishStep).toHaveBeenCalledWith(null, true);
    expect(progressService.finishStep).toHaveBeenCalledWith('Synchronizing keyring', true);
    expect(progressService.finishStep).toHaveBeenCalledWith("Updating group", true);
    expect(progressService.finishStep).toHaveBeenCalledWith('Decrypting 1/1');
    expect(progressService.finishStep).toHaveBeenCalledWith('Encrypting 1/1');
  });

  it("should throw an error if the given dto is not valid as a GroupEntity", async() => {
    expect.assertions(1);

    const apiClientOptions = defaultApiClientOptions();
    const account = new AccountEntity(defaultAccountDto());
    const progressService = {};

    const service = new GroupUpdateService(apiClientOptions, account, progressService);
    await expect(() => service.exec([], "")).rejects.toThrow(new EntityValidationError("The given data is not of the expected type"));
  });

  it("should throw an error if the given dto is not valid as a GroupEntity", async() => {
    expect.assertions(1);

    const apiClientOptions = defaultApiClientOptions();
    const account = new AccountEntity(defaultAccountDto());
    const progressService = {};

    const existingEntityDto = defaultGroupDto({}, {withGroupsUsers: 1});
    const groupUpdateEntity = new GroupEntity({...existingEntityDto});

    const service = new GroupUpdateService(apiClientOptions, account, progressService);
    await expect(() => service.exec(groupUpdateEntity, 42)).rejects.toThrow(new EntityValidationError("The given parameter is not a valid string"));
  });
});
