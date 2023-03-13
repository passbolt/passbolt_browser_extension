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
import CompleteRecoverController from "./completeRecoverController";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {withSecurityTokenAccountRecoverDto} from "../../model/entity/account/accountRecoverEntity.test.data";
import AccountRecoverEntity from "../../model/entity/account/accountRecoverEntity";
import User from "../../model/user";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";

// Reset the modules before each test.
beforeEach(() => {
  enableFetchMocks();
});

describe("CompleteRecoverController", () => {
  describe("CompleteRecoverController::exec", () => {
    it("Should complete the recover.", async() => {
      const account = new AccountRecoverEntity(withSecurityTokenAccountRecoverDto());
      const controller = new CompleteRecoverController(null, null, defaultApiClientOptions(), account);

      // Mock API complete request.
      fetch.doMockOnce(() => mockApiResponse());

      expect.assertions(9);
      await controller.exec();
      const user = User.getInstance().get();
      expect(user.id).toStrictEqual(account.userId);
      expect(user.username).toStrictEqual(account.username);
      expect(user.firstname).toStrictEqual(account.firstName);
      expect(user.lastname).toStrictEqual(account.lastName);
      expect(user.settings.domain).toStrictEqual(account.domain);
      expect(user.settings.securityToken).toStrictEqual(account.securityToken.toDto());

      const keyring = new Keyring();
      const keyringPrivateKey = await OpenpgpAssertion.readKeyOrFail(keyring.findPrivate().armoredKey);
      const keyringPublicKey = await OpenpgpAssertion.readKeyOrFail(keyring.findPublic(account.userId).armoredKey);
      const accountPrivateKey = await OpenpgpAssertion.readKeyOrFail(account.userPrivateArmoredKey);
      const accountPublicKey = await OpenpgpAssertion.readKeyOrFail(account.userPublicArmoredKey);
      const keyringPrivateFingerprint = keyringPrivateKey.getFingerprint().toUpperCase();
      const accountPrivateFingerprint = accountPrivateKey.getFingerprint().toUpperCase();
      const keyringPublicFingerprint = keyringPublicKey.getFingerprint().toUpperCase();
      const accountPublicFingerprint = accountPublicKey.getFingerprint().toUpperCase();
      expect(keyringPrivateFingerprint).toStrictEqual(accountPrivateFingerprint);
      expect(keyringPublicFingerprint).toStrictEqual(accountPublicFingerprint);
      expect(keyringPublicFingerprint).toStrictEqual(keyringPrivateFingerprint);
    });

    it("Should not add the account to the local storage if the complete API request fails.", async() => {
      const account = new AccountRecoverEntity(withSecurityTokenAccountRecoverDto());
      const controller = new CompleteRecoverController(null, null, defaultApiClientOptions(), account);

      // Mock API complete request.
      fetch.doMockOnce(() => Promise.reject());

      const promise = controller.exec();

      expect.assertions(2);
      await expect(promise).rejects.toThrow();
      expect(() => User.getInstance().get()).toThrow("The user is not set");
    });
  });
});
