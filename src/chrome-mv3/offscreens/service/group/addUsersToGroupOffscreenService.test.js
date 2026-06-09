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
import AddUsersToGroupOffscreenService, {
  ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_ERROR,
  ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_PROGRESS,
  ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_SUCCESS,
  SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_HANDLER,
  SEND_MESSAGE_TARGET_OFFSCREEN_PROGRESS_SERVICE_HANDLER,
} from "./addUsersToGroupOffscreenService";
import { defaultGroupDto } from "passbolt-styleguide/src/shared/models/entity/group/groupEntity.test.data";
import GroupEntity from "passbolt-styleguide/src/shared/models/entity/group/groupEntity";
import GroupUserEntity from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity";
import { createGroupUser } from "passbolt-styleguide/src/shared/models/entity/groupUser/groupUserEntity.test.data";
import { defaultResourcesSecretsDtos } from "../../../../all/background_page/model/entity/secret/groupUpdate/groupUpdateSecretsCollection.test.data";
import { OpenpgpAssertion } from "../../../../all/background_page/utils/openpgp/openpgpAssertions";
import { plaintextSecretPasswordAndDescriptionDto } from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import EncryptMessageService from "../../../../all/background_page/service/crypto/encryptMessageService";
import AccountEntity from "../../../../all/background_page/model/entity/account/accountEntity";
import { defaultAccountDto } from "../../../../all/background_page/model/entity/account/accountEntity.test.data";
import GroupUpdateDryRunResultEntity from "../../../../all/background_page/model/entity/group/update/groupUpdateDryRunResultEntity";
import { pgpKeys } from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import DecryptMessageService from "../../../../all/background_page/service/crypto/decryptMessageService";

describe("AddUsersToGroupOffscreenService", () => {
  describe("::handleRequest", () => {
    it("should decrypt and encrypt secrets for the requester", async () => {
      expect.assertions(2);

      const account = new AccountEntity(defaultAccountDto());

      const existingEntityDto = defaultGroupDto({}, { withGroupsUsers: 1 });
      const updateGroupEntity = new GroupEntity({ ...existingEntityDto });

      const newUser = new GroupUserEntity(createGroupUser({ group_id: existingEntityDto.id }));
      updateGroupEntity._groups_users._items = [...updateGroupEntity._groups_users.items, newUser];

      const secrets = defaultResourcesSecretsDtos(1);

      const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const originalDecryptedSecret = plaintextSecretPasswordAndDescriptionDto();
      secrets[0].data = await EncryptMessageService.encrypt(JSON.stringify(originalDecryptedSecret), adaPublicKey);
      const needed_secrets = [
        {
          user_id: newUser._props.user_id,
          resource_id: secrets[0].resource_id,
        },
      ];
      const groupUpdateDryRunResultDto = { needed_secrets, secrets };
      const groupUpdateDryRunEntity = new GroupUpdateDryRunResultEntity(groupUpdateDryRunResultDto);

      const result = await AddUsersToGroupOffscreenService.handleRequest({
        requestId: "11111111-1111-4111-8111-111111111111",
        addUsersToGroupContent: {
          privateKey: {
            armoredKey: account.userPrivateArmoredKey,
            passphrase: "ada@passbolt.com",
          },
          secrets: groupUpdateDryRunEntity.secrets.toDto(),
          neededSecrets: groupUpdateDryRunEntity.neededSecrets.toDto(),
          usersPublicKeys: { [newUser._props.user_id]: pgpKeys.betty.public },
        },
      });

      const expectedResult = {
        type: ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_SUCCESS,
        target: SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_HANDLER,
        data: expect.any(Object),
      };

      const decryptedData = await DecryptMessageService.decrypt(
        await OpenpgpAssertion.readMessageOrFail(result.data[0].data),
        await OpenpgpAssertion.readKeyOrFail(pgpKeys.betty.private_decrypted),
      );

      expect(JSON.parse(decryptedData)).toStrictEqual(originalDecryptedSecret);
      expect(result).toStrictEqual(expectedResult);
    });

    it("should send error if any unexpected error happen", async () => {
      expect.assertions(1);

      const result = await AddUsersToGroupOffscreenService.handleRequest({
        requestId: "11111111-1111-4111-8111-111111111111",
        addUsersToGroupContent: {},
      });

      const expectedResult = {
        type: ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_ERROR,
        target: SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_HANDLER,
        data: expect.any(Object),
      };

      expect(result).toStrictEqual(expectedResult);
    });
  });

  describe("::handleProgressResponse", () => {
    it("should send a progress message tagged with the request id", async () => {
      expect.assertions(1);

      const requestId = "11111111-1111-4111-8111-111111111111";
      jest.spyOn(chrome.runtime, "sendMessage").mockImplementation(() => {});

      await AddUsersToGroupOffscreenService.handleProgressResponse(requestId, { message: "Encrypting 1/2" });

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        id: requestId,
        data: { message: "Encrypting 1/2" },
        type: ADD_USERS_TO_GROUP_OFFSCREEN_RESPONSE_TYPE_PROGRESS,
        target: SEND_MESSAGE_TARGET_OFFSCREEN_PROGRESS_SERVICE_HANDLER,
      });
    });
  });
});
