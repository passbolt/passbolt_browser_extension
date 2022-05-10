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

import {enableFetchMocks} from "jest-fetch-mock";
import {AccountEntity} from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {SignInSetupController} from "./signInSetupController";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";

beforeEach(() => {
  enableFetchMocks();
});

describe("SignInSetupController", () => {
  describe("SignInSetupController::exec", () => {
    it.todo("Should sign-in the user.");
    it.todo("Should remember the passphrase.");
    it.todo("Should redirect the user to the application.");

    it("Should throw an exception if the passphrase is not a valid.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const runtimeMemory = {};
      const controller = new SignInSetupController(null, null, defaultApiClientOptions(), account, runtimeMemory);

      expect.assertions(2);
      const promiseMissingParameter = controller.exec();
      await expect(promiseMissingParameter).rejects.toThrowError("A passphrase is required.");
      const promiseInvalidTypeParameter = controller.exec();
      await expect(promiseInvalidTypeParameter).rejects.toThrowError("A passphrase is required.");
    }, 10000);

    it("Should throw an exception if the provided remember me is not a valid boolean.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const runtimeMemory = {passphrase: pgpKeys.ada.passphrase};
      const controller = new SignInSetupController(null, null, defaultApiClientOptions(), account, runtimeMemory);

      expect.assertions(1);
      const promiseInvalidTypeParameter = controller.exec(42);
      await expect(promiseInvalidTypeParameter).rejects.toThrowError("The rememberMe should be a boolean.");
    }, 10000);
  });
});
