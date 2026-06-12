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
 * @since         5.13.0
 */

import FindFoldersForShareController from "./findFoldersForShareController";
import FindFoldersService from "../../service/folder/findFoldersService";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import FolderService from "../../service/api/folder/folderService";
import { defaultFolderDto } from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { enableFetchMocks } from "jest-fetch-mock";
import { mockApiResponse } from "../../../../../test/mocks/mockApiResponse";

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

describe("FindFoldersForShareController", () => {
  describe("FindFoldersForShareController::exec", () => {
    it("requests the API with permission + permissions.user.profile + permissions.group contains and returns a FoldersCollection", async () => {
      expect.assertions(6);

      const folderDto1 = defaultFolderDto();
      const folderDto2 = defaultFolderDto();
      const serverResponseDto = [folderDto1, folderDto2];
      const foldersIds = [folderDto1.id, folderDto2.id];

      fetch.doMockOnceIf(/folders\.json/, async (request) => {
        const url = new URL(request.url);
        expect(url.searchParams.getAll("filter[has-id][]")).toStrictEqual(foldersIds);
        expect(url.searchParams.get("contain[permission]")).toStrictEqual("1");
        expect(url.searchParams.get("contain[permissions.user.profile]")).toStrictEqual("1");
        expect(url.searchParams.get("contain[permissions.group]")).toStrictEqual("1");
        return await mockApiResponse(serverResponseDto);
      });

      const controller = new FindFoldersForShareController(null, null, defaultApiClientOptions());
      const result = await controller.exec(foldersIds);

      expect(result).toBeInstanceOf(FoldersCollection);
      expect(result).toStrictEqual(new FoldersCollection(serverResponseDto));
    });

    it("rejects with a TypeError when foldersIds is not an array of UUIDs", async () => {
      expect.assertions(1);
      const controller = new FindFoldersForShareController(null, null, defaultApiClientOptions());
      await expect(controller.exec(["not-a-uuid"])).rejects.toThrow(TypeError);
    });
  });

  describe("FindFoldersForShareController::constructor", () => {
    it("instantiates a FindFoldersService backed by a FolderService", () => {
      expect.assertions(2);
      const controller = new FindFoldersForShareController(null, null, defaultApiClientOptions());
      expect(controller.findFoldersService).toBeInstanceOf(FindFoldersService);
      expect(controller.findFoldersService.folderService).toBeInstanceOf(FolderService);
    });
  });
});
