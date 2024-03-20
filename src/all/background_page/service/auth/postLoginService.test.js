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
 * @since         4.7.0
 */
import PostLoginService from "./postLoginService";
import StartLoopAuthSessionCheckService from "./startLoopAuthSessionCheckService";

beforeEach(async() => {
  jest.clearAllMocks();
});

describe("PostLoginService", () => {
  describe("PostLoinService::postLogin", () => {
    it("Should call the start loop auth session check service and dispatch a post login event", async() => {
      expect.assertions(2);
      jest.spyOn(StartLoopAuthSessionCheckService.prototype, "exec");
      jest.spyOn(self, "dispatchEvent");

      await PostLoginService.postLogin();

      expect(StartLoopAuthSessionCheckService.prototype.exec).toHaveBeenCalled();
      expect(self.dispatchEvent).toHaveBeenCalledWith(new Event('passbolt.auth.after-login'));
    });
  });
});
