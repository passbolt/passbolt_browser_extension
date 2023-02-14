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
 * @since         4.0.0
 */
import ConnectPortController from "./connectPortController";

describe("ConnectPortController", () => {
  beforeEach(async() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe("ConnectPortController::exec", () => {
    it("Should connect port", async() => {
      expect.assertions(1);
      // data mocked
      const port = {
        _name: "name",
        connectIfDisconnected: jest.fn()
      };
      // process
      const connectPortController = new ConnectPortController(port);
      await connectPortController.exec("name");
      // expectations
      expect(port.connectIfDisconnected).toHaveBeenCalled();
    });

    it("Should not connect port if port name is unknown", async() => {
      expect.assertions(1);
      // data mocked
      const port = {
        _name: "unknown",
        connectIfDisconnected: jest.fn()
      };
      // process
      const connectPortController = new ConnectPortController(port);
      await connectPortController.exec("name");
      // expectations
      expect(port.connectIfDisconnected).not.toHaveBeenCalled();
    });
  });
});
