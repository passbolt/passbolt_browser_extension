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
import GenerateSetupKeyPairController from "./generateSetupKeyPairController";
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";
import DecryptPrivateKeyService from "../../service/crypto/decryptPrivateKeyService";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {startAccountSetupDto} from "../../model/entity/account/accountSetupEntity.test.data";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";
import {v4 as uuidv4} from "uuid";
import AccountTemporaryEntity from "../../model/entity/account/accountTemporaryEntity";
import UserKeyPoliciesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/userKeyPolicies/UserKeyPoliciesSettingsEntity";
import {defaultUserKeyPoliciesSettingsDto} from "passbolt-styleguide/src/shared/models/entity/userKeyPolicies/UserKeyPoliciesSettingsEntity.test.data";

describe("GenerateSetupKeyPairController", () => {
  describe("GenerateSetupKeyPairController::exec", () => {
    it("Should throw an exception if the passed DTO is not valid.", async() => {
      await MockExtension.withConfiguredAccount();
      const account = new AccountSetupEntity(startAccountSetupDto());
      const controller = new GenerateSetupKeyPairController({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());

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
          jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account}));
          await controller.exec(scenario.dto);
        } catch (e) {
          expect(e).toBeInstanceOf(scenario.expectedError);
        }
      }
    });

    it("Should generate a gpg key pair and update the account accordingly.", async() => {
      expect.assertions(12);
      await MockExtension.withConfiguredAccount();
      const generateKeyPairDto = {passphrase: "What a great passphrase!"};
      const workerId = uuidv4();
      const setupAccountDto = startAccountSetupDto();
      const temporaryAccountEntity = new AccountTemporaryEntity({account: setupAccountDto, worker_id: workerId});
      await AccountTemporarySessionStorageService.set(temporaryAccountEntity);
      const controller = new GenerateSetupKeyPairController({port: {_port: {name: workerId}}}, null, defaultApiClientOptions());

      await controller.exec(generateKeyPairDto);
      const expectedAccount = await AccountTemporarySessionStorageService.get(workerId);
      const account = expectedAccount.account;
      await expect(account.userKeyFingerprint).not.toBeNull();
      await expect(account.userKeyFingerprint).toHaveLength(40);
      await expect(account.userPublicArmoredKey).toBeOpenpgpPublicKey();
      await expect(account.userPrivateArmoredKey).toBeOpenpgpPrivateKey();

      const accountPublicKey = await OpenpgpAssertion.readKeyOrFail(account.userPublicArmoredKey);
      const accountPrivateKey = await OpenpgpAssertion.readKeyOrFail(account.userPrivateArmoredKey);
      const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(accountPublicKey);
      const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(accountPrivateKey);

      const expectedUserIds = [{
        name: `${account.firstName} ${account.lastName}`,
        email: account.username
      }];
      expect(privateKeyInfo.fingerprint).toBe(publicKeyInfo.fingerprint);
      expect(publicKeyInfo.private).toBe(false);
      expect(privateKeyInfo.private).toBe(true);
      expect(publicKeyInfo.length).toBe(3072);
      expect(privateKeyInfo.length).toBe(3072);
      expect(privateKeyInfo.userIds).toStrictEqual(expectedUserIds);

      const userPrivateKey = await OpenpgpAssertion.readKeyOrFail(account.userPrivateArmoredKey);
      const decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(userPrivateKey, generateKeyPairDto.passphrase);
      expect(decryptedPrivateKey).not.toBeNull();
      expect(expectedAccount.passphrase).toStrictEqual(generateKeyPairDto.passphrase);
    }, 10000);

    it("Should generate an ECC gpg key pair and update the account accordingly.", async() => {
      expect.assertions(11);
      await MockExtension.withConfiguredAccount();
      const generateKeyPairDto = {passphrase: "What a great passphrase!"};
      const workerId = uuidv4();
      const setupAccountDto = startAccountSetupDto();
      const temporaryAccountEntity = new AccountTemporaryEntity({account: setupAccountDto, worker_id: workerId});
      await AccountTemporarySessionStorageService.set(temporaryAccountEntity);
      const controller = new GenerateSetupKeyPairController({port: {_port: {name: workerId}}}, null, defaultApiClientOptions());
      jest.spyOn(controller.findUserKeyPoliciesSettingsService, "findSettingsAsGuest").mockImplementation(() => new UserKeyPoliciesSettingsEntity(defaultUserKeyPoliciesSettingsDto()));

      await controller.exec(generateKeyPairDto);
      const account = (await AccountTemporarySessionStorageService.get(workerId)).account;
      const accountPublicKey = await OpenpgpAssertion.readKeyOrFail(account.userPublicArmoredKey);
      const accountPrivateKey = await OpenpgpAssertion.readKeyOrFail(account.userPrivateArmoredKey);
      const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(accountPublicKey);
      const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(accountPrivateKey);

      const expectedUserIds = [{
        name: `${account.firstName} ${account.lastName}`,
        email: account.username
      }];
      expect(privateKeyInfo.fingerprint).toBe(publicKeyInfo.fingerprint);
      expect(publicKeyInfo.private).toBe(false);
      expect(privateKeyInfo.private).toBe(true);
      expect(publicKeyInfo.length).toBe(256);
      expect(privateKeyInfo.length).toBe(256);
      expect(privateKeyInfo.userIds).toStrictEqual(expectedUserIds);
      expect(privateKeyInfo.algorithm).toStrictEqual("eddsa");
      expect(publicKeyInfo.algorithm).toStrictEqual("eddsa");
      expect(publicKeyInfo.curve).toStrictEqual("ed25519");
      expect(publicKeyInfo.curve).toStrictEqual("ed25519");

      const userPrivateKey = await OpenpgpAssertion.readKeyOrFail(account.userPrivateArmoredKey);
      const decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(userPrivateKey, generateKeyPairDto.passphrase);
      expect(decryptedPrivateKey).not.toBeNull();
    }, 10000);

    it("Should raise an error if no account has been found.", async() => {
      const controller = new GenerateSetupKeyPairController({port: {_port: {name: "test"}}}, null, defaultApiClientOptions());
      expect.assertions(1);
      try {
        await controller.exec({passphrase: "passphrase"});
      } catch (error) {
        expect(error.message).toEqual("You have already started the process on another tab.");
      }
    });
  });
});
