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

import { defaultCallbacks } from "../network/responseFetchOffscreenService.test.data";
import {
  errorAddUsersToGroupResponseMessage,
  progressAddUsersToGroupResponseMessage,
  successAddUsersToGroupResponseMessage,
} from "./responseAddUsersToGroupOffscreenService.test.data";
import ResponseAddUsersToGroupOffscreenService from "./responseAddUsersToGroupOffscreenService";
import { defaultProgressService } from "../../../../all/background_page/service/progress/progressService.test.data";

describe("ResponseAddUsersToGroupOffscreenService", () => {
  describe("::handleAddUsersToGroupResponse", () => {
    it("should resolve the promise from the response callback", () => {
      expect.assertions(1);

      const id = crypto.randomUUID();
      const callbacks = defaultCallbacks();

      const message = successAddUsersToGroupResponseMessage({ id });
      ResponseAddUsersToGroupOffscreenService.handleAddUsersToGroupResponse(message, callbacks);

      expect(callbacks.resolve).toHaveBeenCalledTimes(1);
    });

    it("should reject the promise from the response callback", () => {
      expect.assertions(1);

      const id = crypto.randomUUID();
      const callbacks = defaultCallbacks();

      const message = errorAddUsersToGroupResponseMessage({ id });
      ResponseAddUsersToGroupOffscreenService.handleAddUsersToGroupResponse(message, callbacks);

      expect(callbacks.reject).toHaveBeenCalledTimes(1);
    });

    it("should clear the request progress service once the response is handled", () => {
      expect.assertions(1);

      const id = crypto.randomUUID();
      const callbacks = defaultCallbacks();
      const progressService = defaultProgressService({ goals: 10 });
      ResponseAddUsersToGroupOffscreenService.setProgressService(id, progressService);

      const message = successAddUsersToGroupResponseMessage({ id });
      ResponseAddUsersToGroupOffscreenService.handleAddUsersToGroupResponse(message, callbacks);

      expect(ResponseAddUsersToGroupOffscreenService._progressServices[id]).toBeUndefined();
    });
  });

  describe("::handleAddUsersToGroupProgress", () => {
    it("should update progress message of the progress service registered for the request id", () => {
      expect.assertions(2);

      const id = crypto.randomUUID();
      const progressService = defaultProgressService({ goals: 10 });
      const message = progressAddUsersToGroupResponseMessage({ id, data: { message: "update message" } });
      ResponseAddUsersToGroupOffscreenService.setProgressService(id, progressService);
      ResponseAddUsersToGroupOffscreenService.handleAddUsersToGroupProgress(message);

      expect(progressService.updateStepMessage).toHaveBeenCalledTimes(1);
      expect(progressService.updateStepMessage).toHaveBeenCalledWith(message.data.message);
    });

    it("should not throw when no progress service is registered for the request id", () => {
      expect.assertions(1);

      const message = progressAddUsersToGroupResponseMessage({ data: { message: "update message" } });

      expect(() => ResponseAddUsersToGroupOffscreenService.handleAddUsersToGroupProgress(message)).not.toThrow();
    });
  });
});
