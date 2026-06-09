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

import Validator from "validator";
import { v4 as uuidv4 } from "uuid";
import HandleOffscreenResponseService from "../offscreen/handleOffscreenResponseService";
import { SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN } from "../../../offscreens/service/group/addUsersToGroupOffscreenService";
import { RequestAddUsersToGroupOffscreenService } from "./requestAddUsersToGroupOffscreenService";
import ResponseAddUsersToGroupOffscreenService from "./responseAddUsersToGroupOffscreenService";
import AccountEntity from "../../../../all/background_page/model/entity/account/accountEntity";
import { defaultAccountDto } from "../../../../all/background_page/model/entity/account/accountEntity.test.data";
import GroupUpdateDryRunResultEntity from "../../../../all/background_page/model/entity/group/update/groupUpdateDryRunResultEntity";
import ProgressService from "../../../../all/background_page/service/progress/progressService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RequestAddUsersToGroupOffscreenService", () => {
  describe("::sendOffscreenMessage", () => {
    it("should send a message to the offscreen document", async () => {
      expect.assertions(1);
      const id = uuidv4();
      const data = { addUsersToGroupContent: {} };
      const target = SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN;

      await RequestAddUsersToGroupOffscreenService.sendOffscreenMessage(id, data);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ id, data, target });
    });
  });

  describe("::decryptAndEncryptSecrets", () => {
    it("should send a message to the offscreen document and stack the response callback handlers", async () => {
      expect.assertions(7);

      let sentMessage;
      jest.spyOn(chrome.runtime, "sendMessage").mockImplementationOnce((message) => {
        sentMessage = message;
        HandleOffscreenResponseService._offscreenResponsePromisesCallbacks[message.id].resolve();
      });

      const account = new AccountEntity(defaultAccountDto());
      const passphrase = "ada@passbolt.com";
      const groupUpdateDryRunEntity = new GroupUpdateDryRunResultEntity({ secrets: [], needed_secrets: [] });
      const progressService = new ProgressService(null, "RequestAddUsersToGroupOffscreenService");
      const requestPromise = RequestAddUsersToGroupOffscreenService.decryptAndEncryptSecrets(
        account,
        passphrase,
        groupUpdateDryRunEntity,
        {},
        progressService,
      );

      const addUserToGroup = {
        privateKey: {
          armoredKey: account.userPrivateArmoredKey,
          passphrase: passphrase,
        },
        secrets: groupUpdateDryRunEntity.secrets.toDto(),
        neededSecrets: groupUpdateDryRunEntity.neededSecrets.toDto(),
        usersPublicKeys: {},
      };

      jest.spyOn(ResponseAddUsersToGroupOffscreenService, "setProgressService");

      expect(requestPromise).toBeInstanceOf(Promise);
      await expect(requestPromise).resolves.not.toThrow();

      expect(Validator.isUUID(sentMessage.id)).toBe(true);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(1);
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        id: sentMessage.id,
        data: { requestId: sentMessage.id, addUsersToGroupContent: addUserToGroup },
        target: SEND_MESSAGE_TARGET_ADD_USERS_TO_GROUP_OFFSCREEN,
      });
      expect(ResponseAddUsersToGroupOffscreenService.setProgressService).toHaveBeenCalledTimes(1);
      expect(ResponseAddUsersToGroupOffscreenService.setProgressService).toHaveBeenCalledWith(
        sentMessage.id,
        progressService,
      );
    });

    it("should throw if the message cannot be sent to the offscreen document for unexpected reason", async () => {
      expect.assertions(1);
      jest.spyOn(chrome.runtime, "sendMessage").mockImplementationOnce(() => {
        throw new Error("Test error");
      });

      const account = new AccountEntity(defaultAccountDto());
      const groupUpdateDryRunEntity = new GroupUpdateDryRunResultEntity([]);
      const progressService = new ProgressService(null, "RequestAddUsersToGroupOffscreenService");

      await expect(() =>
        RequestAddUsersToGroupOffscreenService.decryptAndEncryptSecrets(
          account,
          "test",
          groupUpdateDryRunEntity,
          {},
          progressService,
        ),
      ).rejects.toThrow();
    });
  });
});
