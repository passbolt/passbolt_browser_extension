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

import BuildAccountRecoverService from "./buildAccountRecoverService";
import AccountRecoverEntity from "../../model/entity/account/accountRecoverEntity";

describe("BuildAccountRecoverService", () => {
  describe("BuildAccountRecoverService:buildFromUrl", () => {
    it("should not build if parameter url is not a string.", () => {
      const url = 42;
      expect.assertions(1);
      expect(() => BuildAccountRecoverService.buildFromRecoverUrl(url)).toThrowError("Url should be a valid string.");
    });

    it("should not build if url cannot be parsed.", () => {
      const url = "https://passbolt.dev/setup/recover/start";
      expect.assertions(1);
      expect(() => BuildAccountRecoverService.buildFromRecoverUrl(url)).toThrowError();
    });

    it("should build.", () => {
      const url = "https://passbolt.dev/setup/recover/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0";
      expect.assertions(5);
      const account = BuildAccountRecoverService.buildFromRecoverUrl(url);
      expect(account).toBeInstanceOf(AccountRecoverEntity);
      expect(account.type).toBe(AccountRecoverEntity.TYPE_ACCOUNT_RECOVER);
      expect(account.domain).toBe("https://passbolt.dev");
      expect(account.userId).toBe("571bec7e-6cce-451d-b53a-f8c93e147228");
      expect(account.authenticationTokenToken).toBe("5ea0fc9c-b180-4873-8e00-9457862e43e0");
    });
  });
});
