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
 * @since         4.6.0
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import User from "../../model/user";
import MockExtension from "../../../../../test/mocks/mockExtension";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import ShareFoldersController from "./shareFoldersController";
import {_3FoldersSharedWith3UsersResourcesDto, createChangesFolderDto} from "./shareFoldersController.test.data";
import FoldersCollection from "../../model/entity/folder/foldersCollection";
import PermissionChangesCollection from "../../model/entity/permission/change/permissionChangesCollection";

const {enableFetchMocks} = require("jest-fetch-mock");
const {mockApiResponse} = require("../../../../../test/mocks/mockApiResponse");
const {pgpKeys} = require("passbolt-styleguide/test/fixture/pgpKeys/keys");
const {users} = require("passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data");

const {
  _3ResourcesSharedWith3UsersResourcesDto,
  createChangesDto,
} = require('./shareResourcesController.test.data');


jest.mock("../../service/progress/progressService");
jest.mock("../../service/passphrase/getPassphraseService");

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
});

describe("ShareResourcesController", () => {
  describe("ShareResourcesController::main", () => {
    /**
     * This scenario is the following:
     *  - There is 1 user (ada) who wants to share 3 folders with resources with 2 other users (admin and betty)
     *  - The configuration is the following:
     *    - Folder 1 is unknown to admin and betty
     *    - Folder 2 is unknown to betty
     *    - Folder 3 is unknown to admin
     *
     * So we expect to generate 4 PGP message / resources
     *  - Folder 1 for betty
     *  - Folder 1 for admin
     *  - Folder 2 for betty
     *  - Folder 3 for admin
     */
    it("Ada shares 3 folders with Betty and Admin, 1 folder is unknown to both of them 2 folders are know by one of them", async() => {
      const resourceShareUpdateCallCount = 3;
      const folderShareUpdateCallCount = 3;
      const isPermissionExpectedCallcount = 22;
      const decryptedMessageCallCount = 16;
      expect.assertions(2 * (resourceShareUpdateCallCount + folderShareUpdateCallCount) + isPermissionExpectedCallcount + decryptedMessageCallCount);

      // preparation of the keyring data to set the 3 needed users
      const account = new AccountEntity(defaultAccountDto());
      await MockExtension.withConfiguredAccount(); //curent user is ada with her private set in the keyring
      const keyring = new Keyring();
      await keyring.importPublic(pgpKeys.admin.public, users.admin.id);
      await keyring.importPublic(pgpKeys.betty.public, users.betty.id);
      await keyring.importPublic(pgpKeys.ada.public, users.ada.id);

      // this is a way to find the correct private key with a user id later when we'll try to decrypt messages
      const decryptedPrivateKeys = {};
      decryptedPrivateKeys[users.ada.id] = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
      decryptedPrivateKeys[users.admin.id] = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted);
      decryptedPrivateKeys[users.betty.id] = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);

      /*
       * this is one of the parameter that the controller requires.
       * some ids are generated randomly so we catch them after as we need it
       */
      const foldersDto = await _3FoldersSharedWith3UsersResourcesDto();
      const getId = (list, index) => list[index].id;
      const folder1Id = getId(foldersDto, 0);
      const folder2Id = getId(foldersDto, 1);
      const folder3Id = getId(foldersDto, 2);

      /*
       * this is one of the parameter that the controller requires.
       * some ids are generated randomly so we catch them after as we need it
       */
      const resourcesDto = await _3ResourcesSharedWith3UsersResourcesDto();
      resourcesDto[0].folder_parent_id = folder1Id;
      resourcesDto[1].folder_parent_id = folder2Id;
      resourcesDto[2].folder_parent_id = folder3Id;
      const resource1Id = getId(resourcesDto, 0);
      const resource2Id = getId(resourcesDto, 1);
      const resource3Id = getId(resourcesDto, 2);

      /*
       * This is the new couple resource/user that we expect to be created for this scenario.
       * It is used later to check that there is no extra stuff created in the process.
       */
      const expectedUserAssociation = [
        {folder: folder1Id, user: users.admin.id},
        {folder: folder1Id, user: users.betty.id},
        {folder: folder2Id, user: users.betty.id},
        {folder: folder3Id, user: users.admin.id},
        {resource: resource1Id, user: users.admin.id},
        {resource: resource1Id, user: users.betty.id},
        {resource: resource2Id, user: users.betty.id},
        {resource: resource3Id, user: users.admin.id}
      ];

      const generateChangesFromExpectedNewResourceUserCouples = newUserAssociationCouples => {
        const changes = [];
        newUserAssociationCouples.forEach(userAssociation => {
          let newUserAssociationCouples;
          if (userAssociation.folder) {
            newUserAssociationCouples = createChangesFolderDto({aco_foreign_key: userAssociation.folder, aro_foreign_key: userAssociation.user});
          } else {
            newUserAssociationCouples = createChangesDto({aco_foreign_key: userAssociation.resource, aro_foreign_key: userAssociation.user});
          }
          changes.push(newUserAssociationCouples);
        });
        return changes;
      };

      /*
       * we prepare the data matching the current password share changes.
       * this is the second parameter that the controller requires.
       */
      const changesDto = generateChangesFromExpectedNewResourceUserCouples(expectedUserAssociation);

      // used later to verify that the generated permission is one of the expected
      const isPermissionExpected = permission => {
        for (let i = 0; i < expectedUserAssociation.length; i++) {
          const expected = expectedUserAssociation[i];
          if ((expected.folder === permission.aco_foreign_key || expected.resource === permission.aco_foreign_key) && expected.user === permission.aro_foreign_key) {
            return true;
          }
        }
        return false;
      };

      /*
       * now we mock the response from the server:
       *  - get details of sub-folders and resources (2 call)
       *  - share folders (3 calls, 1 per folder)
       *  - find all folders for local storage update (1 call)
       *  - keyring synchronisation (1 call)
       *  - resource share simulations (3 calls, 1 per resource)
       *  - share resources (3 calls for this scenario)
       *  - find all resource for local storage update (1 call)
       */

      // 2 API call is to get more detailed permissions for all of these affected items if any
      fetch.doMockOnce(() => mockApiResponse(resourcesDto));
      fetch.doMockOnce(() => mockApiResponse([foldersDto[1], foldersDto[2]]));

      const shareUpdate = async request => {
        const {permissions, secrets} = JSON.parse(await request.text());

        expect(permissions).toBeTruthy();

        permissions.forEach(permission => expect(isPermissionExpected(permission)).toBe(true));

        for (let i = 0; i < secrets?.length || 0; i++) {
          const secret = secrets[i];
          const decryptedPrivateKey = decryptedPrivateKeys[secret.user_id];
          const secretMessage = await OpenpgpAssertion.readMessageOrFail(secret.data);
          const decryptedMessage = await DecryptMessageService.decrypt(secretMessage, decryptedPrivateKey);
          expect(decryptedMessage).toEqual(expect.stringMatching(/^secret[123]$/));
        }
        return mockApiResponse({});
      };

      // 1 call per necessary folder sharing
      for (let i = 0; i < foldersDto.length; i++) {
        fetch.doMockOnce(shareUpdate);
      }

      /*
       * API call is a findAll on Folders to update local storage
       * This unit test doesn't cover the local storage part so we respond with an empty response to ignore it.
       */
      fetch.doMockOnce(() => mockApiResponse([]));
      // API call is for the keyring sync
      fetch.doMockOnce(() => mockApiResponse([]));

      // set of API calls; 1 call per resource share simulation
      const simulationApiCallback = async request => {
        const {permissions} = JSON.parse(await request.text());
        const usersList = permissions.map(perm => ({
          User: {id: perm.aro_foreign_key}
        }));

        return mockApiResponse({
          changes: {
            added: usersList,
            removed: []
          }
        });
      };

      // 1 call per resource share simulation
      for (let i = 0; i < resourcesDto.length; i++) {
        fetch.doMockOnce(simulationApiCallback);
      }

      // 1 call per necessary resource sharing
      for (let i = 0; i < resourcesDto.length; i++) {
        fetch.doMockOnce(shareUpdate);
      }

      /*
       * API call is a findAll on Resources to update local storage
       * This unit test doesn't cover the local storage part so we respond with an empty response to ignore it.
       */
      fetch.doMockOnce(() => mockApiResponse([]));

      /*
       * API call is a findAll on Resources Type to update local storage
       * This unit test doesn't cover the local storage part so we respond with an empty response to ignore it.
       */
      fetch.doMockOnce(() => mockApiResponse([]));

      jest.spyOn(browser.storage.local, "get").mockReturnValueOnce({folders: foldersDto});
      jest.spyOn(browser.storage.local, "get").mockReturnValueOnce({resources: resourcesDto});

      // finally we can call the controller with the data as everything is setup.
      const clientOptions = await User.getInstance().getApiClientOptions();
      const controller = new ShareFoldersController(null, null, clientOptions, account);
      controller.getPassphraseService.getPassphrase.mockResolvedValue(pgpKeys.ada.passphrase);
      await controller.main(new FoldersCollection([foldersDto[0]]), new PermissionChangesCollection(changesDto));
    });
  });
});
