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

describe("GetAccountRecoveryOrganizationPolicyController", () => {
  describe("GetAccountRecoveryOrganizationPolicyController::exec", () => {
    it("Should return the account recovery organization policy", async() => {
      const runtimeMemory = {
        accountRecoveryOrganizationPolicy: new AccountRecoveryOrganizationPolicyEntity(enabledAccountRecoveryOrganizationPolicyDto())
      };
      const controller = new GetAccountRecoveryOrganizationPolicyController(null, null, runtimeMemory);

      expect.assertions(1);
      const accountRecoveryOrganizationPolicy = await controller.exec();
      expect(accountRecoveryOrganizationPolicy).toBeInstanceOf(AccountRecoveryOrganizationPolicyEntity);
    });

    it("Should not return the account recovery organization policy if not defined", async() => {
      const runtimeMemory = {};
      const controller = new GetAccountRecoveryOrganizationPolicyController(null, null, runtimeMemory);

      expect.assertions(1);
      const accountRecoveryOrganizationPolicy = await controller.exec();
      expect(accountRecoveryOrganizationPolicy).toBeUndefined();
    });
  });
});
