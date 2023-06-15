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
 * @since         3.6.0
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import User from "../../model/user";
import ShareResourcesController from "./shareResourcesController";
import {PassphraseController} from "../passphrase/passphraseController";
import MockExtension from "../../../../../test/mocks/mockExtension";

const {enableFetchMocks} = require("jest-fetch-mock");
const {mockApiResponse} = require("../../../../../test/mocks/mockApiResponse");
const {pgpKeys} = require("../../../../../test/fixtures/pgpKeys/keys");
const {users} = require("passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data");

const {
  _3ResourcesSharedWith3UsersResourcesDto,
  createChangesDto,
} = require('./shareResourcesController.test.data');


jest.mock("../../service/progress/progressService");

jest.spyOn(PassphraseController, "get").mockImplementation(() => "ada@passbolt.com");

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
});

describe("ShareResourcesController", () => {
  describe("ShareResourcesController::main", () => {
    /**
     * This scenario is the following:
     *  - There is 1 user (ada) who wants to share 3 resources with 2 other users (admin and betty)
     *  - The configuration is the following:
     *    - Resource 1 is unknown to admin and betty
     *    - Resource 2 is unknown to betty
     *    - Resource 3 is unknown to admin
     *
     * So we expect to generate 4 PGP message / resources
     *  - Resource 1 for betty
     *  - Resource 1 for admin
     *  - Resource 2 for betty
     *  - Resource 3 for admin
     */
    it("Ada shares 3 resources with Betty and Admin, 1 resources is unknown to both of them 2 resources are know by one of them", async() => {
      const resourceShareUpdateCallCount = 3;
      const isPermissionExpectedCallcount = 4;
      const decryptedMessageCallCount = 4;
      expect.assertions(2 * resourceShareUpdateCallCount + isPermissionExpectedCallcount + decryptedMessageCallCount);

      // preparation of the keyring data to set the 3 needed users
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
      const resourcesDto = await _3ResourcesSharedWith3UsersResourcesDto();
      const getResourceId = (resourcesList, index) => resourcesList[index].id;
      const resource1Id = getResourceId(resourcesDto, 0);
      const resource2Id = getResourceId(resourcesDto, 1);
      const resource3Id = getResourceId(resourcesDto, 2);

      /*
       * This is the new couple resource/user that we expect to be created for this scenario.
       * It is used later to check that there is no extra stuff created in the process.
       */
      const expectedResourceUserAssiocation = [
        {resource: resource1Id, user: users.admin.id},
        {resource: resource1Id, user: users.betty.id},
        {resource: resource2Id, user: users.betty.id},
        {resource: resource3Id, user: users.admin.id}
      ];

      const genereteChangesFromExpectedNewResourceUserCouples = newResourceUserCouples => {
        const changes = [];
        newResourceUserCouples.forEach(resourceUser => {
          const newResourceUserCouple = createChangesDto({aco_foreign_key: resourceUser.resource, aro_foreign_key: resourceUser.user});
          changes.push(newResourceUserCouple);
        });
        return changes;
      };

      /*
       * we prepare the data matching the current password share changes.
       * this is the second parameter that the controller requires.
       */
      const changesDto = genereteChangesFromExpectedNewResourceUserCouples(expectedResourceUserAssiocation);

      // used later to verify that the generated permission is one of the expected
      const isPermissionExpected = permission => {
        for (let i = 0; i < expectedResourceUserAssiocation.length; i++) {
          const expected = expectedResourceUserAssiocation[i];
          if (expected.resource === permission.aco_foreign_key && expected.user === permission.aro_foreign_key) {
            return true;
          }
        }
        return false;
      };

      /*
       * now we mock the response from the server:
       *  - keyring synchronisation (1 call)
       *  - resource share simulations (3 calls, 1 per resource)
       *  - resource update (3 calls for this scenario)
       *  - find all resource for local storage update (1 call)
       */

      // 1st API call is for the keyring sync
      fetch.doMockOnce(() => mockApiResponse([]));

      // 2nd set of API calls; 1 call per resource share simulation
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

      for (let i = 0; i < resourcesDto.length; i++) {
        fetch.doMockOnce(simulationApiCallback);
      }

      // 3rd set of API calls; 1 call per necessary resource sharing
      const resourceShareUpdate = async request => {
        const {permissions, secrets} = JSON.parse(await request.text());

        expect(permissions).toBeTruthy();
        expect(secrets).toBeTruthy();

        permissions.forEach(permission => expect(isPermissionExpected(permission)).toBe(true));

        for (let i = 0; i < secrets.length; i++) {
          const secret = secrets[i];
          const decryptedPrivateKey = decryptedPrivateKeys[secret.user_id];
          const secretMessage = await OpenpgpAssertion.readMessageOrFail(secret.data);
          const decryptedMessage = await DecryptMessageService.decrypt(secretMessage, decryptedPrivateKey);
          expect(decryptedMessage).toEqual(expect.stringMatching(/^secret[123]$/));
        }
        return mockApiResponse({});
      };

      for (let i = 0; i < 3; i++) {
        fetch.doMockOnce(resourceShareUpdate);
      }

      /*
       * 4th API call is a findAll on Resources to update local storage
       * This unit test doesn't cover the local storage part so we respond with an empty response to ignore it.
       */
      fetch.doMockOnce(() => mockApiResponse([]));

      /*
       * 5th API call is a findAll on Resources Type to update local storage
       * This unit test doesn't cover the local storage part so we respond with an empty response to ignore it.
       */
      fetch.doMockOnce(() => mockApiResponse([]));

      // finally we can call the controller with the data as everything is setup.
      const clientOptions = await User.getInstance().getApiClientOptions({requireCsrfToken: false});
      const controller = new ShareResourcesController(null, null, clientOptions);
      await controller.main(resourcesDto, changesDto);
    });
  });
});
