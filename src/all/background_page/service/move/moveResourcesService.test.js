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
import expect from "expect";
import AccountEntity from "../../model/entity/account/accountEntity";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import MoveResourcesService, {PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL} from "./moveResourcesService";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import {v4 as uuidv4} from 'uuid';
import FolderLocalStorage from "../local_storage/folderLocalStorage";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import FolderEntity from "../../model/entity/folder/folderEntity";
import {
  ownerFolderPermissionDto,
  ownerMinimalPermissionDto,
  ownerPermissionDto,
  readFolderPermissionDto,
  readPermissionDto,
  updateFolderPermissionDto,
  updateMinimalPermissionDto,
  updatePermissionDto
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import ProgressService from "../progress/progressService";
import {
  defaultPermissionsDtos
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionCollection.test.data";
import {PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL} from "../share/shareResourceService";

describe("MoveResourcesService", () => {
  let account, progressService, service, worker;

  beforeEach(() => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    worker = {port: new MockPort()};
    progressService = new ProgressService(worker);
    jest.spyOn(progressService, "finishStep");
    jest.spyOn(progressService, "finishSteps");
    jest.spyOn(progressService, "_updateProgressBar").mockImplementation(jest.fn);
    service = new MoveResourcesService(defaultApiClientOptions(), account, progressService);
  });

  describe("should assert data", () => {
    it("should assert that the resourceIds are not empty", async() => {
      expect.assertions(1);
      await expect(() => service.moveAll([], "")).rejects.toThrow("Could not move, expecting at least a resource to be provided.");
    });

    it("should assert that the resourceIds is all Uuids", async() => {
      expect.assertions(1);
      await expect(() => service.moveAll([uuidv4(), 42], "")).rejects.toThrow("Could not move, expecting resourcesIds to be an array of UUIDs.");
    });

    it("should assert that the destinationFolderId is a valid UUID", async() => {
      expect.assertions(1);
      await expect(() => service.moveAll([uuidv4()], "42")).rejects.toThrow("Could not move, expecting destinationFolderId to be a valid UUID.");
    });

    it("should assert that the passphrase is a valid string", async() => {
      expect.assertions(1);
      await expect(() => service.moveAll([uuidv4()], uuidv4(), 42)).rejects.toThrow("The given parameter is not a valid string");
    });

    it("should assert that the destination folder ID is existing", async() => {
      expect.assertions(3);

      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(() => null);

      const destinationFolderId = uuidv4();
      await expect(() => service.moveAll([uuidv4()], destinationFolderId)).rejects.toThrow(`Could not move, the destination folder does not exist.`);

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderId);
    });

    it("should assert that all the resources ids exist", async() => {
      expect.assertions(3);

      const resourceIds = [uuidv4(), uuidv4()];

      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(() => new FolderEntity(defaultFolderDto()));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(() => new ResourcesCollection([defaultResourceDto({id: resourceIds[0].id})]));

      await expect(() => service.moveAll(resourceIds, uuidv4())).rejects.toThrow(`Could not move, some resources do not exist.`);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith(resourceIds);
    });
  });

  describe("should move the resources according to the specifications", () => {
    it("moves and updates permissions with: owner resources, in owner or update folders, to private folder", async() => {
      expect.assertions(11);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [destinationFolderPerm];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto, destinationFolderDto];

      const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(2);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, destinationFolderDto.id);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, destinationFolderDto.id);
      expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      const expectedResourcesPermissionChanges = new PermissionChangesCollection([
        {...resource1Perms[1], delete: true},
        {...resource2Perms[1], delete: true},
      ]);
      expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, "");
    });

    it("moves and updates permissions with: owner resources, in owner or update folders, to root", async() => {
      expect.assertions(10);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto];

      const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, null, "");

      expect(service.findFoldersService.findByIdWithPermissions).not.toHaveBeenCalled();
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(2);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, null);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, null);
      expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      const expectedResourcesPermissionChanges = new PermissionChangesCollection([
        {...resource1Perms[1], delete: true},
        {...resource2Perms[1], delete: true},
      ]);
      expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, "");
    });

    it("moves and updates permissions with: owner resources, in owner or update folders, to owner folder", async() => {
      expect.assertions(11);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [
        destinationFolderPerm,
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 2})
      ];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});

      const foldersDto = [parentFolder1Dto, parentFolder2Dto, destinationFolderDto];

      const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[2].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[2].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(2);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, destinationFolderDto.id);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, destinationFolderDto.id);
      expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      const expectedResourcesPermissionChanges = new PermissionChangesCollection([
        ownerMinimalPermissionDto({
          aco_foreign_key: resource1Dto.id,
          aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
        }),
        ownerMinimalPermissionDto({
          aco_foreign_key: resource1Dto.id,
          aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
        }),
        ownerMinimalPermissionDto({
          aco_foreign_key: resource1Dto.id,
          aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
        }),
        {...resource1Perms[2], delete: true},
        ownerMinimalPermissionDto({
          aco_foreign_key: resource2Dto.id,
          aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
        }),
        ownerMinimalPermissionDto({
          aco_foreign_key: resource2Dto.id,
          aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
        }),
        ownerMinimalPermissionDto({
          aco_foreign_key: resource2Dto.id,
          aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
        }),
        {...resource2Perms[2], delete: true},
      ]);
      expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, "");
    });

    it("moves and updates permissions with: owner resources, in owner or update folders, to update folder", async() => {
      expect.assertions(11);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [
        destinationFolderPerm,
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 2})
      ];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});

      const foldersDto = [parentFolder1Dto, parentFolder2Dto, destinationFolderDto];

      const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[2].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[2].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(2);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, destinationFolderDto.id);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, destinationFolderDto.id);
      expect(service.shareResourceService.shareAll).toHaveBeenCalledTimes(1);
      const expectedResourcesPermissionChanges = new PermissionChangesCollection([
        updateMinimalPermissionDto({
          aco_foreign_key: resource1Dto.id,
          aro_foreign_key: account.id,
          id: resource1Perm.id
        }),
        ownerMinimalPermissionDto({
          aco_foreign_key: resource1Dto.id,
          aro_foreign_key: destinationFolderPerms[2].aro_foreign_key
        }),
        ownerMinimalPermissionDto({
          aco_foreign_key: resource1Dto.id,
          aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
        }),
        ownerMinimalPermissionDto({
          aco_foreign_key: resource1Dto.id,
          aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
        }),
        {...resource1Perms[2], delete: true},
        /*
         * Permission diverge from parent folder, therefore it is not overridden.
         * updateMinimalPermissionDto({
         *   aco_foreign_key: resource2Dto.id,
         *   aro_foreign_key: account.id,
         *   id: resource2Perm.id
         * }),
         */
        ownerMinimalPermissionDto({
          aco_foreign_key: resource2Dto.id,
          aro_foreign_key: destinationFolderPerms[1].aro_foreign_key
        }),
        ownerMinimalPermissionDto({
          aco_foreign_key: resource2Dto.id,
          aro_foreign_key: destinationFolderPerms[3].aro_foreign_key
        }),
        ownerMinimalPermissionDto({
          aco_foreign_key: resource2Dto.id,
          aro_foreign_key: destinationFolderPerms[4].aro_foreign_key
        }),
        {...resource2Perms[2], delete: true},
      ]);
      expect(service.shareResourceService.shareAll).toHaveBeenCalledWith(resourcesDto.map(resourceDto => resourceDto.id), expectedResourcesPermissionChanges, "");
    });

    it("moves but do not update permissions with: update resources, in owner or update folders, to private folder", async() => {
      expect.assertions(10);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [destinationFolderPerm];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto, destinationFolderDto];

      const resource1Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(2);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, destinationFolderDto.id);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, destinationFolderDto.id);
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("moves but do not update permissions with: update resources, in owner or update folders, root", async() => {
      expect.assertions(9);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto];

      const resource1Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, null, "");

      expect(service.findFoldersService.findByIdWithPermissions).not.toHaveBeenCalled();
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(2);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, null);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, null);
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("moves but do not update permissions with: update resources, in owner or update folders, owner folder", async() => {
      expect.assertions(10);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [
        destinationFolderPerm,
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 2})
      ];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto, destinationFolderDto];

      const resource1Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(2);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, destinationFolderDto.id);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, destinationFolderDto.id);
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("moves but do not update permissions with: update resources, in owner or update folders, update folder", async() => {
      expect.assertions(10);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [
        destinationFolderPerm,
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 2})
      ];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto, destinationFolderDto];

      const resource1Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(2);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, destinationFolderDto.id);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, destinationFolderDto.id);
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("do not move and do not update permissions with: read resources, in owner or update folders, to private folder", async() => {
      expect.assertions(8);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [destinationFolderPerm];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto, destinationFolderDto];

      const resource1Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).not.toHaveBeenCalled();
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("do not move and do not update permissions with: read resources, in owner or update folders, root", async() => {
      expect.assertions(7);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto];

      const resource1Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, null, "");

      expect(service.findFoldersService.findByIdWithPermissions).not.toHaveBeenCalled();
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).not.toHaveBeenCalled();
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("do not move and do not update permissions with: read resources, in owner or update folders, owner folder", async() => {
      expect.assertions(8);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [
        destinationFolderPerm,
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 2})
      ];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto, destinationFolderDto];

      const resource1Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).not.toHaveBeenCalled();
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("do not move and do not update permissions with: read resources, in owner or update folders, update folder", async() => {
      expect.assertions(8);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [
        destinationFolderPerm,
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 2})
      ];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto, destinationFolderDto];

      const resource1Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource2Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ownerPermissionDto({
          aco_foreign_key: resource2Perm.aco_foreign_key,
          aro_foreign_key: parentFolder2Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id]);
      expect(service.moveApiService.moveResource).not.toHaveBeenCalled();
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    // Move service moves and updates permissions, but it is not accepted by the Read and the API.
    it.skip("do not move and do not update permissions with: owner or update or read resources, in read folder, to private folder", async() => {
      expect.assertions(11);

      const parentFolder1Perm = readFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder2Perm = readFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [
        parentFolder2Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder2Perm.aco_foreign_key}, {count: 2})
      ];
      const parentFolder3Perm = readFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder3Perms = [
        parentFolder3Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder3Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [destinationFolderPerm];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const parentFolder2Dto = defaultFolderDto({id: parentFolder2Perm.aco_foreign_key, permission: parentFolder2Perm, permissions: parentFolder2Perms});
      const parentFolder3Dto = defaultFolderDto({id: parentFolder3Perm.aco_foreign_key, permission: parentFolder3Perm, permissions: parentFolder3Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [parentFolder1Dto, parentFolder2Dto, parentFolder3Dto, destinationFolderDto];

      const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];
      const resource2Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];
      const resource3Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource3Perms = [
        resource3Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource3Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });

      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resource3Dto = defaultResourceDto({
        id: resource3Perm.aco_foreign_key,
        folder_parent_id: parentFolder3Dto.id,
        permission: resource3Perm,
        permissions: resource3Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto, resource3Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id, resource3Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id, parentFolder3Dto.id]);
      expect(service.moveApiService.moveResource).not.toHaveBeenCalled();
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("moves and do not update permissions: owner or update or read resources, in root, to private folder", async() => {
      expect.assertions(10);
      const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [destinationFolderPerm];

      const destinationFolderDto = defaultFolderDto({
        id: destinationFolderPerm.aco_foreign_key,
        personal: true,
        permission: destinationFolderPerm,
        permissions: destinationFolderPerms
      });
      const foldersDto = [destinationFolderDto];

      const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];
      const resource2Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];
      const resource3Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource3Perms = [
        resource3Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource3Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resource3Dto = defaultResourceDto({
        id: resource3Perm.aco_foreign_key,
        permission: resource3Perm,
        permissions: resource3Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto, resource3Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id, resource3Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).not.toHaveBeenCalled();
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(3);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, destinationFolderDto.id);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, destinationFolderDto.id);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource3Dto.id, destinationFolderDto.id);
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("moves and do not update permissions: owner or update or read resources, in private folder, to private folder", async() => {
      expect.assertions(11);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [parentFolder1Perm];
      const parentFolder2Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [parentFolder2Perm];
      const parentFolder3Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder3Perms = [parentFolder3Perm];
      const destinationFolderPerm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [destinationFolderPerm];

      const parentFolder1Dto = defaultFolderDto({
        id: parentFolder1Perm.aco_foreign_key,
        personal: true,
        permission: parentFolder1Perm,
        permissions: parentFolder1Perms
      });
      const parentFolder2Dto = defaultFolderDto({
        id: parentFolder2Perm.aco_foreign_key,
        personal: true,
        permission: parentFolder2Perm,
        permissions: parentFolder2Perms
      });
      const parentFolder3Dto = defaultFolderDto({
        id: parentFolder3Perm.aco_foreign_key,
        personal: true,
        permission: parentFolder3Perm,
        permissions: parentFolder3Perms
      });
      const destinationFolderDto = defaultFolderDto({
        id: destinationFolderPerm.aco_foreign_key,
        personal: true,
        permission: destinationFolderPerm,
        permissions: destinationFolderPerms
      });
      const foldersDto = [parentFolder1Dto, parentFolder2Dto, parentFolder3Dto, destinationFolderDto];

      const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];
      const resource2Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];
      const resource3Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource3Perms = [
        resource3Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource3Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resource3Dto = defaultResourceDto({
        id: resource3Perm.aco_foreign_key,
        folder_parent_id: parentFolder3Dto.id,
        permission: resource3Perm,
        permissions: resource3Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto, resource3Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id, resource3Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id, parentFolder3Dto.id]);
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(3);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, destinationFolderDto.id);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, destinationFolderDto.id);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource3Dto.id, destinationFolderDto.id);
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("moves and do not update permissions: owner or update or read resources, in private folder, to root", async() => {
      expect.assertions(10);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [parentFolder1Perm];
      const parentFolder2Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder2Perms = [parentFolder2Perm];
      const parentFolder3Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder3Perms = [parentFolder3Perm];

      const parentFolder1Dto = defaultFolderDto({
        id: parentFolder1Perm.aco_foreign_key,
        personal: true,
        permission: parentFolder1Perm,
        permissions: parentFolder1Perms
      });
      const parentFolder2Dto = defaultFolderDto({
        id: parentFolder2Perm.aco_foreign_key,
        personal: true,
        permission: parentFolder2Perm,
        permissions: parentFolder2Perms
      });
      const parentFolder3Dto = defaultFolderDto({
        id: parentFolder3Perm.aco_foreign_key,
        personal: true,
        permission: parentFolder3Perm,
        permissions: parentFolder3Perms
      });
      const foldersDto = [parentFolder1Dto, parentFolder2Dto, parentFolder3Dto];

      const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];
      const resource2Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource2Perms = [
        resource2Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource2Perm.aco_foreign_key}, {count: 2})
      ];
      const resource3Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource3Perms = [
        resource3Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource3Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resource2Dto = defaultResourceDto({
        id: resource2Perm.aco_foreign_key,
        folder_parent_id: parentFolder2Dto.id,
        permission: resource2Perm,
        permissions: resource2Perms,
      });
      const resource3Dto = defaultResourceDto({
        id: resource3Perm.aco_foreign_key,
        folder_parent_id: parentFolder3Dto.id,
        permission: resource3Perm,
        permissions: resource3Perms,
      });
      const resourcesDto = [resource1Dto, resource2Dto, resource3Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, null, "");

      expect(service.findFoldersService.findByIdWithPermissions).not.toHaveBeenCalled();
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id, resource2Dto.id, resource3Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([parentFolder1Dto.id, parentFolder2Dto.id, parentFolder3Dto.id]);
      expect(service.moveApiService.moveResource).toHaveBeenCalledTimes(3);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource1Dto.id, null);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource2Dto.id, null);
      expect(service.moveApiService.moveResource).toHaveBeenCalledWith(resource3Dto.id, null);
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });

    it("do not move and do not update permissions with: resources already in the target folder", async() => {
      expect.assertions(8);

      const destinationFolderPerm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [
        destinationFolderPerm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 2})
      ];

      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [destinationFolderDto];

      const resource1Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: destinationFolderDto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resourcesDto = [resource1Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findByIdWithPermissions).toHaveBeenCalledWith(destinationFolderDto.id);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findResourcesService.findAllByIdsWithPermissions).toHaveBeenCalledWith([resource1Dto.id]);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledTimes(1);
      expect(service.findFoldersService.findAllByIdsWithPermissions).toHaveBeenCalledWith([destinationFolderDto.id]);
      expect(service.moveApiService.moveResource).not.toHaveBeenCalled();
      expect(service.shareResourceService.shareAll).not.toHaveBeenCalled();
    });
  });

  describe("notifies about its progress", () => {
    it("notifies of its progress when there is nothing to move (by instance when resources already in the destination folder).", async() => {
      expect.assertions(6);

      const destinationFolderPerm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [
        destinationFolderPerm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 2})
      ];

      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [destinationFolderDto];

      const resource1Perm = readPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: destinationFolderDto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resourcesDto = [resource1Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(progressService.finishStep).toHaveBeenCalledTimes(4);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(1, "Retrieving destination folder permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Retrieving resources permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Retrieving all resources parent folders permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(4, "Calculating resources permissions changes", true);
      expect(progressService._progress).toEqual(PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL);
    });

    it("notifies of its progress when there are resources to move but not to share.", async() => {
      expect.assertions(7);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];
      const destinationFolderPerm = updateFolderPermissionDto({aro_foreign_key: account.id});
      const destinationFolderPerms = [
        destinationFolderPerm,
        ownerFolderPermissionDto({
          aco_foreign_key: destinationFolderPerm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: destinationFolderPerm.aco_foreign_key}, {count: 2})
      ];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const destinationFolderDto = defaultFolderDto({id: destinationFolderPerm.aco_foreign_key, permission: destinationFolderPerm, permissions: destinationFolderPerms});
      const foldersDto = [parentFolder1Dto, destinationFolderDto];

      const resource1Perm = updatePermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resourcesDto = [resource1Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, destinationFolderDto.id, "");

      expect(progressService.finishStep).toHaveBeenCalledTimes(5);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(1, "Retrieving destination folder permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Retrieving resources permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Retrieving all resources parent folders permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(4, "Calculating resources permissions changes", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(5, "Moving resources", true);
      expect(progressService._progress).toEqual(PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL);
    });

    it("notifies of its progress when there are resources to move and to share.", async() => {
      expect.assertions(7);

      const parentFolder1Perm = ownerFolderPermissionDto({aro_foreign_key: account.id});
      const parentFolder1Perms = [
        parentFolder1Perm,
        ...defaultPermissionsDtos({aco: 'Folder', aco_foreign_key: parentFolder1Perm.aco_foreign_key}, {count: 2})
      ];

      const parentFolder1Dto = defaultFolderDto({id: parentFolder1Perm.aco_foreign_key, permission: parentFolder1Perm, permissions: parentFolder1Perms});
      const foldersDto = [parentFolder1Dto];

      const resource1Perm = ownerPermissionDto({aro_foreign_key: account.id});
      const resource1Perms = [
        resource1Perm,
        ownerPermissionDto({
          aco_foreign_key: resource1Perm.aco_foreign_key,
          aro_foreign_key: parentFolder1Perms[1].aro_foreign_key
        }),
        ...defaultPermissionsDtos({aco_foreign_key: resource1Perm.aco_foreign_key}, {count: 2})
      ];

      const resource1Dto = defaultResourceDto({
        id: resource1Perm.aco_foreign_key,
        folder_parent_id: parentFolder1Dto.id,
        permission: resource1Perm,
        permissions: resource1Perms,
      });
      const resourcesDto = [resource1Dto];

      await FolderLocalStorage.set(new FoldersCollection(foldersDto));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(ids => new FoldersCollection(foldersDto.filter(folderDto => ids.includes(folderDto.id))));
      jest.spyOn(service.findFoldersService, "findByIdWithPermissions").mockImplementation(id => new FolderEntity(foldersDto.find(folderDto => folderDto.id === id)));
      jest.spyOn(service.findResourcesService, "findAllByIdsWithPermissions").mockImplementation(ids => new ResourcesCollection(resourcesDto.filter(resourceDto => ids.includes(resourceDto.id))));
      await ResourceLocalStorage.set(new ResourcesCollection(resourcesDto));
      jest.spyOn(service.shareResourceService, "shareAll").mockImplementation(jest.fn);
      jest.spyOn(service.moveApiService, "moveResource").mockImplementation(jest.fn);

      const resourcesIds = resourcesDto.map(dto => dto.id);
      await service.moveAll(resourcesIds, null, "");

      expect(progressService.finishStep).toHaveBeenCalledTimes(5);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(1, "Retrieving destination folder permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(2, "Retrieving resources permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(3, "Retrieving all resources parent folders permissions", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(4, "Calculating resources permissions changes", true);
      expect(progressService.finishStep).toHaveBeenNthCalledWith(5, "Moving resources", true);
      expect(progressService._progress).toEqual(PROGRESS_STEPS_MOVE_RESOURCES_MOVE_ALL - PROGRESS_STEPS_SHARE_RESOURCES_SHARE_ALL);
    });
  });
});
