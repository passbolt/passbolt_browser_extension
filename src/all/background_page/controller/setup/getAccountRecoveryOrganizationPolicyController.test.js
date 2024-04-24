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

import GetAccountRecoveryOrganizationPolicyController from "./getAccountRecoveryOrganizationPolicyController";
import {enabledAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import AccountRecoveryOrganizationPolicyEntity from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";

describe("GetAccountRecoveryOrganizationPolicyController", () => {
  describe("GetAccountRecoveryOrganizationPolicyController::exec", () => {
    it("Should return the account recovery organization policy", async() => {
      const accountRecoveryOrganizationPolicy = new AccountRecoveryOrganizationPolicyEntity(enabledAccountRecoveryOrganizationPolicyDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({accountRecoveryOrganizationPolicy: accountRecoveryOrganizationPolicy}));

      const controller = new GetAccountRecoveryOrganizationPolicyController({port: {_port: {name: "test"}}}, null);

      expect.assertions(1);
      const accountRecoveryOrganizationPolicyReceived = await controller.exec();
      expect(accountRecoveryOrganizationPolicyReceived).toBeInstanceOf(AccountRecoveryOrganizationPolicyEntity);
    });

    it("Should not return the account recovery organization policy if not defined", async() => {
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => null);
      const controller = new GetAccountRecoveryOrganizationPolicyController({port: {_port: {name: "test"}}}, null);

      expect.assertions(1);
      const accountRecoveryOrganizationPolicy = await controller.exec();
      expect(accountRecoveryOrganizationPolicy).toBeUndefined();
    });
  });
});
