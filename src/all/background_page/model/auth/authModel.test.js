/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.1.0
 */
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AuthModel from "../../model/auth/authModel";
import AuthLogoutService from "passbolt-styleguide/src/shared/services/api/auth/AuthLogoutService";

beforeEach(async() => {
  jest.clearAllMocks();
});

describe("AuthModel", () => {
  describe("AuthModel::logout", () => {
    it("Should call the AuthService to logout and dispatch a logout event", async() => {
      expect.assertions(3);
      const apiClientOptions = defaultApiClientOptions();
      const model = new AuthModel(apiClientOptions);

      const logoutServiceSpy = jest.spyOn(AuthLogoutService.prototype, "logout").mockImplementation(() => {});
      const dispatchEventSpy = jest.spyOn(self, "dispatchEvent");

      await model.logout();

      expect(logoutServiceSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(dispatchEventSpy).toHaveBeenCalledWith(new Event("passbolt.auth.after-logout"));
    });
  });
});
