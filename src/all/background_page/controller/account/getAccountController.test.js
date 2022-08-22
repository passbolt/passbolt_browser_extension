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

import GetAccountController from "./getAccountController";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import AccountAccountRecoveryEntity from "../../model/entity/account/accountAccountRecoveryEntity";
import {defaultAccountAccountRecoveryDto} from "../../model/entity/account/accountAccountRecoveryEntity.test.data";
import AccountRecoverEntity from "../../model/entity/account/accountRecoverEntity";
import {withSecurityTokenAccountRecoverDto} from "../../model/entity/account/accountRecoverEntity.test.data";
import {withSecurityTokenAccountSetupDto} from "../../model/entity/account/accountSetupEntity.test.data";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";

describe("GetAccountController", () => {
  describe("GetAccountController::exec", () => {
    const assertCommonAccountProperties = (accountDto, expectAccount) => {
      expect(accountDto.type).toEqual(expectAccount.type);
      expect(accountDto.domain).toEqual(expectAccount.domain);
      expect(accountDto.user_id).toEqual(expectAccount.userId);
      expect(accountDto.username).toEqual(expectAccount.username);
      expect(accountDto.first_name).toEqual(expectAccount.firstName);
      expect(accountDto.last_name).toEqual(expectAccount.lastName);
      expect(accountDto.user_public_armored_key).toEqual(expectAccount.userPublicArmoredKey);
      expect(accountDto.server_public_armored_key).toEqual(expectAccount.serverPublicArmoredKey);
      expect(accountDto.security_token).toEqual(expectAccount.securityToken.toDto());
    };

    it("Should retrieve the account being used by the worker.", async() => {
      const storedAccountDto = defaultAccountDto();
      const storedAccount = new AccountEntity(storedAccountDto);
      const controller = new GetAccountController(null, null, storedAccount);
      const accountDto = await controller.exec();

      expect.assertions(10);
      assertCommonAccountProperties(accountDto, storedAccount);
      // Ensure the controller doesn't leak sensitive information
      expect(accountDto.user_private_armored_key).toBeUndefined();
    });

    it("Should retrieve the account being setup by the worker.", async() => {
      const storedAccountDto = withSecurityTokenAccountSetupDto();
      const storedAccount = new AccountSetupEntity(storedAccountDto);
      const controller = new GetAccountController(null, null, storedAccount);
      const accountDto = await controller.exec();

      expect.assertions(11);
      assertCommonAccountProperties(accountDto, storedAccount);
      // Ensure the controller doesn't leak sensitive information
      expect(accountDto.user_private_armored_key).toBeUndefined();
      expect(accountDto.authentication_token_token).toBeUndefined();
    });

    it("Should retrieve the account being recovered by the worker.", async() => {
      const storedAccountDto = withSecurityTokenAccountRecoverDto();
      const storedAccount = new AccountRecoverEntity(storedAccountDto);
      const controller = new GetAccountController(null, null, storedAccount);
      const accountDto = await controller.exec();

      expect.assertions(11);
      assertCommonAccountProperties(accountDto, storedAccount);
      // Ensure the controller doesn't leak sensitive information
      expect(accountDto.user_private_armored_key).toBeUndefined();
      expect(accountDto.authentication_token_token).toBeUndefined();
    });

    it("Should retrieve the account completing the account recovery used by the worker.", async() => {
      const storedAccountDto = defaultAccountAccountRecoveryDto();
      const storedAccount = new AccountAccountRecoveryEntity(storedAccountDto);
      const controller = new GetAccountController(null, null, storedAccount);
      const accountDto = await controller.exec();

      expect.assertions(12);
      assertCommonAccountProperties(accountDto, storedAccount);
      // Ensure the controller doesn't leak sensitive information
      expect(accountDto.user_private_armored_key).toBeUndefined();
      expect(accountDto.authentication_token_token).toBeUndefined();
      expect(accountDto.account_recovery_request_id).toBeUndefined();
    });
  });
});
