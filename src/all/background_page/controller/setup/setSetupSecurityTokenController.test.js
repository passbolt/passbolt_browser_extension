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

import SetSetupSecurityTokenController from "./setSetupSecurityTokenController";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";
import {withUserKeyAccountSetupDto} from "../../model/entity/account/accountSetupEntity.test.data";
import {defaultSecurityTokenDto} from "../../model/entity/securityToken/SecurityTokenEntity.test.data";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";

describe("SetSetupSecurityTokenController", () => {
  describe("SetSetupSecurityTokenController::exec", () => {
    it("Should set the setup security token.", async() => {
      const account = new AccountSetupEntity(withUserKeyAccountSetupDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account}));
      jest.spyOn(AccountTemporarySessionStorageService, "set").mockImplementationOnce(() => jest.fn());
      const controller = new SetSetupSecurityTokenController({port: {_port: {name: "test"}}}, null);
      const securityTokenDto = defaultSecurityTokenDto();
      await controller.exec(securityTokenDto);

      expect.assertions(1);
      await expect(account.securityToken.toDto()).toEqual(securityTokenDto);
    });

    it("Should raise an error if no account has been found.", async() => {
      const controller = new SetSetupSecurityTokenController({port: {_port: {name: "test"}}}, null);
      expect.assertions(1);
      const securityTokenDto = defaultSecurityTokenDto();
      try {
        await controller.exec(securityTokenDto);
      } catch (error) {
        expect(error.message).toEqual("You have already started the process on another tab.");
      }
    });
  });
});
