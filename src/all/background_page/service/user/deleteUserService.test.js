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

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import DeleteUserService from "./deleteUserService";
import {v4 as uuidv4} from "uuid";
import DeleteDryRunError from "../../error/deleteDryRunError";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import UserDeleteTransferEntity from "../../model/entity/user/transfer/userDeleteTransferEntity";
import {defaultUserDeleteTransferDto} from "passbolt-styleguide/src/shared/models/entity/user/userDeleteTransferEntity.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import UserLocalStorage from "../local_storage/userLocalStorage";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DeleteUserService", () => {
  let deleteUserService, apiClientOptions;
  const account = new AccountEntity(defaultAccountDto());

  beforeEach(async() => {
    apiClientOptions = defaultApiClientOptions();
    deleteUserService = new DeleteUserService(account, apiClientOptions);
  });

  describe("::deleteDryRun", () => {
    it("Do not need to transfer ownership.", async() => {
      expect.assertions(1);

      const usersId = uuidv4();
      jest.spyOn(deleteUserService.userServiceApi, "delete").mockImplementationOnce(() => {});

      await deleteUserService.deleteDryRun(usersId);

      expect(deleteUserService.userServiceApi.delete).toHaveBeenCalledWith(usersId, {}, true);
    });

    it("Need to transfer ownership.", async() => {
      expect.assertions(1);

      const usersId = uuidv4();
      const resourceDto = defaultResourceDto();
      const error = {
        code: 400,
        body: {
          errors: {
            resources: {
              sole_owner: [resourceDto]
            }
          }
        }
      };
      jest.spyOn(deleteUserService.userServiceApi, "delete").mockImplementationOnce(() => { throw new PassboltApiFetchError("Error", error); });

      try {
        await deleteUserService.deleteDryRun(usersId);
      } catch (error) {
        expect(error).toBeInstanceOf(DeleteDryRunError);
      }
    });

    it("throw any error not handled.", async() => {
      expect.assertions(1);

      const usersId = uuidv4();
      const error = {
        code: 404,
      };
      jest.spyOn(deleteUserService.userServiceApi, "delete").mockImplementationOnce(() => { throw new PassboltApiFetchError("Error", error); });

      try {
        await deleteUserService.deleteDryRun(usersId);
      } catch (error) {
        expect(error).toBeInstanceOf(PassboltApiFetchError);
      }
    });

    it("throws if user id is not an uuid.", async() => {
      expect.assertions(1);

      const promise = deleteUserService.deleteDryRun({});

      expect(promise).rejects.toThrow(Error("The parameter \"userId\" should be a UUID"));
    });
  });

  describe("::delete", () => {
    it("delete a user with no transfer.", async() => {
      expect.assertions(2);

      const usersId = uuidv4();
      jest.spyOn(deleteUserService.userServiceApi, "delete").mockImplementationOnce(() => {});
      jest.spyOn(UserLocalStorage, "delete").mockImplementationOnce(() => {});

      await deleteUserService.delete(usersId, null);

      expect(deleteUserService.userServiceApi.delete).toHaveBeenCalledWith(usersId, {});
      expect(UserLocalStorage.delete).toHaveBeenCalledWith(usersId);
    });

    it("delete a user with transfer.", async() => {
      expect.assertions(2);

      const usersId = uuidv4();
      const dto = defaultUserDeleteTransferDto();
      const userDeleteTransfer = new UserDeleteTransferEntity(dto);
      jest.spyOn(deleteUserService.userServiceApi, "delete").mockImplementationOnce(() => {});
      jest.spyOn(UserLocalStorage, "delete").mockImplementationOnce(() => {});

      await deleteUserService.delete(usersId, userDeleteTransfer);

      expect(deleteUserService.userServiceApi.delete).toHaveBeenCalledWith(usersId, dto);
      expect(UserLocalStorage.delete).toHaveBeenCalledWith(usersId);
    });

    it("delete a user with an error and need to transfer ownership.", async() => {
      expect.assertions(1);

      const usersId = uuidv4();
      const resourceDto = defaultResourceDto();
      const error = {
        code: 400,
        body: {
          errors: {
            resources: {
              sole_owner: [resourceDto]
            }
          }
        }
      };
      jest.spyOn(deleteUserService.userServiceApi, "delete").mockImplementationOnce(() => { throw new PassboltApiFetchError("Error", error); });

      try {
        await deleteUserService.delete(usersId, null);
      } catch (error) {
        expect(error).toBeInstanceOf(DeleteDryRunError);
      }
    });

    it("delete a user with an unexpected error.", async() => {
      expect.assertions(1);

      const usersId = uuidv4();
      const error = {
        code: 404,
      };
      jest.spyOn(deleteUserService.userServiceApi, "delete").mockImplementationOnce(() => { throw new PassboltApiFetchError("Error", error); });

      try {
        await deleteUserService.delete(usersId, null);
      } catch (error) {
        expect(error).toBeInstanceOf(PassboltApiFetchError);
      }
    });

    it("throws if user id is not an uuid.", async() => {
      expect.assertions(1);

      const promise = deleteUserService.delete({});

      expect(promise).rejects.toThrow(Error("The parameter \"userId\" should be a UUID"));
    });
  });
});
