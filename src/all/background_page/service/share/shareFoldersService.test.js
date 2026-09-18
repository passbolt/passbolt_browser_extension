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
import AccountEntity from "../../model/entity/account/accountEntity";
import { adminAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { pgpKeys } from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {
  defaultPermissionDto,
  minimumPermissionDto,
  ownerFolderPermissionDto,
} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import Keyring from "../../model/keyring";
import { v4 as uuidv4 } from "uuid";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import MetadataKeysSessionStorage from "../session_storage/metadataKeysSessionStorage";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";
import ShareFoldersService from "./shareFoldersService";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import { defaultFolderDto } from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";

beforeEach(() => {
  MetadataKeysSessionStorage._runtimeCachedData = {};
  jest.clearAllMocks();
});

describe("ShareResourceService", () => {
  let apiClientOptions, account, mockedProgressService, service;

  beforeEach(() => {
    apiClientOptions = defaultApiClientOptions();
    account = new AccountEntity(adminAccountDto());
    mockedProgressService = { finishStep: jest.fn(), updateGoals: jest.fn(), updateStepMessage: jest.fn() };

    service = new ShareFoldersService(apiClientOptions, account, mockedProgressService);

    // Mock keyring.
    jest.spyOn(Keyring.prototype, "sync").mockImplementation(jest.fn);
    const keyring = new Keyring();
    keyring.importPublic(pgpKeys.ada.public, pgpKeys.ada.userId);
    keyring.importPublic(pgpKeys.betty.public, pgpKeys.betty.userId);
    keyring.importPublic(pgpKeys.carol.public, pgpKeys.carol.userId);
  });

  describe("::shareOne", () => {
    it("shares a folder with no content", async () => {
      expect.assertions(8);
      const folderIdToShare = uuidv4();

      // Permission changes to apply to the share (Modify one, add one and delete one)
      const carolPermissionChange = minimumPermissionDto({
        aco: "Folder",
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: folderIdToShare,
        type: 1,
      });
      const bettyPermissionChange = minimumPermissionDto({
        aco: "Folder",
        aro_foreign_key: pgpKeys.betty.userId,
        aco_foreign_key: folderIdToShare,
        type: 15,
      });
      const adaPermissionChange = defaultPermissionDto({
        aco: "Folder",
        aro_foreign_key: pgpKeys.ada.userId,
        aco_foreign_key: folderIdToShare,
        type: 7,
        delete: true,
      });
      const permissionChanges = new PermissionChangesCollection([
        carolPermissionChange,
        bettyPermissionChange,
        adaPermissionChange,
      ]);

      // Mock local folders retrieval.
      const folderDto = defaultFolderDto({
        id: folderIdToShare,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: folderIdToShare,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      const foldersDto = [folderDto];
      jest
        .spyOn(service.getOrFindFoldersService, "getOrFindAll")
        .mockImplementation(() => new FoldersCollection(foldersDto));
      // Mock local resources retrieval.
      jest
        .spyOn(service.getOrFindResourcesService, "getOrFindAll")
        .mockImplementation(() => new ResourcesCollection([]));
      // Mock folders permissions retrieval.
      const findAllByIdsWithPermissionsFolders = [
        defaultFolderDto({
          ...folderDto,
          permissions: [
            ownerFolderPermissionDto({ aco_foreign_key: folderIdToShare, aro_foreign_key: pgpKeys.admin.userId }),
            ownerFolderPermissionDto({ aco_foreign_key: folderIdToShare, aro_foreign_key: pgpKeys.carol.userId }),
            ownerFolderPermissionDto({ aco_foreign_key: folderIdToShare, aro_foreign_key: pgpKeys.ada.userId }),
          ],
        }),
      ];
      jest
        .spyOn(service.findFoldersService, "findAllByIdsWithPermissions")
        .mockImplementation(() => new FoldersCollection(findAllByIdsWithPermissionsFolders));
      // Mock resources permissions retrieval.
      jest
        .spyOn(service.findResourcesService, "findAllByIdsWithPermissions")
        .mockImplementation(() => new ResourcesCollection([]));
      // Mock the share request.

      let shareRequestData;
      jest.spyOn(service.shareApiService, "shareFolder").mockImplementation((folderId, data) => {
        shareRequestData = data;
        return {};
      });
      // Mock the local storage refresh
      jest.spyOn(service.findAndUpdateFoldersLocalStorageService, "findAndUpdateAll").mockImplementation(jest.fn);

      await service.shareOneWithContent(folderDto.id, permissionChanges, pgpKeys.admin.passphrase);

      // Assert share API call.
      expect(permissionChanges.toDto()).toEqual(
        expect.arrayContaining([
          expect.objectContaining(shareRequestData.permissions[0].toDto()),
          expect.objectContaining(shareRequestData.permissions[1].toDto()),
          expect.objectContaining(shareRequestData.permissions[2].toDto()),
        ]),
      );

      // Assert progress
      expect(mockedProgressService.finishStep).toHaveBeenCalledTimes(6);
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(1, "Retrieving folders permissions", true);
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(2, "Retrieving resources permissions", true);
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(
        3,
        "Calculating folders permissions changes",
        true,
      );
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(
        4,
        "Calculating resources permissions changes",
        true,
      );
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(5, "Sharing folders", true);
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(6, "Updating folders local storage", true);
    });

    it("shares a folder and its sub folder the user has owner right too", async () => {
      expect.assertions(11);
      const folderIdToShare = uuidv4();
      const subFolderIdToShare = uuidv4();

      // Permission changes to apply to the share (add one)
      const carolPermissionChange = minimumPermissionDto({
        aco: "Folder",
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: folderIdToShare,
        type: 1,
      });
      const permissionChanges = new PermissionChangesCollection([carolPermissionChange]);

      // Mock local folders retrieval.
      const folderDto = defaultFolderDto({
        id: folderIdToShare,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: folderIdToShare,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      const subFolderDto = defaultFolderDto({
        id: subFolderIdToShare,
        folder_parent_id: folderIdToShare,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: subFolderIdToShare,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      const foldersDto = [folderDto, subFolderDto];
      jest
        .spyOn(service.getOrFindFoldersService, "getOrFindAll")
        .mockImplementation(() => new FoldersCollection(foldersDto));
      // Mock local resources retrieval.
      jest
        .spyOn(service.getOrFindResourcesService, "getOrFindAll")
        .mockImplementation(() => new ResourcesCollection([]));
      // Mock folders permissions retrieval.
      const findAllByIdsWithPermissionsFolders = [
        defaultFolderDto({ ...folderDto, permissions: [folderDto.permission] }),
        defaultFolderDto({ ...subFolderDto, permissions: [subFolderDto.permission] }),
      ];
      jest
        .spyOn(service.findFoldersService, "findAllByIdsWithPermissions")
        .mockImplementation(() => new FoldersCollection(findAllByIdsWithPermissionsFolders));
      // Mock resources permissions retrieval.
      jest
        .spyOn(service.findResourcesService, "findAllByIdsWithPermissions")
        .mockImplementation(() => new ResourcesCollection([]));
      // Mock the share request.

      let shareRequest1Data, shareRequest2Data;
      jest.spyOn(service.shareApiService, "shareFolder").mockImplementation((folderId, data) => {
        switch (folderId) {
          case folderIdToShare:
            shareRequest1Data = data;
            return {};
          case subFolderIdToShare:
            shareRequest2Data = data;
            return {};
        }
      });
      // Mock the local storage refresh
      jest.spyOn(service.findAndUpdateFoldersLocalStorageService, "findAndUpdateAll").mockImplementation(jest.fn);

      await service.shareOneWithContent(folderDto.id, permissionChanges, pgpKeys.admin.passphrase);

      // Assert share API call.
      expect(shareRequest1Data.permissions).toHaveLength(1);
      expect(shareRequest1Data.permissions[0].toDto()).toEqual(carolPermissionChange);
      expect(shareRequest2Data.permissions).toHaveLength(1);
      expect(shareRequest2Data.permissions[0].toDto()).toEqual({
        ...carolPermissionChange,
        aco_foreign_key: subFolderIdToShare,
      });

      // Assert progress
      expect(mockedProgressService.finishStep).toHaveBeenCalledTimes(6);
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(1, "Retrieving folders permissions", true);
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(2, "Retrieving resources permissions", true);
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(
        3,
        "Calculating folders permissions changes",
        true,
      );
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(
        4,
        "Calculating resources permissions changes",
        true,
      );
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(5, "Sharing folders", true);
      expect(mockedProgressService.finishStep).toHaveBeenNthCalledWith(6, "Updating folders local storage", true);
    });

    it("aligns a sub folder where the recipient already had a diverging permission", async () => {
      expect.assertions(4);
      const folderIdToShare = uuidv4();
      const subFolderIdToShare = uuidv4();

      // Carol is granted READ on the shared folder, while she is already OWNER of the sub folder.
      const carolPermissionChange = minimumPermissionDto({
        aco: "Folder",
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: folderIdToShare,
        type: 1,
      });
      const permissionChanges = new PermissionChangesCollection([carolPermissionChange]);

      const folderDto = defaultFolderDto({
        id: folderIdToShare,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: folderIdToShare,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      const subFolderDto = defaultFolderDto({
        id: subFolderIdToShare,
        folder_parent_id: folderIdToShare,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: subFolderIdToShare,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      const carolSubFolderPermission = ownerFolderPermissionDto({
        aco_foreign_key: subFolderIdToShare,
        aro_foreign_key: pgpKeys.carol.userId,
      });
      jest
        .spyOn(service.getOrFindFoldersService, "getOrFindAll")
        .mockImplementation(() => new FoldersCollection([folderDto, subFolderDto]));
      jest
        .spyOn(service.getOrFindResourcesService, "getOrFindAll")
        .mockImplementation(() => new ResourcesCollection([]));
      jest
        .spyOn(service.findFoldersService, "findAllByIdsWithPermissions")
        .mockImplementation(
          () =>
            new FoldersCollection([
              defaultFolderDto({ ...folderDto, permissions: [folderDto.permission] }),
              defaultFolderDto({ ...subFolderDto, permissions: [subFolderDto.permission, carolSubFolderPermission] }),
            ]),
        );
      jest
        .spyOn(service.findResourcesService, "findAllByIdsWithPermissions")
        .mockImplementation(() => new ResourcesCollection([]));

      let shareRequest2Data;
      jest.spyOn(service.shareApiService, "shareFolder").mockImplementation((folderId, data) => {
        if (folderId === subFolderIdToShare) {
          shareRequest2Data = data;
        }
        return {};
      });
      jest.spyOn(service.findAndUpdateFoldersLocalStorageService, "findAndUpdateAll").mockImplementation(jest.fn);

      await service.shareOneWithContent(folderDto.id, permissionChanges, pgpKeys.admin.passphrase);

      // Carol is owner of the sub folder and drops to the read granted on the parent, she is not left as she is.
      expect(shareRequest2Data.permissions).toHaveLength(1);
      const subFolderChange = shareRequest2Data.permissions[0].toDto();
      expect(subFolderChange.id).toEqual(carolSubFolderPermission.id);
      expect(subFolderChange.aro_foreign_key).toEqual(pgpKeys.carol.userId);
      expect(subFolderChange.type).toEqual(1);
    });

    it("leaves a sub folder the cascade would strip of its last owner untouched, and aligns the rest of the branch", async () => {
      expect.assertions(4);
      const folderIdToShare = uuidv4();
      const subFolderIdSkipped = uuidv4();
      const subFolderIdAligned = uuidv4();
      const groupId = uuidv4();

      // The group is downgraded to READ on the shared folder.
      const groupFolderPermission = ownerFolderPermissionDto({
        aco_foreign_key: folderIdToShare,
        aro: "Group",
        aro_foreign_key: groupId,
      });
      const groupPermissionChange = defaultPermissionDto({
        id: groupFolderPermission.id,
        aco: "Folder",
        aco_foreign_key: folderIdToShare,
        aro: "Group",
        aro_foreign_key: groupId,
        type: 1,
      });
      const permissionChanges = new PermissionChangesCollection([groupPermissionChange]);

      const folderDto = defaultFolderDto({
        id: folderIdToShare,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: folderIdToShare,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      // The group is the only owner of the first sub folder, so lowering it there would leave nobody
      // as owner and it keeps what it has. The branch goes on: the folder below still gets the change.
      const subFolderSkippedDto = defaultFolderDto({
        id: subFolderIdSkipped,
        folder_parent_id: folderIdToShare,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: subFolderIdSkipped,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      const groupSubFolderSkippedPermission = ownerFolderPermissionDto({
        aco_foreign_key: subFolderIdSkipped,
        aro: "Group",
        aro_foreign_key: groupId,
      });
      const subFolderAlignedDto = defaultFolderDto({
        id: subFolderIdAligned,
        folder_parent_id: subFolderIdSkipped,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: subFolderIdAligned,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      const groupSubFolderAlignedPermission = ownerFolderPermissionDto({
        aco_foreign_key: subFolderIdAligned,
        aro: "Group",
        aro_foreign_key: groupId,
      });
      jest
        .spyOn(service.getOrFindFoldersService, "getOrFindAll")
        .mockImplementation(() => new FoldersCollection([folderDto, subFolderSkippedDto, subFolderAlignedDto]));
      jest
        .spyOn(service.getOrFindResourcesService, "getOrFindAll")
        .mockImplementation(() => new ResourcesCollection([]));
      jest.spyOn(service.findFoldersService, "findAllByIdsWithPermissions").mockImplementation(
        () =>
          new FoldersCollection([
            defaultFolderDto({ ...folderDto, permissions: [folderDto.permission, groupFolderPermission] }),
            defaultFolderDto({ ...subFolderSkippedDto, permissions: [groupSubFolderSkippedPermission] }),
            defaultFolderDto({
              ...subFolderAlignedDto,
              permissions: [subFolderAlignedDto.permission, groupSubFolderAlignedPermission],
            }),
          ]),
      );
      jest
        .spyOn(service.findResourcesService, "findAllByIdsWithPermissions")
        .mockImplementation(() => new ResourcesCollection([]));

      const shareRequests = new Map();
      jest.spyOn(service.shareApiService, "shareFolder").mockImplementation((folderId, data) => {
        shareRequests.set(folderId, data);
        return {};
      });
      jest.spyOn(service.findAndUpdateFoldersLocalStorageService, "findAndUpdateAll").mockImplementation(jest.fn);

      await service.shareOneWithContent(folderDto.id, permissionChanges, pgpKeys.admin.passphrase);

      expect([...shareRequests.keys()]).toEqual([folderIdToShare, subFolderIdAligned]);
      const alignedPermissions = shareRequests.get(subFolderIdAligned).permissions;
      expect(alignedPermissions).toHaveLength(1);
      const alignedChange = alignedPermissions[0].toDto();
      expect(alignedChange.aro_foreign_key).toEqual(groupId);
      expect(alignedChange.type).toEqual(1);
    });

    it("stops the cascade at a sub folder the operator does not own", async () => {
      expect.assertions(2);
      const folderIdToShare = uuidv4();
      const notOwnedSubFolderId = uuidv4();
      const nestedFolderId = uuidv4();

      const carolPermissionChange = minimumPermissionDto({
        aco: "Folder",
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: folderIdToShare,
        type: 1,
      });
      const permissionChanges = new PermissionChangesCollection([carolPermissionChange]);

      const folderDto = defaultFolderDto({
        id: folderIdToShare,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: folderIdToShare,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      // The operator only has update here, so the branch stops and the folder it holds is left alone.
      const notOwnedSubFolderDto = defaultFolderDto({
        id: notOwnedSubFolderId,
        folder_parent_id: folderIdToShare,
        permission: defaultPermissionDto({
          aco: "Folder",
          aco_foreign_key: notOwnedSubFolderId,
          aro_foreign_key: pgpKeys.admin.userId,
          type: 7,
        }),
      });
      const nestedFolderDto = defaultFolderDto({
        id: nestedFolderId,
        folder_parent_id: notOwnedSubFolderId,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: nestedFolderId,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      jest
        .spyOn(service.getOrFindFoldersService, "getOrFindAll")
        .mockImplementation(() => new FoldersCollection([folderDto, notOwnedSubFolderDto, nestedFolderDto]));
      jest
        .spyOn(service.getOrFindResourcesService, "getOrFindAll")
        .mockImplementation(() => new ResourcesCollection([]));
      const findAllByIdsWithPermissions = jest
        .spyOn(service.findFoldersService, "findAllByIdsWithPermissions")
        .mockImplementation(
          () => new FoldersCollection([defaultFolderDto({ ...folderDto, permissions: [folderDto.permission] })]),
        );
      jest
        .spyOn(service.findResourcesService, "findAllByIdsWithPermissions")
        .mockImplementation(() => new ResourcesCollection([]));

      const sharedFolderIds = [];
      jest.spyOn(service.shareApiService, "shareFolder").mockImplementation((folderId) => {
        sharedFolderIds.push(folderId);
        return {};
      });
      jest.spyOn(service.findAndUpdateFoldersLocalStorageService, "findAndUpdateAll").mockImplementation(jest.fn);

      await service.shareOneWithContent(folderDto.id, permissionChanges, pgpKeys.admin.passphrase);

      // The owned folder sitting under the not-owned one is never even retrieved.
      expect(findAllByIdsWithPermissions).toHaveBeenCalledWith([folderIdToShare]);
      expect(sharedFolderIds).toEqual([folderIdToShare]);
    });

    it("shares a folder, its sub folder and any resources the users has owner right on", async () => {
      expect.assertions(7);
      const folderIdToShare = uuidv4();
      const subFolderIdToShare = uuidv4();
      const resourceId1ToShare = uuidv4();
      const resourceId2ToShare = uuidv4();

      // Permission changes to apply to the share (add one)
      const carolPermissionChange = minimumPermissionDto({
        aco: "Folder",
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: folderIdToShare,
        type: 1,
      });
      const permissionChanges = new PermissionChangesCollection([carolPermissionChange]);

      // Mock local folders retrieval.
      const folderDto = defaultFolderDto({
        id: folderIdToShare,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: folderIdToShare,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      const subFolderDto = defaultFolderDto({
        id: subFolderIdToShare,
        folder_parent_id: folderIdToShare,
        permission: ownerFolderPermissionDto({
          aco_foreign_key: subFolderIdToShare,
          aro_foreign_key: pgpKeys.admin.userId,
        }),
      });
      const foldersDto = [folderDto, subFolderDto];
      jest
        .spyOn(service.getOrFindFoldersService, "getOrFindAll")
        .mockImplementation(() => new FoldersCollection(foldersDto));
      // Mock local resources retrieval.
      const resource1Dto = defaultResourceDto({
        id: resourceId1ToShare,
        folder_parent_id: folderIdToShare,
      });
      const resource2Dto = defaultResourceDto({
        id: resourceId2ToShare,
        folder_parent_id: subFolderIdToShare,
      });
      jest
        .spyOn(service.getOrFindResourcesService, "getOrFindAll")
        .mockImplementation(() => new ResourcesCollection([resource1Dto, resource2Dto]));
      // Mock folders permissions retrieval.
      const findAllByIdsWithPermissionsFolders = [
        defaultFolderDto({ ...folderDto, permissions: [folderDto.permission] }),
        defaultFolderDto({ ...subFolderDto, permissions: [subFolderDto.permission] }),
      ];
      jest
        .spyOn(service.findFoldersService, "findAllByIdsWithPermissions")
        .mockImplementation(() => new FoldersCollection(findAllByIdsWithPermissionsFolders));
      // Mock resources permissions retrieval.
      const findAllByIdsWithPermissionsResources = [
        defaultResourceDto({ ...resource1Dto, permissions: [resource1Dto.permission] }),
        defaultResourceDto({ ...resource2Dto, permissions: [resource2Dto.permission] }),
      ];
      jest
        .spyOn(service.findResourcesService, "findAllByIdsWithPermissions")
        .mockImplementation(() => new ResourcesCollection(findAllByIdsWithPermissionsResources));
      // Mock the share request.

      let shareFolderRequest1Data, shareFolderRequest2Data;
      jest.spyOn(service.shareApiService, "shareFolder").mockImplementation((folderId, data) => {
        switch (folderId) {
          case folderIdToShare:
            shareFolderRequest1Data = data;
            return {};
          case subFolderIdToShare:
            shareFolderRequest2Data = data;
            return {};
        }
      });
      // Mock the share resources service call

      let shareResourcesCallIds, shareResourcesCallPermissionChanges;
      jest.spyOn(service.shareResourcesService, "shareAll").mockImplementation((ids, permissionChanges) => {
        shareResourcesCallIds = ids;
        shareResourcesCallPermissionChanges = permissionChanges;
      });
      // Mock the local storage refresh
      jest.spyOn(service.findAndUpdateFoldersLocalStorageService, "findAndUpdateAll").mockImplementation(jest.fn);

      await service.shareOneWithContent(folderDto.id, permissionChanges, pgpKeys.admin.passphrase);

      // Assert folders share API call.
      expect(shareFolderRequest1Data.permissions).toHaveLength(1);
      expect(shareFolderRequest1Data.permissions[0].toDto()).toEqual(carolPermissionChange);
      expect(shareFolderRequest2Data.permissions).toHaveLength(1);
      expect(shareFolderRequest2Data.permissions[0].toDto()).toEqual({
        ...carolPermissionChange,
        aco_foreign_key: subFolderIdToShare,
      });

      // Assert share resources service call.
      expect(service.shareResourcesService.shareAll).toHaveBeenCalledTimes(1);
      expect(shareResourcesCallIds).toEqual([resourceId1ToShare, resourceId2ToShare]);
      expect(shareResourcesCallPermissionChanges.toDto()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ...carolPermissionChange, aco: "Resource", aco_foreign_key: resourceId1ToShare }),
          expect.objectContaining({ ...carolPermissionChange, aco: "Resource", aco_foreign_key: resourceId2ToShare }),
        ]),
      );
    });
  });
});
