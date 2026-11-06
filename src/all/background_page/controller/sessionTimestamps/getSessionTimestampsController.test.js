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
 * @since         5.18.0
 */
import GetSessionTimestampsController from "./getSessionTimestampsController";
import SessionTimestampsEntity from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity";
import { defaultSessionTimestampsDto } from "passbolt-styleguide/src/shared/models/entity/sessionTimestamps/sessionTimestampsEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetSessionTimestampsController", () => {
  let account, worker, controller;

  beforeEach(async () => {
    account = new AccountEntity(defaultAccountDto());
    worker = { port: { emit: jest.fn() } };
    controller = new GetSessionTimestampsController(worker, "request-id", account);
    await controller.getSessionTimestampsService.sessionTimestampsLocalStorage.flush();
  });

  describe("::exec", () => {
    it("should return the session timestamps stored in the local storage.", async () => {
      expect.assertions(2);
      const sessionTimestampsDto = defaultSessionTimestampsDto();
      await controller.getSessionTimestampsService.sessionTimestampsLocalStorage.setData(
        new SessionTimestampsEntity(sessionTimestampsDto),
      );

      const result = await controller.exec();

      expect(result).toBeInstanceOf(SessionTimestampsEntity);
      expect(result.toDto()).toEqual(sessionTimestampsDto);
    });

    it("should return null if no session timestamps are stored.", async () => {
      expect.assertions(1);
      const result = await controller.exec();
      expect(result).toBeNull();
    });

    it("should throw if the session timestamps cannot be retrieved.", async () => {
      expect.assertions(1);
      const error = new Error("Failed to retrieve the session timestamps");
      jest.spyOn(controller.getSessionTimestampsService, "get").mockRejectedValue(error);

      await expect(controller.exec()).rejects.toThrow(error.message);
    });
  });

  describe("::_exec", () => {
    it("should emit SUCCESS with the session timestamps on the worker port.", async () => {
      expect.assertions(1);
      const sessionTimestampsEntity = new SessionTimestampsEntity(defaultSessionTimestampsDto());
      await controller.getSessionTimestampsService.sessionTimestampsLocalStorage.setData(sessionTimestampsEntity);

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith("request-id", "SUCCESS", sessionTimestampsEntity);
    });

    it("should emit SUCCESS with null on the worker port if no session timestamps are stored.", async () => {
      expect.assertions(1);
      await controller._exec();
      expect(worker.port.emit).toHaveBeenCalledWith("request-id", "SUCCESS", null);
    });

    it("should emit ERROR on the worker port if the session timestamps cannot be retrieved.", async () => {
      expect.assertions(1);
      const error = new Error("Failed to retrieve the session timestamps");
      jest.spyOn(controller.getSessionTimestampsService, "get").mockRejectedValue(error);
      jest.spyOn(console, "error").mockImplementation(() => {});

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith("request-id", "ERROR", error);
    });
  });
});
