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

import BuildAccountSetupService from "./buildAccountSetupService";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";

describe("BuildAccountSetupService", () => {
  describe("BuildAccountSetupService:buildFromUrl", () => {
    it("should not build if parameter url is not a string.", () => {
      const url = 42;
      expect.assertions(1);
      expect(() => BuildAccountSetupService.buildFromSetupUrl(url)).toThrowError("Url should be a valid string.");
    });

    it("should not build if url cannot be parsed.", () => {
      const url = "https://passbolt.dev/setup/start";
      expect.assertions(1);
      expect(() => BuildAccountSetupService.buildFromSetupUrl(url)).toThrowError();
    });

    it("should build.", () => {
      const url = "https://passbolt.dev/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0";
      expect.assertions(5);
      const accountSetup = BuildAccountSetupService.buildFromSetupUrl(url);
      expect(accountSetup).toBeInstanceOf(AccountSetupEntity);
      expect(accountSetup.type).toBe(AccountSetupEntity.TYPE_ACCOUNT_SETUP);
      expect(accountSetup.domain).toBe("https://passbolt.dev");
      expect(accountSetup.userId).toBe("571bec7e-6cce-451d-b53a-f8c93e147228");
      expect(accountSetup.authenticationTokenToken).toBe("5ea0fc9c-b180-4873-8e00-9457862e43e0");
    });
  });
});
