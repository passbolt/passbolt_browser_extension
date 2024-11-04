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
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import FindAndUpdateFoldersLocalStorageService from "./findAndUpdateFoldersLocalStorageService";
import FolderService from "../api/folder/folderService";
import FindFoldersService from "./findFoldersService";
import FolderLocalStorage from "../local_storage/folderLocalStorage";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import FoldersCollection from "../../model/entity/folder/foldersCollection";

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("FindAndUpdateFoldersLocalStorage", () => {
  // mock data
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = new ApiClientOptions().setBaseUrl('https://localhost');

  describe("::findAndUpdateAll", () => {
    it("asserts updatePeriodThreshold parameter", async() => {
      expect.assertions(1);
      const options = new ApiClientOptions().setBaseUrl('https://localhost');
      const service = new FindAndUpdateFoldersLocalStorageService(account, options);
      expect(() => service.findAndUpdateAll({updatePeriodThreshold: false})).rejects.toThrow("Parameter updatePeriodThreshold should be a number.");
    });

    it("updates local storage when no folders are returned by the API.", async() => {
      expect.assertions(2);
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => []);
      jest.spyOn(FindFoldersService.prototype, "findAllForLocalStorage");

      const service = new FindAndUpdateFoldersLocalStorageService(account, apiClientOptions);
      await service.findAndUpdateAll();

      const foldersLSDto = await FolderLocalStorage.get();
      expect(FindFoldersService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(foldersLSDto).toHaveLength(0);
    });

    it("updates local storage with a single folder.", async() => {
      expect.assertions(3);
      const foldersDto = [defaultFolderDto()];
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => foldersDto);
      jest.spyOn(FindFoldersService.prototype, "findAllForLocalStorage");

      const service = new FindAndUpdateFoldersLocalStorageService(account, apiClientOptions);
      await service.findAndUpdateAll();

      const foldersLSDto = await FolderLocalStorage.get();
      expect(FindFoldersService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(foldersLSDto).toHaveLength(1);
      expect(foldersLSDto).toEqual(foldersDto);
    });

    it("updates local storage with a multiple folders.", async() => {
      expect.assertions(4);
      const foldersDto = [defaultFolderDto(), defaultFolderDto(), defaultFolderDto(), defaultFolderDto()];
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => foldersDto);
      jest.spyOn(FindFoldersService.prototype, "findAllForLocalStorage");

      const service = new FindAndUpdateFoldersLocalStorageService(account, apiClientOptions);
      expect(FolderLocalStorage._cachedData).toBeNull();
      await service.findAndUpdateAll();

      const foldersLSDto = await FolderLocalStorage.get();
      expect(FindFoldersService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(foldersLSDto).toHaveLength(4);
      expect(foldersLSDto).toEqual(foldersDto);
    });

    it("overrides local storage with a second update call.", async() => {
      expect.assertions(4);
      const foldersDto = [defaultFolderDto()];
      const multipleFolderDtos = [defaultFolderDto(), defaultFolderDto(), defaultFolderDto(), defaultFolderDto()];
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => foldersDto);
      jest.spyOn(FindFoldersService.prototype, "findAllForLocalStorage");
      await FolderLocalStorage.set(new FoldersCollection(multipleFolderDtos));

      const service = new FindAndUpdateFoldersLocalStorageService(account, apiClientOptions);
      expect(FolderLocalStorage._cachedData).not.toBeNull();
      await service.findAndUpdateAll();

      const foldersLSDto = await FolderLocalStorage.get();
      expect(FindFoldersService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(foldersLSDto).toHaveLength(1);
      expect(foldersLSDto).toEqual(foldersDto);
    });

    it("does not update the local storage if the update period threshold given in parameter is not overdue.", async() => {
      expect.assertions(5);
      const foldersDto = [defaultFolderDto()];
      const multipleFolderDtos = [defaultFolderDto(), defaultFolderDto(), defaultFolderDto(), defaultFolderDto()];
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => foldersDto);
      jest.spyOn(FindFoldersService.prototype, "findAllForLocalStorage");
      await FolderLocalStorage.set(new FoldersCollection(multipleFolderDtos));

      const service = new FindAndUpdateFoldersLocalStorageService(account, apiClientOptions);
      const folderCollectionFirstCall = await service.findAndUpdateAll();
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => multipleFolderDtos);
      const folderCollectionSecondCall = await service.findAndUpdateAll({updatePeriodThreshold: 1000});

      const foldersLSDto = await FolderLocalStorage.get();
      expect(FindFoldersService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(folderCollectionFirstCall).toEqual(folderCollectionSecondCall);
      expect(folderCollectionSecondCall.toDto(FolderLocalStorage.DEFAULT_CONTAIN)).toEqual(foldersLSDto);
      expect(foldersLSDto).toHaveLength(1);
      expect(foldersLSDto).toEqual(foldersDto);
    });

    it("updates the local storage if the update period threshold given in parameter is overdue.", async() => {
      expect.assertions(6);
      const multipleFolderDtos = [defaultFolderDto(), defaultFolderDto(), defaultFolderDto(), defaultFolderDto()];
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => [defaultFolderDto()]);
      jest.spyOn(FindFoldersService.prototype, "findAllForLocalStorage");
      await FolderLocalStorage.set(new FoldersCollection(multipleFolderDtos));

      const service = new FindAndUpdateFoldersLocalStorageService(account, apiClientOptions);
      const folderCollectionFirstCall = await service.findAndUpdateAll();
      const foldersDto = multipleFolderDtos;
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => foldersDto);
      jest.advanceTimersByTime(1001);
      const folderCollectionSecondCall = await service.findAndUpdateAll({updatePeriodThreshold: 1000});

      const foldersLSDto = await FolderLocalStorage.get();
      expect(FindFoldersService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(2);
      expect(folderCollectionFirstCall.folders).toHaveLength(1);
      expect(folderCollectionSecondCall.folders).toHaveLength(4);
      expect(folderCollectionSecondCall.toDto(FolderLocalStorage.DEFAULT_CONTAIN)).toEqual(foldersLSDto);
      expect(foldersLSDto).toHaveLength(4);
      expect(foldersLSDto).toEqual(foldersDto);
    });

    it("waits any on-going call to the update.", async() => {
      expect.assertions(5);
      const foldersDto = [defaultFolderDto()];
      let resolve;
      const promise = new Promise(_resolve => resolve = _resolve);
      jest.spyOn(FolderService.prototype, "findAll").mockImplementation(() => promise);
      jest.spyOn(FindFoldersService.prototype, "findAllForLocalStorage");

      const service = new FindAndUpdateFoldersLocalStorageService(account, apiClientOptions);
      const promiseFirstCall = service.findAndUpdateAll();
      const promiseSecondCall = service.findAndUpdateAll();
      resolve(foldersDto);
      const folderCollectionFirstCall = await promiseFirstCall;
      const folderCollectionSecondCall = await promiseSecondCall;
      const foldersLSDto = await FolderLocalStorage.get();

      expect(FindFoldersService.prototype.findAllForLocalStorage).toHaveBeenCalledTimes(1);
      expect(folderCollectionFirstCall).toEqual(folderCollectionSecondCall);
      expect(folderCollectionSecondCall.toDto(FolderLocalStorage.DEFAULT_CONTAIN)).toEqual(foldersLSDto);
      expect(foldersLSDto).toHaveLength(1);
      expect(foldersLSDto).toEqual(foldersDto);
    });
  });
});
