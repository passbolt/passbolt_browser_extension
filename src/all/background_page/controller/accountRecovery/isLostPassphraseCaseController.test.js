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
import IsLostPassphraseCaseController from "./isLostPassphraseCaseController";


describe("IsLostPassphraseCaseController", () => {
  describe("IsLostPassphraseCaseController::exec", () => {
    it("Should return false if no case given in url parameter.", async() => {
      const mockedWorker = {
        tab: {
          url: "https://www.passbolt.test/setup/recover/8c55bdd1-faca-4324-b58b-8f19de62d46e/c57b7cb1-18ab-4224-bf06-4aa3217dffd8"
        }
      };
      const controller = new IsLostPassphraseCaseController(mockedWorker);
      const check = await controller.exec();

      expect.assertions(1);
      await expect(check).toEqual(false);
    });

    it("Should return false if it's not a 'lost-passphrase' case.", async() => {
      const mockedWorker = {
        tab: {
          url: "https://www.passbolt.test/setup/recover/8c55bdd1-faca-4324-b58b-8f19de62d46e/c57b7cb1-18ab-4224-bf06-4aa3217dffd8?case=bidule"
        }
      };
      const controller = new IsLostPassphraseCaseController(mockedWorker);
      const check = await controller.exec();

      expect.assertions(1);
      await expect(check).toEqual(false);
    });

    it("Should return true if it's a 'lost-passphrase' case.", async() => {
      const mockedWorker = {
        tab: {
          url: "https://www.passbolt.test/setup/recover/8c55bdd1-faca-4324-b58b-8f19de62d46e/c57b7cb1-18ab-4224-bf06-4aa3217dffd8?case=lost-passphrase"
        }
      };
      const controller = new IsLostPassphraseCaseController(mockedWorker);
      const check = await controller.exec();

      expect.assertions(1);
      await expect(check).toEqual(true);
    });
  });
});
