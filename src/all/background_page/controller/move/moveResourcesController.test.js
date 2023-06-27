/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.8.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import MoveResourcesController from "./moveResourcesController";
import {PassphraseController} from "../passphrase/passphraseController";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {defaultResourceDtosCollection} from "../../model/entity/resource/resourcesCollection.test.data";
import FolderModel from "../../model/folder/folderModel";
import ResourceModel from "../../model/resource/resourceModel";
import Keyring from "../../model/keyring";
import ExternalGpgKeyEntity from "../../model/entity/gpgkey/external/externalGpgKeyEntity";
import FolderEntity from "../../model/entity/folder/folderEntity";
import {ownerPermissionDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data.js";
import ResourceLocalStorage from "../../service/local_storage/resourceLocalStorage";

jest.mock("../../service/progress/progressService");
jest.mock("../passphrase/passphraseController.js");
jest.spyOn(FolderModel.prototype, "assertFolderExists").mockImplementation(() => {});
jest.spyOn(ResourceModel.prototype, "assertResourcesExist").mockImplementation(() => {});
const mockedFindPrivate = jest.spyOn(Keyring.prototype, "findPrivate");
const key = pgpKeys.admin;

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
  // Mock user passphrase capture.
  PassphraseController.get.mockResolvedValue(pgpKeys.admin.passphrase);
  mockedFindPrivate.mockImplementation(() => new ExternalGpgKeyEntity({armored_key: key.private}));
});

describe("MoveResourcesController", () => {
  describe("MoveResourcesController::main", () => {
    it("Should move resources.", async() => {
      const controller = new MoveResourcesController(null, null, defaultApiClientOptions());
      // Mock the API response.
      const mockApiFetch = fetch.doMockIf(new RegExp('/move/resource/.*.json'), () => mockApiResponse());
      // Mock API findAllForShare resources.
      const mockResourcesToMoved = defaultResourceDtosCollection();
      fetch.doMockOnceIf(new RegExp('/resources.json'), () => mockApiResponse(mockResourcesToMoved));
      jest.spyOn(ResourceLocalStorage, "get").mockImplementation(() => mockResourcesToMoved);
      // Mock API findAllForShare folders.
      const permission = ownerPermissionDto({aco: "Folder", aco_foreign_key: "f848277c-5398-58f8-a82a-72397af2d450"});
      const folderDto = {
        id: "f848277c-5398-58f8-a82a-72397af2d450",
        name: "Test",
        folder_parent_id: null,
        permission: permission,
        permissions: [permission]
      };
      const mockFolder = new FolderEntity(folderDto);
      fetch.doMockOnceIf(new RegExp('/folders.json'), () => mockApiResponse([mockFolder]));

      await controller.main(['a848277c-7893-58f8-a82a-72397bf2d890'], "f848277c-5398-58f8-a82a-72397af2d450");

      expect.assertions(1);
      // Expect the API to have been called 6 times.
      expect(mockApiFetch).toHaveBeenCalledTimes(6);
    });

    it("Should move no resource if resources are always in the folder.", async() => {
      const controller = new MoveResourcesController(null, null, defaultApiClientOptions());
      // Mock API findAllForShare resources.
      const mockResourcesToMoved = defaultResourceDtosCollection();
      const mockApiFetch = fetch.doMockOnceIf(new RegExp('/resources.json'), () => mockApiResponse(mockResourcesToMoved));

      await controller.main(['a848277c-7893-58f8-a82a-72397bf2d890'], null);

      expect.assertions(1);
      // Expect the API to have been called 1 time.
      expect(mockApiFetch).toHaveBeenCalledTimes(1);
    });

    it("Should move no resources if the user is no authorize.", async() => {
      const controller = new MoveResourcesController(null, null, defaultApiClientOptions());
      // Mock API findAllForShare resources.
      const mockResourcesToMoved = defaultResourceDtosCollection();
      const mockApiFetch = fetch.doMockOnceIf(new RegExp('/resources.json'), () => mockApiResponse(mockResourcesToMoved));
      // Mock API findAllForShare folders.
      const permission = ownerPermissionDto({aco: "Folder", aco_foreign_key: "f848277c-5398-58f8-a82a-72397af2d450", type: 1});
      const permissionOwner = ownerPermissionDto({aco: "Folder", aco_foreign_key: "f848277c-5398-58f8-a82a-72397af2d450"});
      const folderDto = {
        id: "f848277c-5398-58f8-a82a-72397af2d450",
        name: "Test",
        folder_parent_id: null,
        permission: permission,
        permissions: [permissionOwner]
      };
      const mockFolder = new FolderEntity(folderDto);
      fetch.doMockOnceIf(new RegExp('/folders.json'), () => mockApiResponse([mockFolder]));

      await controller.main(['a848277c-7893-58f8-a82a-72397bf2d890'], "f848277c-5398-58f8-a82a-72397af2d450");

      expect.assertions(1);
      // Expect the API to have been called 2 times.
      expect(mockApiFetch).toHaveBeenCalledTimes(2);
    });
  });
});
