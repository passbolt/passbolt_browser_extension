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

import IsExtensionFirstInstallController from "./isExtensionFirstInstallController";

describe("IsExtensionFirstInstallController", () => {
  describe("IsExtensionFirstInstallController::exec", () => {
    it("Should return false if it's not the extension first install.", async() => {
      const mockedWorker = {
        tab: {
          url: "moz-extension://134c1a66-c6e3-1343-a5d4-63c511465c17/data/app.html"
        }
      };
      const controller = new IsExtensionFirstInstallController(mockedWorker);
      const check = await controller.exec();

      expect.assertions(1);
      await expect(check).toEqual(false);
    });

    it("Should return true if it's the extension first install.", async() => {
      const mockedWorker = {
        tab: {
          url: "moz-extension://134c1a66-c6e3-1343-a5d4-63c511465c17/data/app.html?first-install=1"
        }
      };
      const controller = new IsExtensionFirstInstallController(mockedWorker);
      const check = await controller.exec();

      expect.assertions(1);
      await expect(check).toEqual(true);
    });
  });
});
