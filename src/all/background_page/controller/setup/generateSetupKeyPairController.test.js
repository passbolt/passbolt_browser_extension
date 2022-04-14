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
import {GenerateSetupKeyPairController} from "./generateSetupKeyPairController";
import {GetGpgKeyInfoService} from "../../service/crypto/getGpgKeyInfoService";
import {DecryptPrivateKeyService} from "../../service/crypto/decryptPrivateKeyService";
import {EntityValidationError} from "../../model/entity/abstract/entityValidationError";
import {startAccountSetupDto} from "../../model/entity/account/accountSetupEntity.test.data";
import {AccountSetupEntity} from "../../model/entity/account/accountSetupEntity";

describe("GenerateSetupKeyPairController", () => {
  describe("GenerateSetupKeyPairController::exec", () => {
    it("Should throw an exception if the passed DTO is not valid.", async() => {
      const account = new AccountSetupEntity(startAccountSetupDto());
      const controller = new GenerateSetupKeyPairController(null, null, account);

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

    it("Should generate a gpg key pair and update the account accordingly.", async() => {
      expect.assertions(7);
      const generateKeyPairDto = {passphrase: "What a great passphrase!"};
      const account = new AccountSetupEntity(startAccountSetupDto());
      const controller = new GenerateSetupKeyPairController(null, null, account);

      await controller.exec(generateKeyPairDto);

      const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(account.userPublicArmoredKey);
      const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(account.userPrivateArmoredKey);

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

      const decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(account.userPrivateArmoredKey, generateKeyPairDto.passphrase);
      expect(decryptedPrivateKey).not.toBeNull();
    }, 10000);
  });
});
