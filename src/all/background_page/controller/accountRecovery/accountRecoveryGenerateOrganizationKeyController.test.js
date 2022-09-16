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

import AccountRecoveryGenerateOrganizationKeyController from "./accountRecoveryGenerateOrganizationKeyController";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import * as openpgp from 'openpgp';

describe("AccountRecoveryGenerateOrganizationKeyController", () => {
  describe("AccountRecoveryGenerateOrganizationKeyController::exec", () => {
    it("Should assert provided generate key pair dto is valid.", async() => {
      await MockExtension.withConfiguredAccount();
      const controller = new AccountRecoveryGenerateOrganizationKeyController(null, null, defaultApiClientOptions());
      const promise = controller.exec();

      expect.assertions(1);
      await expect(promise).rejects.toThrowError("Could not validate entity GenerateGpgKeyPairOptionsEntity.");
    });

    it("Should generate an account recovery organization key pair.", async() => {
      await MockExtension.withConfiguredAccount();
      const controller = new AccountRecoveryGenerateOrganizationKeyController(null, null, defaultApiClientOptions());
      const generateKeyPairDto = {
        name: "key name",
        email: "key@email.com",
        passphrase: "key passphrase",
      };
      const gpgKeyPair = await controller.exec(generateKeyPairDto);

      expect.assertions(3);
      expect(gpgKeyPair.publicKey).not.toBeNull();
      expect(gpgKeyPair.privateKey).not.toBeNull();
      const openpgpKeyRsaBits = (await openpgp.readKey({armoredKey: gpgKeyPair.privateKey.armoredKey})).getAlgorithmInfo().bits;
      expect(openpgpKeyRsaBits).toEqual(4096);
    }, 20000);
  });
});
