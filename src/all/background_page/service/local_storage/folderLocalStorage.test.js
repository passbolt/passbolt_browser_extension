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
import {v4 as uuidv4} from 'uuid';
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import FolderEntity from "../../model/entity/folder/folderEntity";
import FolderLocalStorage, {FOLDERS_LOCAL_STORAGE_KEY} from "./folderLocalStorage";

describe("FolderLocalStorage", () => {
  describe("::get", () => {
    it("Should return undefined if nothing stored in the storage", async() => {
      expect.assertions(1);
      const result = await FolderLocalStorage.get();
      expect(result).toBeUndefined();
    });

    it("Should return content stored in the local storage", async() => {
      expect.assertions(3);
      const foldersDto = [defaultFolderDto()];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDto});
      const result = await FolderLocalStorage.get();
      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(1);
      expect(result).toEqual(foldersDto);
    });

    it("Should initialize the cache when getting the data for the first time", async() => {
      expect.assertions(5);
      const foldersDto = [defaultFolderDto()];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDto});
      expect(FolderLocalStorage.hasCachedData()).toBeFalsy();
      await FolderLocalStorage.get();
      expect(FolderLocalStorage.hasCachedData()).toBeTruthy();
      expect(FolderLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(FolderLocalStorage._cachedData).toHaveLength(1);
      expect(FolderLocalStorage._cachedData).toEqual(foldersDto);
    });

    it("Should return content stored in the local storage from the cache if set", async() => {
      expect.assertions(4);
      const foldersDto = [defaultFolderDto()];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDto});
      // call a first time to initialize the cache.
      expect(FolderLocalStorage.hasCachedData()).toBeFalsy();
      await FolderLocalStorage.get();
      // delete voluntarily the local storage data to ensure it is not used.
      await browser.storage.local.remove([FOLDERS_LOCAL_STORAGE_KEY]);
      const result = await FolderLocalStorage.get();
      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(1);
      expect(result).toEqual(foldersDto);
    });
  });

  describe("::set", () => {
    it("Should throw if parameter is invalid.", async() => {
      expect.assertions(1);
      await expect(() => FolderLocalStorage.set(42)).rejects.toThrowError("FolderLocalStorage::set expects a FoldersCollection");
    });

    it("Should set local storage with empty data", async() => {
      expect.assertions(2);
      const folders = new FoldersCollection([]);
      await FolderLocalStorage.set(folders);
      const localStorageData = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toHaveLength(0);
    });

    it("Should store data in the local storage", async() => {
      expect.assertions(3);
      const foldersDto = [defaultFolderDto(), defaultFolderDto()];
      const folders = new FoldersCollection(foldersDto);
      await FolderLocalStorage.set(folders);
      const localStorageData = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toBeInstanceOf(Array);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toHaveLength(2);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toEqual(folders.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
    });

    it("Should set the cache when setting the local storage", async() => {
      expect.assertions(5);
      const foldersDto = [defaultFolderDto(), defaultFolderDto()];
      const folders = new FoldersCollection(foldersDto);
      expect(FolderLocalStorage.hasCachedData()).toBeFalsy();
      await FolderLocalStorage.set(folders);
      expect(FolderLocalStorage.hasCachedData()).toBeTruthy();
      expect(FolderLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(FolderLocalStorage._cachedData).toHaveLength(2);
      expect(FolderLocalStorage._cachedData).toEqual(folders.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
    });
  });

  describe("::getFolderByParentId", () => {
    it("Should return undefined if the local storage is not yet initialized", async() => {
      expect.assertions(1);
      const result = await FolderLocalStorage.getFolderByParentId(uuidv4());
      expect(result).toBeUndefined();
    });

    it("Should return nothing if the target folder is not found in the local storage", async() => {
      expect.assertions(1);
      const foldersDto = [defaultFolderDto(), defaultFolderDto()];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDto});
      const result = await FolderLocalStorage.getFolderByParentId(uuidv4());
      expect(result).toBeUndefined();
    });

    it("Should return the target folder if found in the local storage", async() => {
      expect.assertions(2);
      const folderParentDto = defaultFolderDto();
      const foldersDto = [defaultFolderDto({folder_parent_id: folderParentDto.id}), folderParentDto];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDto});
      const result = await FolderLocalStorage.getFolderByParentId(foldersDto[0].folder_parent_id);
      expect(result).toEqual(expect.any(Object));
      expect(result).toEqual(foldersDto[0]);
    });
  });

  describe("::getFolderById", () => {
    it("Should return undefined if the local storage is not yet initialized", async() => {
      expect.assertions(1);
      const result = await FolderLocalStorage.getFolderById(uuidv4());
      expect(result).toBeUndefined();
    });

    it("Should return nothing if the target folder is not found in the local storage", async() => {
      expect.assertions(1);
      const foldersDto = [defaultFolderDto(), defaultFolderDto()];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDto});
      const result = await FolderLocalStorage.getFolderById(uuidv4());
      expect(result).toBeUndefined();
    });

    it("Should return the target folder if found in the local storage", async() => {
      expect.assertions(2);
      const foldersDto = [defaultFolderDto(), defaultFolderDto()];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDto});
      const result = await FolderLocalStorage.getFolderById(foldersDto[0].id);
      expect(result).toEqual(expect.any(Object));
      expect(result).toEqual(foldersDto[0]);
    });
  });

  describe("::addFolder", () => {
    it("Should throw if no data passed as parameter", async() => {
      expect.assertions(1);
      const promise = FolderLocalStorage.addFolder();
      await expect(promise).rejects.toThrow("FolderLocalStorage expects a FolderEntity to be set");
    });

    it("Should throw if the folder parameter is not a FolderEntity", async() => {
      expect.assertions(1);
      const promise = FolderLocalStorage.addFolder(42);
      await expect(promise).rejects.toThrow("FolderLocalStorage expects an object of type FolderEntity");
    });

    it("Should throw if the folder does not validate", async() => {
      expect.assertions(1);
      const folderDto = defaultFolderDto();
      delete folderDto.id;
      const folder = new FolderEntity(folderDto);
      const promise = FolderLocalStorage.addFolder(folder);
      await expect(promise).rejects.toThrow("FolderLocalStorage expects FolderEntity id to be set");
    });

    it("Should store a new folder", async() => {
      expect.assertions(3);
      const folderDto = defaultFolderDto();
      const folder = new FolderEntity(folderDto);
      await FolderLocalStorage.addFolder(folder);
      const localStorageData = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toHaveLength(1);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY][0]).toEqual(folderDto);
    });

    it("Should update the cache with the added folder", async() => {
      expect.assertions(5);
      const folderDto = defaultFolderDto();
      const folder = new FolderEntity(folderDto);
      expect(FolderLocalStorage.hasCachedData()).toBeFalsy();
      await FolderLocalStorage.addFolder(folder);
      expect(FolderLocalStorage.hasCachedData()).toBeTruthy();
      expect(FolderLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(FolderLocalStorage._cachedData).toHaveLength(1);
      expect(FolderLocalStorage._cachedData[0]).toEqual(folderDto);
    });
  });

  describe("::addFolders", () => {
    it("Should throw if no data passed as parameter", async() => {
      expect.assertions(1);
      const promise = FolderLocalStorage.addFolders();
      await expect(promise).rejects.toThrow("The parameter foldersEntities should be an array");
    });

    it("Should throw if the foldersEntities parameter is not an array", async() => {
      expect.assertions(1);
      const promise = FolderLocalStorage.addFolders(42);
      await expect(promise).rejects.toThrow("The parameter foldersEntities should be an array");
    });

    it("Should throw if one of the folders does not validate", async() => {
      expect.assertions(1);
      const folderDto1 = defaultFolderDto();
      delete folderDto1.id;
      const folder1 = new FolderEntity(folderDto1);
      const folder2 = new FolderEntity(defaultFolderDto());
      const foldersArr = [folder1, folder2];
      const promise = FolderLocalStorage.addFolders(foldersArr);
      await expect(promise).rejects.toThrow("FolderLocalStorage expects FolderEntity id to be set");
    });

    it("Should store new folders", async() => {
      expect.assertions(4);
      const folderDto1 = defaultFolderDto();
      const folder1 = new FolderEntity(folderDto1);
      const folderDto2 = defaultFolderDto();
      const folder2 = new FolderEntity(folderDto2);
      const foldersArr = [folder1, folder2];
      await FolderLocalStorage.addFolders(foldersArr);
      const localStorageData = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toHaveLength(2);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY][0]).toEqual(folderDto1);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY][1]).toEqual(folderDto2);
    });

    it("Should update the cache with the added folders", async() => {
      expect.assertions(6);
      const folderDto1 = defaultFolderDto();
      const folder1 = new FolderEntity(folderDto1);
      const folderDto2 = defaultFolderDto();
      const folder2 = new FolderEntity(folderDto2);
      const foldersArr = [folder1, folder2];
      expect(FolderLocalStorage.hasCachedData()).toBeFalsy();
      await FolderLocalStorage.addFolders(foldersArr);
      expect(FolderLocalStorage.hasCachedData()).toBeTruthy();
      expect(FolderLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(FolderLocalStorage._cachedData).toHaveLength(2);
      expect(FolderLocalStorage._cachedData[0]).toEqual(folderDto1);
      expect(FolderLocalStorage._cachedData[1]).toEqual(folderDto2);
    });
  });

  describe("::updateFolder", () => {
    it("Should throw if no data passed as parameter", async() => {
      expect.assertions(1);
      const promise = FolderLocalStorage.updateFolder();
      await expect(promise).rejects.toThrow("FolderLocalStorage expects a FolderEntity to be set");
    });

    it("Should throw if the folder parameter is not a FolderEntity", async() => {
      expect.assertions(1);
      const promise = FolderLocalStorage.updateFolder(42);
      await expect(promise).rejects.toThrow("FolderLocalStorage expects an object of type FolderEntity");
    });

    it("Should throw if the folder does not validate", async() => {
      expect.assertions(1);
      const folderDto = defaultFolderDto();
      delete folderDto.id;
      const folder = new FolderEntity(folderDto);
      const promise = FolderLocalStorage.updateFolder(folder);
      await expect(promise).rejects.toThrow("FolderLocalStorage expects FolderEntity id to be set");
    });

    it("Should throw if the folder is not found in the local storage", async() => {
      expect.assertions(1);
      const folderDto = defaultFolderDto();
      const folder = new FolderEntity(folderDto);
      const promise = FolderLocalStorage.updateFolder(folder);
      await expect(promise).rejects.toThrow('The folder could not be found in the local storage');
    });

    it("Should update the folder", async() => {
      expect.assertions(4);
      const folderDto = defaultFolderDto();
      const foldersDtos = [folderDto];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDtos});
      const folder = new FolderEntity({...folderDto, name: "Updated name"});
      await FolderLocalStorage.updateFolder(folder);
      const localStorageData = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toHaveLength(1);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY][0]).toEqual(folder.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY][0].name).not.toEqual(folderDto.name);
    });

    it("Should update the cache with the updated folder", async() => {
      expect.assertions(6);
      const folderDto = defaultFolderDto();
      const foldersDtos = [folderDto];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDtos});
      const folder = new FolderEntity({...folderDto, name: "Updated name"});
      expect(FolderLocalStorage.hasCachedData()).toBeFalsy();
      await FolderLocalStorage.updateFolder(folder);
      expect(FolderLocalStorage.hasCachedData()).toBeTruthy();
      expect(FolderLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(FolderLocalStorage._cachedData).toHaveLength(1);
      expect(FolderLocalStorage._cachedData[0]).toEqual(folder.toDto(FolderLocalStorage.DEFAULT_CONTAIN));
      expect(FolderLocalStorage._cachedData[0].name).not.toEqual(folderDto.name);
    });
  });

  describe("::deleteFolder", () => {
    it("Should throw if no data passed as parameter", async() => {
      expect.assertions(1);
      const promise = FolderLocalStorage.delete();
      await expect(promise).rejects.toThrow("The parameter folderId should be a UUID.");
    });

    it("Should throw if the folder parameter is not a uuid", async() => {
      expect.assertions(1);
      const promise = FolderLocalStorage.delete(42);
      await expect(promise).rejects.toThrow("The parameter folderId should be a UUID.");
    });

    it("Should do nothing if the folder is not found in the local storage", async() => {
      expect.assertions(2);
      const folderDto = defaultFolderDto();
      const foldersDtos = [folderDto];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDtos});
      await FolderLocalStorage.delete(uuidv4());
      const localStorageData = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toHaveLength(1);
    });

    it("Should delete the folder", async() => {
      expect.assertions(3);
      const folderDto1 = defaultFolderDto();
      const folderDto2 = defaultFolderDto();
      const foldersDtos = [folderDto1, folderDto2];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDtos});
      await FolderLocalStorage.delete(folderDto1.id);
      const localStorageData = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toHaveLength(1);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY][0]).toEqual(folderDto2);
    });

    it("Should delete the folder and keep items inside", async() => {
      expect.assertions(5);
      const folderDto1 = defaultFolderDto();
      const folderDto2 = defaultFolderDto();
      folderDto2.folder_parent_id = folderDto1.id;
      const folderDto3 = defaultFolderDto();
      folderDto3.folder_parent_id = folderDto2.id;
      const foldersDtos = [folderDto1, folderDto2, folderDto3];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDtos});
      await FolderLocalStorage.delete(folderDto2.id);
      // folder 3 should have folder parent id set to null due to the deletion of its parent
      folderDto3.folder_parent_id = null;
      const localStorageData = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toEqual(expect.any(Array));
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toHaveLength(2);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY][0]).toEqual(folderDto1);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY][1]).toEqual(folderDto3);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY][1].folder_parent_id).toEqual(null);
    });

    it("Should update cache after deleting the folder", async() => {
      expect.assertions(5);
      const folderDto1 = defaultFolderDto();
      const folderDto2 = defaultFolderDto();
      const foldersDtos = [folderDto1, folderDto2];
      await browser.storage.local.set({[FOLDERS_LOCAL_STORAGE_KEY]: foldersDtos});
      expect(FolderLocalStorage.hasCachedData()).toBeFalsy();
      await FolderLocalStorage.delete(folderDto1.id);
      expect(FolderLocalStorage.hasCachedData()).toBeTruthy();
      expect(FolderLocalStorage._cachedData).toEqual(expect.any(Array));
      expect(FolderLocalStorage._cachedData).toHaveLength(1);
      expect(FolderLocalStorage._cachedData[0]).toEqual(folderDto2);
    });
  });

  describe("::assertEntityBeforeSave", () => {
    it("Should throw if no data provided", async() => {
      expect.assertions(1);
      await expect(() => FolderLocalStorage.assertEntityBeforeSave()).toThrow("FolderLocalStorage expects a FolderEntity to be set");
    });

    it("Should throw if not a FolderEntity is provided", async() => {
      expect.assertions(1);
      await expect(() => FolderLocalStorage.assertEntityBeforeSave(42)).toThrow("FolderLocalStorage expects an object of type FolderEntity");
    });

    it("Should throw if the folder has no id", async() => {
      expect.assertions(1);
      const folderDto = defaultFolderDto();
      delete folderDto.id;
      const folder = new FolderEntity(folderDto);
      await expect(() => FolderLocalStorage.assertEntityBeforeSave(folder)).toThrow("FolderLocalStorage expects FolderEntity id to be set");
    });

    it("Should throw if the folder has no permission", async() => {
      expect.assertions(1);
      const folderDto = defaultFolderDto();
      delete folderDto.permission;
      const folder = new FolderEntity(folderDto);
      await expect(() => FolderLocalStorage.assertEntityBeforeSave(folder)).toThrow("FolderLocalStorage::set expects FolderEntity permission to be set");
    });
  });

  describe("::flush", () => {
    it("Should flush not initialized local storage and cache", async() => {
      expect.assertions(2);
      await FolderLocalStorage.flush();
      const localStorageData = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toBeUndefined();
      expect(FolderLocalStorage._cachedData).toBeNull();
    });

    it("Should flush", async() => {
      expect.assertions(2);
      const foldersDto = [defaultFolderDto(), defaultFolderDto()];
      const folders = new FoldersCollection(foldersDto);
      await FolderLocalStorage.set(folders);
      await FolderLocalStorage.flush();
      const localStorageData = await browser.storage.local.get([FOLDERS_LOCAL_STORAGE_KEY]);
      expect(localStorageData[FOLDERS_LOCAL_STORAGE_KEY]).toBeUndefined();
      expect(FolderLocalStorage._cachedData).toBeNull();
    });
  });
});
