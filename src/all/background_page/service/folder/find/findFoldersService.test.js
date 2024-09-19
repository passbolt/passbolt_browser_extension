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

import {ApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions";
import FindFoldersService from "./findFoldersService";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import FolderLocalStorage from "../../local_storage/folderLocalStorage";
import FolderService from "../../api/folder/folderService";
import FoldersCollection from "../../../model/entity/folder/foldersCollection";
import {defaultPermissionDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data.js";
import {v4 as uuidv4} from "uuid";
import FolderEntity from "../../../model/entity/folder/folderEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FindFoldersService", () => {
  // mock data
  const apiClientOptions = new ApiClientOptions().setBaseUrl('https://localhost');
  describe("::findAll", () => {
    it("retrieves folders with no contains.", async() => {
      expect.assertions(1);
      const folderDto1 = defaultFolderDto();
      const folderDto2 = defaultFolderDto();
      const foldersDto = [folderDto1, folderDto2];
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => foldersDto);

      const service = new FindFoldersService(apiClientOptions);
      const folders = await service.findAll();

      expect(folders.toDto()).toEqual(foldersDto);
    });

    it("should throw error if contains is not supported.", async() => {
      expect.assertions(1);
      const service = new FindFoldersService(apiClientOptions);
      const promise = service.findAll({unknown: true});
      await expect(promise).rejects.toThrowError("Unsupported contains parameter used, please check supported contains");
    });

    it("should throw error if filter is not supported.", async() => {
      expect.assertions(1);
      const service = new FindFoldersService(apiClientOptions);
      const promise = service.findAll({}, {unknown: true});
      await expect(promise).rejects.toThrowError("Unsupported filters parameter used, please check supported filters");
    });

    it("should throw error if ignoreInvalidEntity option is not a boolean.", async() => {
      expect.assertions(1);
      const service = new FindFoldersService(apiClientOptions);
      const promise = service.findAll({}, {}, {ignoreInvalidEntity: 42});
      await expect(promise).rejects.toThrowError("The given parameter is not a valid boolean");
    });
  });

  describe("::findAllForLocalStorage", () => {
    it("uses the contains required by the local storage.", async() => {
      expect.assertions(3);
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => []);
      jest.spyOn(FindFoldersService.prototype, "findAll");

      const service = new FindFoldersService(apiClientOptions);
      const folders = await service.findAllForLocalStorage();

      expect(service.folderService.findAll).toHaveBeenCalledWith(FolderLocalStorage.DEFAULT_CONTAIN, null);
      expect(service.findAll).toHaveBeenCalledWith(FolderLocalStorage.DEFAULT_CONTAIN, null, {ignoreInvalidEntity: true});
      expect(folders).toBeInstanceOf(FoldersCollection);
    });

    it("should not throw an error if required field is missing with ignore strategy", async() => {
      expect.assertions(2);
      const folderDto1 = defaultFolderDto();
      const folderDto2 = defaultFolderDto();
      const multipleFolders = [folderDto1, folderDto2];
      const foldersCollectionDto = multipleFolders.concat([defaultFolderDto({
        name: null
      })]);
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => foldersCollectionDto);
      const expectedRetainedFolder = [multipleFolders[0], multipleFolders[1]];

      const service = new FindFoldersService(apiClientOptions);
      const collection = await service.findAllForLocalStorage();

      expect(collection).toHaveLength(2);
      expect(collection.toDto(FolderLocalStorage.DEFAULT_CONTAIN)).toEqual(expectedRetainedFolder);
    });
  });

  describe("::findByID", () => {
    it("retrieves folder by id.", async() => {
      expect.assertions(1);
      const folderId = uuidv4();
      const folderDto = defaultFolderDto({id: folderId});
      jest.spyOn(FolderService.prototype, "get").mockImplementation(() => folderDto);

      const service = new FindFoldersService(apiClientOptions);
      const folder = await service.findById(folderDto.id);

      expect(folder.toDto(FolderEntity.ALL_CONTAIN_OPTIONS)).toEqual(folderDto);
    });

    it("should throw an error if id is not a uuid", async() => {
      expect.assertions(1);

      const service = new FindFoldersService(apiClientOptions);
      const promise = service.findById();
      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });

    it("should throw error if contains is not supported.", async() => {
      expect.assertions(1);
      const service = new FindFoldersService(apiClientOptions);
      const promise = service.findById(uuidv4(), {unknown: true});
      await expect(promise).rejects.toThrowError("Unsupported contains parameter used, please check supported contains");
    });
  });

  describe("::findByIdWithPermission", () => {
    it("retrieves folder with permissions contains.", async() => {
      expect.assertions(2);
      const folderId = uuidv4();
      const folderDto = defaultFolderDto({id: folderId, permissions: [
        defaultPermissionDto({aco: "Folder", aco_foreign_key: folderId}, {withUser: true}),
        defaultPermissionDto({aco: "Folder", aco_foreign_key: folderId}, {withGroup: true})
      ]});
      jest.spyOn(FolderService.prototype, "get").mockImplementation(() => folderDto);
      jest.spyOn(FindFoldersService.prototype, "findById");

      const service = new FindFoldersService(apiClientOptions);
      const folder = await service.findByIdWithPermissions(folderDto.id);

      expect(service.findById).toHaveBeenCalledWith(folderDto.id, {'permissions.user.profile': true, 'permissions.group': true});
      expect(folder.toDto(FolderEntity.ALL_CONTAIN_OPTIONS)).toEqual(folderDto);
    });

    it("should throw an error if id is not a uuid", async() => {
      expect.assertions(1);

      const service = new FindFoldersService(apiClientOptions);
      const promise = service.findByIdWithPermissions();
      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });
  });

  describe("::findByIdWithCreatorAndModifier", () => {
    it("retrieves folder with permissions contains.", async() => {
      expect.assertions(2);
      const folderDto = defaultFolderDto({}, {withCreator: true, withModifier: true});
      jest.spyOn(FolderService.prototype, "get").mockImplementation(() => folderDto);
      jest.spyOn(FindFoldersService.prototype, "findById");

      const service = new FindFoldersService(apiClientOptions);
      const folder = await service.findByIdWithCreatorAndModifier(folderDto.id);

      expect(service.findById).toHaveBeenCalledWith(folderDto.id, {creator: true, modifier: true});
      expect(folder.toDto(FolderEntity.ALL_CONTAIN_OPTIONS)).toEqual(folderDto);
    });

    it("should throw an error if id is not a uuid", async() => {
      expect.assertions(1);

      const service = new FindFoldersService(apiClientOptions);
      const promise = service.findByIdWithCreatorAndModifier();
      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });
  });
});
