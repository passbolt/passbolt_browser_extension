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

import User from "../../model/user";
import GpgAuth from "../../model/gpgauth";
import OnExtensionUpdateAvailableController from "./onExtensionUpdateAvailableController";

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
      jest.spyOn(User.getInstance(), "isValid").mockImplementationOnce(() => true);
      jest.spyOn(GpgAuth.prototype, "isAuthenticated").mockImplementation(() => false);
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update if the user is not valid", async() => {
      expect.assertions(1);
      // mock function
      jest.spyOn(User.getInstance(), "isValid").mockImplementationOnce(() => false);
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });

    it("Should exec update only when the user is signed-out", async() => {
      expect.assertions(2);
      // mock function
      jest.spyOn(User.getInstance(), "isValid").mockImplementationOnce(() => true);
      jest.spyOn(GpgAuth.prototype, "isAuthenticated").mockImplementation(() => true);
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
      jest.spyOn(User.getInstance(), "isValid").mockImplementationOnce(() => true);
      jest.spyOn(GpgAuth.prototype, "isAuthenticated").mockImplementation(() => { throw new Error("Error"); });
      jest.spyOn(browser.runtime, "reload");
      // process
      await OnExtensionUpdateAvailableController.exec();
      // expectation
      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
    });
  });
});
