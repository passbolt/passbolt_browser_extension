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
import {enableFetchMocks} from "jest-fetch-mock";
import {ImportPrivateKeyRecoverController} from "./importPrivateKeyRecoverController";
import {SetupEntity} from "../../model/entity/setup/setupEntity";
import {step0SetupRequestInitializedDto, step1SetupServerKeyRetrievedDto} from "../../model/entity/setup/SetupEntity.test.data";
import {GetGpgKeyInfoService} from "../../service/crypto/getGpgKeyInfoService";
import {GpgKeyError} from "../../error/GpgKeyError";
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import {MockExtension} from "../../../tests/mocks/mockExtension";
global.XRegExp = require("xregexp");

beforeEach(() => {
  jest.clearAllMocks();
  enableFetchMocks();
});

/*
 * global.crypto.getRandomValues is used by Uuid.get() method to generate random bytes.
 * Here it is overrided to have control over the generated value and predict what GpgAuthToken
 * will generate as a challenge to verify the identity of the server.
 *
 * In order to make sure that we don't brake future unit test that involved global.crypto, the
 * global lib is cached before the override and then after the unit test set is done, we put the
 * orginal crypto back where it should be.
 */
const currentCrypto = global.crypto;
global.crypto = {getRandomValues: size => Array(size).fill(0)};
afterAll(() => {
  global.crypto = currentCrypto;
});

describe("ImportPrivateKeyRecoverController", () => {
  describe('ImportPrivateKeyRecoverController::constructor', () => {
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
          new ImportPrivateKeyRecoverController(null, null, scenario.setupEntity);
        } catch (e) {
          expect(e).toStrictEqual(scenario.error);
        }
      }
    });

    it("Should accept a well formatted SetupEntity.", () => {
      expect.assertions(1);

      const setupEntity = new SetupEntity(step1SetupServerKeyRetrievedDto());
      const controller = new ImportPrivateKeyRecoverController(null, null, setupEntity);

      expect(controller).not.toBeNull();
    });
  });

  describe("GenerateKeyPairSetupController::exec", () => {
    it("Should throw an exception if the passed DTO is not valid.", async() => {
      const setupEntity = new SetupEntity(step1SetupServerKeyRetrievedDto());
      const controller = new ImportPrivateKeyRecoverController(null, null, setupEntity);

      const scenarios = [
        {dto: null, expectedError: Error},
        {dto: undefined, expectedError: Error},

        {dto: true, expectedError: Error},
        {dto: 1, expectedError: Error},
        {dto: "", expectedError: Error},

        {dto: {}, expectedError: Error},
        {dto: pgpKeys.ada.public, expectedError: Error},
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

    it("Should throw an exception if the setupEntity is not initialized properly.", async() => {
      expect.assertions(1);
      const setupEntity = new SetupEntity(step0SetupRequestInitializedDto());
      const controller = new ImportPrivateKeyRecoverController(null, null, setupEntity);
      try {
        await controller.exec(pgpKeys.ada.private);
      } catch (e) {
        expect(e).toStrictEqual(new Error('The server public key should have been provided before importing a private key'));
      }
    });

    it("Should throw an exception if the process of verification fails.", async() => {
      expect.assertions(1);
      await MockExtension.withConfiguredAccount();

      const mockedResponse = {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-gpgauth-version': '1.3.0',
          'x-gpgauth-error': true
        }
      };
      fetch.mockResponseOnce({}, mockedResponse);

      const setupEntity = new SetupEntity(step1SetupServerKeyRetrievedDto());
      const controller = new ImportPrivateKeyRecoverController(null, null, setupEntity);
      try {
        await controller.exec(pgpKeys.ada.private);
      } catch (e) {
        expect(e).toStrictEqual(new GpgKeyError('This key does not match any account.'));
      }
    });

    it("Should set the private key and public of the setup entity.", async() => {
      expect.assertions(9);
      await MockExtension.withConfiguredAccount();

      const mockedResponse = {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-gpgauth-version': '1.3.0',
          'x-gpgauth-authenticated': false,
          'x-gpgauth-progress': 'stage0',
          'x-gpgauth-verify-response': "gpgauthv1.3.0|36|AAAAAAAA-AAAA-3AAA-aAAA-AAAAAAAAAAAA|gpgauthv1.3.0"
        }
      };
      fetch.mockResponseOnce({}, mockedResponse);
      const expectedKeyData = pgpKeys.ada;
      const setupEntity = new SetupEntity(step1SetupServerKeyRetrievedDto());
      const controller = new ImportPrivateKeyRecoverController(null, null, setupEntity);

      await controller.exec(expectedKeyData.private);

      const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(setupEntity.userPublicArmoredKey);
      const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(setupEntity.userPrivateArmoredKey);

      expect(privateKeyInfo.fingerprint).toBe(expectedKeyData.fingerprint);
      expect(publicKeyInfo.fingerprint).toBe(expectedKeyData.fingerprint);

      expect(publicKeyInfo.private).toBe(false);
      expect(privateKeyInfo.private).toBe(true);

      expect(publicKeyInfo.length).toBe(expectedKeyData.length);
      expect(privateKeyInfo.length).toBe(expectedKeyData.length);

      expect(publicKeyInfo.userIds).toStrictEqual(expectedKeyData.user_ids);
      expect(privateKeyInfo.userIds).toStrictEqual(expectedKeyData.user_ids);

      expect(fetch).toHaveBeenCalledTimes(1);
    }, 10000);
  });
});
