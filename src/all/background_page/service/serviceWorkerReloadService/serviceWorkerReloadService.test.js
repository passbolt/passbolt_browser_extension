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
 * @since         5.5.0
 */

import publicWebsiteSignInPagemod from "../../pagemod/publicWebsiteSignInPagemod";
import webIntegrationPagemod from "../../pagemod/webIntegrationPagemod";
import BrowserExtensionUpdatedLocalStorage from "../local_storage/browserExtensionUpdatedLocalStorage";
import WorkerService from "../worker/workerService";
import ServiceWorkerReloadService from "./serviceWorkerReloadService";

describe("ServiceWorkerReloadService", () => {
  describe("::reloadIfNecessary", () => {
    it("should not reload the service worker if it is not necessary", async() => {
      expect.assertions(2);

      jest.spyOn(browser.runtime, "reload").mockImplementation(() => {});
      jest.spyOn(WorkerService, "destroyWorkersByName").mockImplementation(() => {});

      await ServiceWorkerReloadService.reloadIfNecessary();

      expect(browser.runtime.reload).not.toHaveBeenCalled();
      expect(WorkerService.destroyWorkersByName).not.toHaveBeenCalled();
    });

    it("should reload the service worker if it is necessary", async() => {
      expect.assertions(4);

      const storage = new BrowserExtensionUpdatedLocalStorage();
      await storage.set(Date.now());

      jest.spyOn(browser.runtime, "reload").mockImplementation(() => {});
      jest.spyOn(WorkerService, "destroyWorkersByName").mockImplementation(() => {});

      await ServiceWorkerReloadService.reloadIfNecessary();

      expect(browser.runtime.reload).toHaveBeenCalledTimes(1);
      expect(WorkerService.destroyWorkersByName).toHaveBeenCalledTimes(1);
      expect(WorkerService.destroyWorkersByName).toHaveBeenCalledWith([webIntegrationPagemod.appName, publicWebsiteSignInPagemod.appName]);

      const storedData = await storage.get();
      expect(storedData).toBeUndefined();
    });
  });
});
