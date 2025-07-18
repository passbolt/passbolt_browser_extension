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
 * @since         5.4.0
 */
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import ResourceDeleteController from "./resourceDeleteController";
import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuidv4} from "uuid";

jest.mock("../../service/progress/progressService");

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
});

describe("ResourceDeleteController", () => {
  let controller, worker;

  beforeEach(() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
  });

  describe("::exec", () => {
    it("should call deletion of IDs for the requested ids", async() => {
      expect.assertions(6);
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      controller = new ResourceDeleteController(worker, null, apiClientOptions, account);

      const resourceId1 = uuidv4();
      const resourceId2 = uuidv4();
      const resourceId3 = uuidv4();

      jest.spyOn(controller.resourceDeleteService, "deleteResources").mockImplementation(() => {});

      await controller.exec([resourceId1, resourceId2, resourceId3]);

      expect(controller.progressService.start).toHaveBeenCalledTimes(1);
      expect(controller.progressService.start).toHaveBeenCalledWith(2, "Deleting Resource(s)");
      expect(controller.progressService.close).toHaveBeenCalledTimes(1);
      expect(controller.progressService.finishStep).toHaveBeenCalledTimes(1);

      expect(controller.resourceDeleteService.deleteResources).toHaveBeenCalledTimes(1);
      expect(controller.resourceDeleteService.deleteResources).toHaveBeenCalledWith([resourceId1, resourceId2, resourceId3]);
    });

    it("Should close progressService when delete succeeds", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      controller = new ResourceDeleteController(worker, null, apiClientOptions, account);

      const resourceId1 = uuidv4();
      const resourceId2 = uuidv4();
      const resourceId3 = uuidv4();

      jest.spyOn(controller.resourceDeleteService, "deleteResources").mockImplementation(() => {});

      await controller.exec([resourceId1, resourceId2, resourceId3]);
      expect(controller.progressService.close).toHaveBeenCalledTimes(1);
    });

    it("Should close progressService when deletion fails", async() => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      controller = new ResourceDeleteController(worker, null, apiClientOptions, account);

      const resourceId1 = uuidv4();
      const resourceId2 = uuidv4();
      const resourceId3 = uuidv4();

      jest.spyOn(controller.resourceDeleteService, "deleteResources").mockImplementation(() => { throw new Error(); });

      try {
        await controller.exec([resourceId1, resourceId2, resourceId3]);
      } catch {
        expect(controller.progressService.close).toHaveBeenCalledTimes(1);
      }
    });

    it("Should throw an error if the resource IDs are not valid UUID array", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = defaultApiClientOptions();
      const controller = new ResourceDeleteController(null, null, apiClientOptions, account);

      const expectedError = new TypeError("The given parameter is not a valid array of uuid");
      try {
        await controller.exec("42");
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
