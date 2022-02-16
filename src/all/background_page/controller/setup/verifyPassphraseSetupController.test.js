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
import {VerifyPassphraseSetupController} from "./verifyPassphraseSetupController";
import {SetupEntity} from "../../model/entity/setup/setupEntity";
import {step1SetupServerKeyRetrievedDto, step2SetupUserGpgKeyDto} from "../../model/entity/setup/SetupEntity.test.data";
import {InvalidMasterPasswordError} from "../../error/invalidMasterPasswordError";

describe("VerifyPassphraseSetupController", () => {
  describe("VerifyPassphraseSetupController::exec", () => {
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
          new VerifyPassphraseSetupController(null, null, scenario.setupEntity);
        } catch (e) {
          expect(e).toStrictEqual(scenario.error);
        }
      }
    });

    it("Should accept a well formatted SetupEntity.", () => {
      expect.assertions(1);

      const setupEntity = new SetupEntity(step2SetupUserGpgKeyDto());
      const controller = new VerifyPassphraseSetupController(null, null, setupEntity);

      expect(controller).not.toBeNull();
    });

    it("Should validate a passphrase if both key and passphrase matches and update the setupEntity accordingly.", async() => {
      const setupEntityData = step2SetupUserGpgKeyDto();
      const scenarios = [
        {rememberMe: true, expectedSetupRememberMe: true},
        {rememberMe: false, expectedSetupRememberMe: undefined},
        {rememberMe: undefined, expectedSetupRememberMe: undefined},
        {rememberMe: null, expectedSetupRememberMe: undefined},
      ];

      expect.assertions(2 * scenarios.length);

      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        const setupEntity = new SetupEntity(setupEntityData);
        const controller = new VerifyPassphraseSetupController(null, null, setupEntity);

        await controller.exec("ada@passbolt.com", scenario.rememberMe);
        expect(setupEntity.rememberUntilLogout).toBe(scenario.expectedSetupRememberMe);
        expect(setupEntity.userPrivateArmoredKey).toBe(setupEntityData.user_private_armored_key);
      }
    }, 10000);

    it("Should throw an exception if the passphrase is incorrect.", () => {
      expect.assertions(1);
      const setupEntity = new SetupEntity(step2SetupUserGpgKeyDto());
      const controller = new VerifyPassphraseSetupController(null, null, setupEntity);

      const promise = controller.exec("wrong passphrase");
      return expect(promise).rejects.toThrowError(new InvalidMasterPasswordError());
    }, 10000);

    it("Should throw an exception if the setupEntity doesn't have a private key set.", () => {
      expect.assertions(1);
      const setupEntity = new SetupEntity(step1SetupServerKeyRetrievedDto());
      const controller = new VerifyPassphraseSetupController(null, null, setupEntity);

      const promise = controller.exec("whatever passphrase");
      return expect(promise).rejects.toThrowError(new Error('A private key should have been provided before checking the validity of its passphrase'));
    });
  });
});
