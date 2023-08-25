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
 * @since         3.9.0
 */
import MockTabs from "../../../../../test/mocks/mockTabs";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import AuthLogoutController from "./authLogoutController";
import AuthModel from "../../model/auth/authModel";
import browser from "../../sdk/polyfill/browserPolyfill";
import {v4 as uuid} from 'uuid';

beforeEach(async() => {
  jest.clearAllMocks();
});

describe("AuthLogoutController", () => {
  describe("AuthLogoutController::exec", () => {
    it("Should sign-out the user and not redirect after for the quickaccess.", async() => {
      expect.assertions(2);
      const logoutSpy = jest.spyOn(AuthModel.prototype, "logout").mockImplementation(() => {});
      browser.tabs = new MockTabs();

      const controller = new AuthLogoutController(null, null, defaultApiClientOptions());
      await controller.exec(false);

      expect(logoutSpy).toHaveBeenCalledTimes(1);
      expect(browser.tabs.update).not.toHaveBeenCalled();
    });

    it("Should sign-out the user and redirect after.", async() => {
      expect.assertions(3);
      const logoutSpy = jest.spyOn(AuthModel.prototype, "logout").mockImplementation(() => {});
      browser.tabs = new MockTabs();

      const worker = {
        tab: {
          id: uuid(),
        },
      };
      const apiClientOptions = defaultApiClientOptions();

      const controller = new AuthLogoutController(worker, null, apiClientOptions);
      await controller.exec(true);

      expect(logoutSpy).toHaveBeenCalledTimes(1);
      expect(browser.tabs.update).toHaveBeenCalledTimes(1);
      expect(browser.tabs.update).toHaveBeenCalledWith(worker.tab.id, {url: apiClientOptions.getBaseUrl().toString()});
    });
  });
});
