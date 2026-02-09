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
 * @since         5.10.0
 */
import CheckForPermissionUpdateService from "./checkForPermissionUpdateService";

beforeEach(() => {
  jest.clearAllMocks();
  CheckForPermissionUpdateService.stop();

  // polyfill permissions
  browser.permissions.onAdded.removeListener = jest.fn();
});

describe("CheckForPermissionUpdateService", () => {
  describe("::start", () => {
    it("Should add a listener on browser.permissions.onAdded", () => {
      expect.assertions(1);
      // mock data
      const worker = { port: { request: jest.fn() } };
      // mock functions
      jest.spyOn(browser.permissions.onAdded, "addListener");
      // process
      CheckForPermissionUpdateService.start(worker);
      // expectations
      expect(browser.permissions.onAdded.addListener).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("::stop", () => {
    it("Should remove the listener from browser.permissions.onAdded", () => {
      expect.assertions(1);
      // mock data
      const worker = { port: { request: jest.fn() } };
      // mock functions
      jest.spyOn(browser.permissions.onAdded, "addListener");
      jest.spyOn(browser.permissions.onAdded, "removeListener");
      // process
      CheckForPermissionUpdateService.start(worker);
      CheckForPermissionUpdateService.stop();
      // expectations
      expect(browser.permissions.onAdded.removeListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it("Should do nothing if start was not called", () => {
      expect.assertions(1);
      // mock functions
      jest.spyOn(browser.permissions.onAdded, "removeListener");
      // process
      CheckForPermissionUpdateService.stop();
      // expectations
      expect(browser.permissions.onAdded.removeListener).not.toHaveBeenCalled();
    });
  });

  describe("::_onPermissionAdded", () => {
    it("Should call worker.port.request with the permissions", () => {
      expect.assertions(1);
      // mock data
      const worker = { port: { request: jest.fn() } };
      const permissions = { origins: ["*://*/*"] };
      // process
      CheckForPermissionUpdateService.start(worker);
      CheckForPermissionUpdateService._onPermissionAdded(permissions);
      // expectations
      expect(worker.port.request).toHaveBeenCalledWith("passbolt.extension.on-permission-updated", permissions);
    });
  });
});
