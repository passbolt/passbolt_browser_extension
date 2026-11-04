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

import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";

import DeleteSubscriptionKeyController from "./deleteSubscriptionKeyController";
import PostLogoutService from "../../service/auth/postLogoutService";
import FindAndUpdateActiveSessionSessionStorageService from "../../service/activeSession/findAndUpdateActiveSessionSessionStorageService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

describe("DeleteSubscriptionKeyController", () => {
  const account = new AccountEntity(defaultAccountDto());

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(FindAndUpdateActiveSessionSessionStorageService.prototype, "resetAuthentication").mockResolvedValue();
  });

  describe("::exec", () => {
    it("should delete the subscription key, mark the active session as signed out and log the user out", async () => {
      expect.assertions(4);

      const controller = new DeleteSubscriptionKeyController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.deleteSubscriptionService, "delete").mockResolvedValue(undefined);
      jest.spyOn(PostLogoutService, "exec").mockImplementation(async () => {});

      await expect(controller.exec()).resolves.toBeUndefined();
      expect(controller.deleteSubscriptionService.delete).toHaveBeenCalledTimes(1);
      expect(FindAndUpdateActiveSessionSessionStorageService.prototype.resetAuthentication).toHaveBeenCalledTimes(1);
      expect(PostLogoutService.exec).toHaveBeenCalledTimes(1);
    });

    it("should not catch errors", async () => {
      expect.assertions(3);

      const expectedError = new Error("Something went wrong!");
      const controller = new DeleteSubscriptionKeyController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.deleteSubscriptionService, "delete").mockRejectedValue(expectedError);
      jest.spyOn(PostLogoutService, "exec").mockImplementation(async () => {});

      await expect(controller.exec()).rejects.toStrictEqual(expectedError);
      expect(FindAndUpdateActiveSessionSessionStorageService.prototype.resetAuthentication).not.toHaveBeenCalled();
      expect(PostLogoutService.exec).not.toHaveBeenCalled();
    });
  });
});
