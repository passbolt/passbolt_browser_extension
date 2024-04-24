/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.7.0
 */
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import {urlencode} from "locutus/php/url";
import AuthVerifyLoginChallengeService from "./authVerifyLoginChallengeService";
import {
  defaultGpgAuthTokenLoginCompleteHeadersDto,
  defaultGpgAuthTokenLoginStage1HeadersDto
} from "../../model/gpgAuthHeader.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import GpgAuthToken from "../../model/gpgAuthToken";

beforeEach(async() => {
  jest.clearAllMocks();
});

describe("AuthVerifyLoginChallengeService", () => {
  describe("AuthVerifyLoginChallengeService::verifyAndValidateLoginChallenge", () => {
    it("Sign in with", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const passphrase = "ada@passbolt.com";
      const service = new AuthVerifyLoginChallengeService(defaultApiClientOptions());

      // Mock the service with the user token
      const gpgAuthToken = new GpgAuthToken();
      const encryptionKey = await OpenpgpAssertion.readKeyOrFail(account.userPublicArmoredKey);
      const encryptedUserToken = await EncryptMessageService.encrypt(gpgAuthToken.token, encryptionKey);
      const encodedToken = urlencode(encryptedUserToken);
      jest.spyOn(service.authLoginService, "loginStage1").mockImplementation(() => ({
        headers: defaultGpgAuthTokenLoginStage1HeadersDto({token: encodedToken}),
        body: {}
      }));
      jest.spyOn(service.authLoginService, "loginStage2").mockImplementation(() => ({
        headers: defaultGpgAuthTokenLoginCompleteHeadersDto(),
        body: {}
      }));

      expect.assertions(2);

      await service.verifyAndValidateLoginChallenge(account.userKeyFingerprint, account.userPrivateArmoredKey, passphrase);
      expect(service.authLoginService.loginStage1).toHaveBeenCalledWith(account.userKeyFingerprint);
      expect(service.authLoginService.loginStage2).toHaveBeenCalledWith(gpgAuthToken.token, account.userKeyFingerprint);
    });
  });
});
