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
import {RecoverGenerateAccountRecoveryRequestKeyController} from "./recoverGenerateAccountRecoveryRequestKeyController";
import {SetupEntity} from "../../model/entity/setup/setupEntity";
import {step0SetupRequestInitializedDto} from "../../model/entity/setup/SetupEntity.test.data";

describe("RecoverGenerateAccountRecoveryRequestKeyController", () => {
  describe("RecoverGenerateAccountRecoveryRequestKeyController::exec", () => {
    it("Should assert setupEntity contains required data.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const setupEntity = new SetupEntity(step0SetupRequestInitializedDto({user: null}));
      const controller = new RecoverGenerateAccountRecoveryRequestKeyController(mockWorker, requestId, setupEntity);

      expect.assertions(2);
      try {
        await controller.exec();
        expect(false).toBeTruthy();
      } catch (error) {
        expect(error.message).toEqual("Could not validate entity GenerateGpgKeyPairEntity.");
        expect(error.details.email).not.toBeUndefined();
      }
    });

    it("Should assert provided generate key pair dto is valid.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const setupEntity = new SetupEntity(step0SetupRequestInitializedDto());
      const controller = new RecoverGenerateAccountRecoveryRequestKeyController(mockWorker, requestId, setupEntity);

      expect.assertions(2);
      try {
        await controller.exec();
        expect(false).toBeTruthy();
      } catch (error) {
        expect(error.message).toEqual("Could not validate entity GenerateGpgKeyPairEntity.");
        expect(error.details.passphrase).not.toBeUndefined();
      }
    });

    it("Should generate a key pair.", async() => {
      const mockPort = {};
      const mockWorker = new Worker(mockPort);
      const requestId = uuidv4();
      const setupEntity = new SetupEntity(step0SetupRequestInitializedDto());
      const controller = new RecoverGenerateAccountRecoveryRequestKeyController(mockWorker, requestId, setupEntity);

      expect.assertions(3);
      const generateKeyPairDto = {
        passphrase: "passphrase"
      };
      await controller.exec(generateKeyPairDto);
      expect(setupEntity.userPublicArmoredKey).not.toBeNull();
      expect(setupEntity.userPrivateArmoredKey).not.toBeNull();
      expect(setupEntity.userKeyFingerprint).not.toBeNull();
    }, 20000);
  });
});
