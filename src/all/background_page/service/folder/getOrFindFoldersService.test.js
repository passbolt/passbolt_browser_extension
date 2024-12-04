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
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {ApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions";
import FolderService from "../api/folder/folderService";
import FindAndUpdateFoldersLocalStorageService from "./findAndUpdateFoldersLocalStorageService";
import GetOrFindFoldersService from "./getOrFindFoldersService";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import FolderLocalStorage from "../local_storage/folderLocalStorage";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import {defaultFoldersCollectionDto} from "passbolt-styleguide/src/shared/models/entity/folder/foldersCollection.test.data";
import {v4 as uuidv4} from "uuid";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("GetOrFindFoldersService", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = new ApiClientOptions().setBaseUrl('https://localhost');

  describe("::getOrFindAll", () => {
    it("retrieves empty folders from the API when the local storage is not initialized", async() => {
      expect.assertions(5);
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => []);
      jest.spyOn(FindAndUpdateFoldersLocalStorageService.prototype, "findAndUpdateAll");

      const service = new GetOrFindFoldersService(account, apiClientOptions);
      const folders = await service.getOrFindAll();

      expect(FindAndUpdateFoldersLocalStorageService.prototype.findAndUpdateAll).toHaveBeenCalledTimes(1);
      expect(folders).toBeInstanceOf(FoldersCollection);
      expect(folders).toHaveLength(0);
      expect(FolderLocalStorage.hasCachedData()).toBeTruthy();
      expect(await FolderLocalStorage.get()).toEqual([]);
    });

    it("retrieves folders from the API when the local storage is not initialized.", async() => {
      expect.assertions(4);
      const foldersDto = [defaultFolderDto(), defaultFolderDto(), defaultFolderDto(), defaultFolderDto()];
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => foldersDto);

      const service = new GetOrFindFoldersService(account, apiClientOptions);
      const folders = await service.getOrFindAll();

      expect(folders).toHaveLength(4);
      expect(folders.toDto(FolderLocalStorage.DEFAULT_CONTAIN)).toEqual(foldersDto);
      expect(FolderLocalStorage.hasCachedData()).toBeTruthy();
      expect(await FolderLocalStorage.get()).toEqual(foldersDto);
    });

    it("retrieves folders from the local storage when the local storage is initialized.", async() => {
      expect.assertions(5);
      const foldersDto = [defaultFolderDto(), defaultFolderDto(), defaultFolderDto(), defaultFolderDto()];
      jest.spyOn(FolderService.prototype, "findAll");
      await FolderLocalStorage.set(new FoldersCollection(foldersDto));

      const service = new GetOrFindFoldersService(account, apiClientOptions);
      const folders = await service.getOrFindAll();

      expect(FolderService.prototype.findAll).not.toHaveBeenCalled();
      expect(folders).toHaveLength(4);
      expect(folders.toDto(FolderLocalStorage.DEFAULT_CONTAIN)).toEqual(foldersDto);
      expect(FolderLocalStorage.hasCachedData()).toBeTruthy();
      expect(await FolderLocalStorage.get()).toEqual(foldersDto);
    });

    it("does not validate the folders collection if the information is retrieved from the runtime cache.", async() => {
      expect.assertions(2);
      jest.spyOn(FolderService.prototype, "findAll");
      jest.spyOn(FoldersCollection.prototype, "validateSchema");
      await FolderLocalStorage.set(new FoldersCollection([]));

      const service = new GetOrFindFoldersService(account, apiClientOptions);
      await service.getOrFindAll();

      expect(FolderService.prototype.findAll).not.toHaveBeenCalled();
      // Validation should be called only once when building the collection mock.
      expect(FoldersCollection.prototype.validateSchema).toHaveBeenCalledTimes(1);
    });

    it("validates folders collection if the local storage has no runtime cache and the information is retrieved from the local storage.", async() => {
      expect.assertions(2);
      jest.spyOn(FolderService.prototype, "findAll");
      jest.spyOn(FoldersCollection.prototype, "validateSchema");
      await FolderLocalStorage.set(new FoldersCollection([]));
      FolderLocalStorage._cachedData = null;

      const service = new GetOrFindFoldersService(account, apiClientOptions);
      await service.getOrFindAll();

      expect(FolderService.prototype.findAll).not.toHaveBeenCalled();
      // Validation should be called twice, once when building the collection mock, and once by the getOrFindAll.
      expect(FoldersCollection.prototype.validateSchema).toHaveBeenCalledTimes(2);
    });
  });

  describe("::getOrFindById", () => {
    it("retrieves a folder from the in a collection given its id", async() => {
      expect.assertions(1);

      const folders = new FoldersCollection(defaultFoldersCollectionDto());
      await FolderLocalStorage.set(folders);

      const service = new GetOrFindFoldersService(account, apiClientOptions);
      const folder = await service.getOrFindById(folders.items[2].id);

      expect(folder).toStrictEqual(folders.items[2]);
    });

    it("returns undefined if nothing is found", async() => {
      expect.assertions(1);

      const folders = new FoldersCollection(defaultFoldersCollectionDto());
      await FolderLocalStorage.set(folders);

      const service = new GetOrFindFoldersService(account, apiClientOptions);
      const folder = await service.getOrFindById(uuidv4());

      expect(folder).toBeUndefined();
    });

    it("should assert its parameter", async() => {
      expect.assertions(1);

      const service = new GetOrFindFoldersService(account, apiClientOptions);
      await expect(() => service.getOrFindById("test")).rejects.toThrow(new Error("The given parameter is not a valid UUID"));
    });
  });
});
