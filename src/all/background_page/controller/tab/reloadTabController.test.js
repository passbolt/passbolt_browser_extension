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
 * @since         4.7.0
 */
import ReloadTabController from "./reloadTabController";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ReloadTabController", () => {
  describe("ReloadTabController::exec", () => {
    it("Should reload the tab.", async() => {
      const tab = {id: 1};
      const controller = new ReloadTabController({tab: tab}, null);
      jest.spyOn(browser.tabs, "reload");

      expect.assertions(1);
      await controller.exec();
      expect(browser.tabs.reload).toHaveBeenCalledWith(tab.id);
    });

    it("Should not add the account to the local storage if the complete API request fails.", async() => {
      const controller = new ReloadTabController(null, null);
      const promise = controller.exec();

      expect.assertions(1);
      await expect(promise).rejects.toThrow();
    });
  });
});
