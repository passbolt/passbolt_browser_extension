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
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";

describe("GenerateRecoverAccountRecoveryRequestKeyController", () => {
  describe("GenerateRecoverAccountRecoveryRequestKeyController::exec", () => {
    it("Should assert provided generate key pair dto is valid.", async() => {
      await MockExtension.withConfiguredAccount();
      const account = new AccountRecoverEntity(initialAccountRecoverDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account}));
      const controller = new GenerateRecoverAccountRecoveryRequestKeyController({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());

      expect.assertions(2);
      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("Could not validate entity GenerateGpgKeyPairOptionsEntity.");
      await expect(promise).rejects.toThrowEntityValidationErrorOnProperties(["passphrase", "email"]);
    });

    it("Should generate a key pair.", async() => {
      await MockExtension.withConfiguredAccount();
      const account = new AccountRecoverEntity(startAccountRecoverDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account}));
      jest.spyOn(AccountTemporarySessionStorageService, "set").mockImplementationOnce(() => jest.fn());
      const controller = new GenerateRecoverAccountRecoveryRequestKeyController({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());

      expect.assertions(3);
      const generateKeyPairDto = {
        passphrase: "passphrase"
      };
      await controller.exec(generateKeyPairDto);
      expect(account.userPublicArmoredKey).not.toBeNull();
      expect(account.userPrivateArmoredKey).not.toBeNull();
      expect(account.userKeyFingerprint).not.toBeNull();
    }, 20000);

    it("Should raise an error if no account has been found.", async() => {
      const controller = new GenerateRecoverAccountRecoveryRequestKeyController({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());
      expect.assertions(1);
      try {
        await controller.exec();
      } catch (error) {
        expect(error.message).toEqual("You have already started the process on another tab.");
      }
    });
  });
});
