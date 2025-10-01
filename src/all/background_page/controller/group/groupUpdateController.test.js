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
import GroupsUpdateController from "./groupUpdateController";
import MockExtension from "../../../../../test/mocks/mockExtension";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

const {enableFetchMocks} = require("jest-fetch-mock");
const {mockApiResponse} = require("../../../../../test/mocks/mockApiResponse");
const {pgpKeys} = require("passbolt-styleguide/test/fixture/pgpKeys/keys");
const {users} = require("passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data");

const {updateGroupNameDto, add2UsersToGroupDto, add2UsersToGroupDryRunResponse} = require("./groupUpdateController.test.data");
const {defaultGroupDto} = require("passbolt-styleguide/src/shared/models/entity/group/groupEntity.test.data");
const {defaultDryRunResponse} = require("../../model/entity/group/update/groupUpdateDryRunResultEntity.test.data");

jest.mock("../../service/progress/progressService");
jest.mock("../../service/passphrase/getPassphraseService");

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

      const localGroup = defaultGroupDto({}, {withGroupsUsers: true});
      const dto = updateGroupNameDto({id: localGroup.id, groups_users: localGroup.groups_users});
      await MockExtension.withConfiguredAccount(); //curent user is ada with her private set in the keyring

      browser.storage.local.set({groups: [localGroup]});

      const clientOptions = defaultApiClientOptions();
      const controller = new GroupsUpdateController(null, null, clientOptions);
      controller.getPassphraseService.getPassphrase.mockResolvedValue(pgpKeys.ada.passphrase);

      // 1st API call is for the dry-run to verify which secrets needs to be computed (no secret to update)
      fetch.doMockOnce(() => mockApiResponse(defaultDryRunResponse()));

      // 2nd API call is for the update of the groups
      fetch.doMockOnce(async req => {
        const {id, name, groups_users, secrets} = JSON.parse(await req.text());

        expect(name).toBe(dto.name);
        expect(groups_users).toBeUndefined();
        expect(secrets).toBeUndefined();
        return mockApiResponse({id, name});
      });

      await controller.exec(dto);
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
      expect.assertions(20);

      const getResourceId = (data, index) => data['dry-run'].Secrets[index].Secret[0].resource_id;
      const findSecret = (secrets, userId, resource1Id) => {
        for (const i in secrets) {
          const secret = secrets[i];
          if (secret.user_id === userId && secret.resource_id === resource1Id) {
            return secret;
          }
        }
      };

      const localGroup = defaultGroupDto({}, {withGroupsUsers: true});
      const dto = add2UsersToGroupDto({id: localGroup.id, groups_users: localGroup.groups_users});
      await MockExtension.withConfiguredAccount(); //curent user is ada with her private set in the keyring
      const keyring = new Keyring();

      await keyring.importPublic(pgpKeys.admin.public, users.admin.id);
      await keyring.importPublic(pgpKeys.betty.public, users.betty.id);
      await keyring.importPublic(pgpKeys.ada.public, users.ada.id);

      browser.storage.local.set({groups: [localGroup]});

      const account = new AccountEntity(defaultAccountDto());
      const clientOptions = defaultApiClientOptions();
      const controller = new GroupsUpdateController(null, null, clientOptions, account);
      controller.getPassphraseService.getPassphrase.mockResolvedValue(pgpKeys.ada.passphrase);

      const dryRunResponse = await add2UsersToGroupDryRunResponse();
      const resource1Id = getResourceId(dryRunResponse, 0);
      const resource2Id = getResourceId(dryRunResponse, 1);
      const resource3Id = getResourceId(dryRunResponse, 2);

      // 1st API call is for the dry-run to verify which secrets needs to be computed
      fetch.doMockOnce(() => mockApiResponse(dryRunResponse));

      // 2nd API call is for the keyring sync
      fetch.doMockOnce(() => mockApiResponse({}));

      // 1st operation is group name update operation
      fetch.doMockOnce(async req => {
        const {id, name, groups_users, secrets} = JSON.parse(await req.text());

        expect(id).toBe(localGroup.id);
        expect(name).toBe(localGroup.name);
        expect(groups_users).toBeUndefined();
        expect(secrets).toBeUndefined();

        return mockApiResponse({id, name, groups_users, secrets});
      });

      // 2st operation is an addition of a group manager in the group
      fetch.doMockOnce(async req => {
        const {id, name, groups_users, secrets} = JSON.parse(await req.text());

        expect(id).toBe(localGroup.id);
        expect(name).toBe(localGroup.name);
        expect(groups_users).toHaveLength(1);

        const userAdded = groups_users[0];
        expect(userAdded.user_id).toStrictEqual(users.admin.id);
        expect(userAdded.is_admin).toStrictEqual(false);

        expect(secrets).toHaveLength(2);
        const adminPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.private_decrypted);
        const adminResource1 = findSecret(secrets, userAdded.user_id, resource1Id);
        const adminResource3 = findSecret(secrets, userAdded.user_id, resource3Id);
        const adminResource1Data = await OpenpgpAssertion.readMessageOrFail(adminResource1.data);
        const adminResource3Data = await OpenpgpAssertion.readMessageOrFail(adminResource3.data);
        expect(await DecryptMessageService.decrypt(adminResource1Data, adminPrivateKey)).toBe("resource1-password");
        expect(await DecryptMessageService.decrypt(adminResource3Data, adminPrivateKey)).toBe("resource3-password");
        return mockApiResponse({id, name, groups_users, secrets});
      });

      // 3rd operation is an addition of a user in the group
      fetch.doMockOnce(async req => {
        const {id, name, groups_users, secrets} = JSON.parse(await req.text());

        expect(id).toBe(localGroup.id);
        expect(name).toBe(localGroup.name);
        expect(groups_users).toHaveLength(1);

        const userAdded = groups_users[0];
        expect(userAdded.user_id).toStrictEqual(users.betty.id);
        expect(userAdded.is_admin).toStrictEqual(false);

        expect(secrets).toHaveLength(2);
        const bettyPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted);
        const bettyResource1 = findSecret(secrets, users.betty.id, resource1Id);
        const bettyResource2 = findSecret(secrets, users.betty.id, resource2Id);
        const bettyResource1Data = await OpenpgpAssertion.readMessageOrFail(bettyResource1.data);
        const bettyResource2Data = await OpenpgpAssertion.readMessageOrFail(bettyResource2.data);
        expect(await DecryptMessageService.decrypt(bettyResource1Data, bettyPrivateKey)).toBe("resource1-password");
        expect(await DecryptMessageService.decrypt(bettyResource2Data, bettyPrivateKey)).toBe("resource2-password");

        return mockApiResponse({id, name, groups_users, secrets});
      });

      await controller.exec(dto);
    });
  });
});
