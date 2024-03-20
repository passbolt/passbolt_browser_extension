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
 * @since         4.6.0
 */

import OnExtensionUpdateAvailableController from "./onExtensionUpdateAvailableController";
import AuthenticationStatusService from "../../service/authenticationStatusService";
import MockExtension from "../../../../../test/mocks/mockExtension";
import MfaAuthenticationRequiredError from "../../error/mfaAuthenticationRequiredError";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("OnExtensionInstalledController", () => {
  describe("OnExtensionInstalledController::exec", () => {
    it("Should exec update if the user is not signed-in", async() => {
      expect.assertions(1);
      // mock function
      MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => false);
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update if the user is not valid", async() => {
      expect.assertions(1);
      // mock function
      MockExtension.withMissingPrivateKeyAccount();
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update only when the user is signed-out", async() => {
      expect.assertions(2);
      // mock function
      MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => true);
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).not.toHaveBeenCalled();
      self.dispatchEvent(new Event('passbolt.auth.after-logout'));
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update if an error occurred and there is no possibility to check if the user is authenticated", async() => {
      expect.assertions(1);
      // mock function
      MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => { throw new Error("Error"); });
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should not exec update when the user is not fully signed-in", async() => {
      expect.assertions(2);
      // mock function
      MockExtension.withConfiguredAccount();
      jest.spyOn(AuthenticationStatusService, "isAuthenticated").mockImplementation(() => { throw new MfaAuthenticationRequiredError(); });
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).not.toHaveBeenCalled();
      self.dispatchEvent(new Event('passbolt.auth.after-logout'));
      //can't use toHaveBeenCalledTimes(1) as the event is called multiple times due to the test
      expect(browser.runtime.reload).toHaveBeenCalled();
    });
  });
});
