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

import {v4 as uuidv4} from "uuid";
import {Worker} from "../../sdk/worker";
import {AccountRecoveryGenerateOrganizationKeyController} from "./accountRecoveryGenerateOrganizationKeyController";

describe("AccountRecoveryGenerateOrganizationKeyController", () => {
  describe("AccountRecoveryGenerateOrganizationKeyController::exec", () => {
    it("Should assert provided generate key pair dto is valid.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const controller = new AccountRecoveryGenerateOrganizationKeyController(mockWorker, requestId);

      expect.assertions(4);
      try {
        await controller.exec();
      } catch (error) {
        expect(error.message).toEqual("Could not validate entity GenerateGpgKeyPairEntity.");
        expect(error.details.name).not.toBeUndefined();
        expect(error.details.email).not.toBeUndefined();
        expect(error.details.passphrase).not.toBeUndefined();
      }
    });

    it("Should generate an account recovery organization key pair.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const controller = new AccountRecoveryGenerateOrganizationKeyController(mockWorker, requestId);

      expect.assertions(3);
      const generateKeyPairDto = {
        name: "key name",
        email: "key@email.com",
        passphrase: "key passphrase",
      };
      const gpgKeyPair = await controller.exec(generateKeyPairDto);
      expect(gpgKeyPair.publicKey).not.toBeNull();
      expect(gpgKeyPair.privateKey).not.toBeNull();
      const openpgpKeyRsaBits = (await openpgp.key.readArmored(gpgKeyPair.privateKey.armoredKey)).keys[0].getAlgorithmInfo().bits;
      expect(openpgpKeyRsaBits).toEqual(4096);
    }, 10000);
  });
});
