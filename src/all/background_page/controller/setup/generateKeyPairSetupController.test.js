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
import {GenerateKeyPairSetupController} from "./generateKeyPairSetupController";
import {SetupEntity} from "../../model/entity/setup/setupEntity";
import {step0SetupRequestInitializedDto} from "../../model/entity/setup/SetupEntity.test.data";
import {GetGpgKeyInfoService} from "../../service/crypto/getGpgKeyInfoService";
import {DecryptPrivateKeyService} from "../../service/crypto/decryptPrivateKeyService";
import {EntityValidationError} from "../../model/entity/abstract/entityValidationError";

describe("GenerateKeyPairSetupController", () => {
  describe('GenerateKeyPairSetupController::constructor', () => {
    it("Should throw an exception if the setupEntity is not formatted properly.", () => {
      const scenarios = [
        {setupEntity: null, error: new Error("The setupEntity can't be null")},
        {setupEntity: undefined, error: new Error("The setupEntity can't be null")},
        {setupEntity: {}, error: new Error("the setupEntity must be of type SetupEntity")}
      ];

      expect.assertions(scenarios.length);

      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        try {
          new GenerateKeyPairSetupController(null, null, scenario.setupEntity);
        } catch (e) {
          expect(e).toStrictEqual(scenario.error);
        }
      }
    });

    it("Should accept a well formatted SetupEntity.", () => {
      expect.assertions(1);

      const setupEntity = new SetupEntity(step0SetupRequestInitializedDto());
      const controller = new GenerateKeyPairSetupController(null, null, setupEntity);

      expect(controller).not.toBeNull();
    });
  });

  describe("GenerateKeyPairSetupController::exec", () => {
    it("Should throw an exception if the passed DTO is not valid.", async() => {
      const setupEntity = new SetupEntity(step0SetupRequestInitializedDto());
      const controller = new GenerateKeyPairSetupController(null, null, setupEntity);

      const scenarios = [
        {dto: null, expectedError: TypeError},
        {dto: undefined, expectedError: TypeError},

        {dto: true, expectedError: EntityValidationError},
        {dto: 1, expectedError: EntityValidationError},
        {dto: "", expectedError: EntityValidationError},

        {dto: {}, expectedError: EntityValidationError},
        {dto: {password: "should be a passphrase"}, expectedError: EntityValidationError},
        {dto: {passphrase: ""}, expectedError: EntityValidationError},
        {dto: {passphrase: true}, expectedError: EntityValidationError},
        {dto: {passphrase: 1}, expectedError: EntityValidationError},
        {dto: {passphrase: null}, expectedError: EntityValidationError},
        {dto: {passphrase: undefined}, expectedError: EntityValidationError},
      ];

      expect.assertions(scenarios.length);

      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        try {
          await controller.exec(scenario.dto);
        } catch (e) {
          expect(e).toBeInstanceOf(scenario.expectedError);
        }
      }
    });

    it("Should generate a gpg key pair and update the setupEntity accordingly.", async() => {
      expect.assertions(8);
      const passphraseDto = {passphrase: "What a great passphrase!"};
      const setupEntity = new SetupEntity(step0SetupRequestInitializedDto());
      const controller = new GenerateKeyPairSetupController(null, null, setupEntity);

      await controller.exec(passphraseDto);

      const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(setupEntity.userPublicArmoredKey);
      const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(setupEntity.userPrivateArmoredKey);

      const expectedUserIds = [{
        name: `${setupEntity.user.profile.firstName} ${setupEntity.user.profile.lastName}`,
        email: setupEntity.user.username
      }];
      expect(privateKeyInfo.fingerprint).toBe(publicKeyInfo.fingerprint);
      expect(publicKeyInfo.private).toBe(false);
      expect(privateKeyInfo.private).toBe(true);
      expect(publicKeyInfo.length).toBe(2048);
      expect(privateKeyInfo.length).toBe(2048);
      expect(privateKeyInfo.userIds).toStrictEqual(expectedUserIds);
      expect(setupEntity.passphrase).toBe(passphraseDto.passphrase);

      const decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(setupEntity.userPrivateArmoredKey, setupEntity.passphrase);
      expect(decryptedPrivateKey).not.toBeNull();
    }, 10000);
  });
});
