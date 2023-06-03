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
import GroupsUpdateController from "./groupUpdateController";
import browser from "../../sdk/polyfill/browserPolyfill";
import {PassphraseController} from "../passphrase/passphraseController";
import MockExtension from "../../../../../test/mocks/mockExtension";

const {enableFetchMocks} = require("jest-fetch-mock");
const {mockApiResponse} = require("../../../../../test/mocks/mockApiResponse");
const {pgpKeys} = require("../../../../../test/fixtures/pgpKeys/keys");
const {users} = require("passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data");



const {updateGroupNameDto, add2UsersToGroupDto, add2UsersToGroupDryRunResponse} = require("./groupUpdateController.test.data");
const {defaultGroup} = require("../../model/entity/group/groupEntity.test.data");
const {defaultDyRunResponse} = require("../../model/entity/group/update/groupUpdateDryRunResultEntity.test.data");


jest.mock("../../service/progress/progressService");

jest.spyOn(PassphraseController, "get").mockImplementation(() => "ada@passbolt.com");

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
});

describe("GroupsUpdateController", () => {
  describe("GroupsUpdateController::main", () => {
    /**
     * This scenario consists to only change the name of the group.
     */
    it("Only group's name changed", async() => {
      expect.assertions(3);

      const localGroup = defaultGroup();
      const dto = updateGroupNameDto({id: localGroup.id, groups_users: localGroup.groups_users});
      await MockExtension.withConfiguredAccount(); //curent user is ada with her private set in the keyring

      browser.storage.local.set({groups: [localGroup]});

      const clientOptions = await User.getInstance().getApiClientOptions({requireCsrfToken: false});
      const controller = new GroupsUpdateController(null, null, clientOptions);

      // 1st API call is for the dry-run to verify which secrets needs to be computed (no secret to update)
      fetch.doMockOnce(() => mockApiResponse(defaultDyRunResponse()));

      // 2nd API call is for the update of the groups
      fetch.doMockOnce(async req => {
        const {id, name, groups_users, secrets} = JSON.parse(await req.text());

        expect(name).toBe(dto.name);
        expect(groups_users.length).toBe(0);
        expect(secrets).toBeUndefined();
        return mockApiResponse({id, name});
      });

      await controller.main(dto);
    });

    /**
     * This scenario is the following:
     *  - There is 1 user in a group (ada is the current user)
     *  - The group has been shared 3 resources already
     *  - We add 2 new users to the group (betty and admin)
     *    - Resource 1 is unknown to both new users
     *    - Resource 2 is unknown to betty
     *    - Resource 3 is unknown to admin
     *
     * So we expect to generate 4 PGP message
     *  - Resource 1 for betty
     *  - Resource 1 for admin
     *  - Resource 2 for betty
     *  - Resource 3 for admin
     */
    it("Add 2 users in a group with 1 secret being unknown for both users and 2 other secrets known by only one user each", async() => {
      expect.assertions(12);

      const getResourceId = (data, index) => data['dry-run'].Secrets[index].Secret[0].resource_id;
      const findSecret = (secrets, userId, resource1Id) => {
        for (const i in secrets) {
          const secret = secrets[i];
          if (secret.user_id === userId && secret.resource_id === resource1Id) {
            return secret;
          }
        }
      };

      const localGroup = defaultGroup();
      const dto = add2UsersToGroupDto({id: localGroup.id, groups_users: localGroup.groups_users});
      await MockExtension.withConfiguredAccount(); //curent user is ada with her private set in the keyring
      const keyring = new Keyring();

      await keyring.importPublic(pgpKeys.admin.public, users.admin.id);
      await keyring.importPublic(pgpKeys.betty.public, users.betty.id);
      await keyring.importPublic(pgpKeys.ada.public, users.ada.id);

      browser.storage.local.set({groups: [localGroup]});

      const clientOptions = await User.getInstance().getApiClientOptions({requireCsrfToken: false});
      const controller = new GroupsUpdateController(null, null, clientOptions);
      const dryRunResponse = await add2UsersToGroupDryRunResponse();
      const resource1Id = getResourceId(dryRunResponse, 0);
      const resource2Id = getResourceId(dryRunResponse, 1);
      const resource3Id = getResourceId(dryRunResponse, 2);

      // 1st API call is for the dry-run to verify which secrets needs to be computed
      fetch.doMockOnce(() => mockApiResponse(dryRunResponse));

      // 2nd API call is for the keyring sync
      fetch.doMockOnce(() => mockApiResponse({}));

      // 3rd API call is for the update of the groups
      fetch.doMockOnce(async req => {
        const {id, name, groups_users, secrets} = JSON.parse(await req.text());

        // name shouldn't have change in this scenario
        expect(name).toBe(localGroup.name);

        // we have added 2 new users in the group (admin and betty)
        const usersIds = groups_users.map(groups_user => groups_user.user_id);
        expect(groups_users.length).toBe(2);
        expect(usersIds).toEqual(expect.arrayContaining([users.admin.id, users.betty.id]));

        //we should have 4 encrypted resources
        expect(secrets.length).toBe(4);
        const bettyResource1 = findSecret(secrets, users.betty.id, resource1Id);
        const bettyResource2 = findSecret(secrets, users.betty.id, resource2Id);
        const adminResource1 = findSecret(secrets, users.admin.id, resource1Id);
        const adminResource3 = findSecret(secrets, users.admin.id, resource3Id);

        expect(bettyResource1).not.toBeUndefined();
        expect(bettyResource2).not.toBeUndefined();
        expect(adminResource1).not.toBeUndefined();
        expect(adminResource3).not.toBeUndefined();

        // we should have the new resources encrypted for the correct users and they should be able to decrypt them.
        const bettyPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
        const bettyResource1Data = await OpenpgpAssertion.readMessageOrFail(bettyResource1.data);
        const bettyResource2Data = await OpenpgpAssertion.readMessageOrFail(bettyResource2.data);
        const adminResource1Data = await OpenpgpAssertion.readMessageOrFail(adminResource1.data);
        const adminResource3Data = await OpenpgpAssertion.readMessageOrFail(adminResource3.data);
        expect(await DecryptMessageService.decrypt(bettyResource1Data, bettyPrivateKey)).toBe("resource1-password");
        expect(await DecryptMessageService.decrypt(bettyResource2Data, bettyPrivateKey)).toBe("resource2-password");

        const adminPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted);
        expect(await DecryptMessageService.decrypt(adminResource1Data, adminPrivateKey)).toBe("resource1-password");
        expect(await DecryptMessageService.decrypt(adminResource3Data, adminPrivateKey)).toBe("resource3-password");

        return mockApiResponse({id: id, name: name});
      });

      await controller.main(dto);
    });
  });
});
