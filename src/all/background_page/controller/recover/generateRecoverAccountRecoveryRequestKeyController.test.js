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

import GenerateRecoverAccountRecoveryRequestKeyController from "./generateRecoverAccountRecoveryRequestKeyController";
import {
  initialAccountRecoverDto,
  startAccountRecoverDto
} from "../../model/entity/account/accountRecoverEntity.test.data";
import AccountRecoverEntity from "../../model/entity/account/accountRecoverEntity";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";

describe("GenerateRecoverAccountRecoveryRequestKeyController", () => {
  describe("GenerateRecoverAccountRecoveryRequestKeyController::exec", () => {
    it("Should assert provided generate key pair dto is valid.", async() => {
      await MockExtension.withConfiguredAccount();
      const account = new AccountRecoverEntity(initialAccountRecoverDto());
      const controller = new GenerateRecoverAccountRecoveryRequestKeyController(null, null, defaultApiClientOptions(), account);

      expect.assertions(2);
      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("Could not validate entity GenerateGpgKeyPairOptionsEntity.");
      await expect(promise).rejects.toThrowEntityValidationErrorOnProperties(["passphrase", "email"]);
    });

    it("Should generate a key pair.", async() => {
      await MockExtension.withConfiguredAccount();
      const account = new AccountRecoverEntity(startAccountRecoverDto());
      const controller = new GenerateRecoverAccountRecoveryRequestKeyController(null, null, defaultApiClientOptions(), account);

      expect.assertions(3);
      const generateKeyPairDto = {
        passphrase: "passphrase"
      };
      await controller.exec(generateKeyPairDto);
      expect(account.userPublicArmoredKey).not.toBeNull();
      expect(account.userPrivateArmoredKey).not.toBeNull();
      expect(account.userKeyFingerprint).not.toBeNull();
    }, 20000);
  });
});
