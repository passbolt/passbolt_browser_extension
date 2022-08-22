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

import {
  startAccountRecoverDto,
  startWithApprovedAccountRecoveryAccountRecoverDto
} from "../../model/entity/account/accountRecoverEntity.test.data";
import AccountRecoverEntity from "../../model/entity/account/accountRecoverEntity";
import HasRecoverUserEnabledAccountRecoveryController from "./hasRecoverUserEnabledAccountRecoveryController";

describe("HasRecoverUserEnabledAccountRecoveryController", () => {
  describe("HasRecoverUserEnabledAccountRecoveryController::exec", () => {
    it("Should return true if the user has approved the program", async() => {
      const account = new AccountRecoverEntity(startWithApprovedAccountRecoveryAccountRecoverDto());
      const controller = new HasRecoverUserEnabledAccountRecoveryController(null, null, account);

      expect.assertions(1);
      const hasApproved = await controller.exec();
      expect(hasApproved).toStrictEqual(true);
    });

    it("Should return false if the user didn't subscribe to the program yet", async() => {
      const account = new AccountRecoverEntity(startAccountRecoverDto());
      const controller = new HasRecoverUserEnabledAccountRecoveryController(null, null, account);

      expect.assertions(1);
      const hasApproved = await controller.exec();
      expect(hasApproved).toStrictEqual(false);
    });
  });
});
