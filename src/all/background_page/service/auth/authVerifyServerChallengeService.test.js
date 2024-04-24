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
 * @since         3.6.1
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import AuthVerifyServerChallengeService from "./authVerifyServerChallengeService";
import {defaultGpgAuthTokenVerifyHeadersDto} from "../../model/gpgAuthHeader.test.data";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("AuthVerifyServerKeyController", () => {
  describe("AuthVerifyServerKeyController::exec", () => {
    it("Should verify the server successfully.", async() => {
      expect.assertions(1);
      // Mock account.
      const account = new AccountEntity(defaultAccountDto());

      const service = new AuthVerifyServerChallengeService(defaultApiClientOptions());
      jest.spyOn(service.authVerifyServerKeyService, "verify").mockImplementationOnce(() => ({
        headers: defaultGpgAuthTokenVerifyHeadersDto({token: service.gpgAuthToken.token}),
        body: {}
      }));

      const promise = service.verifyAndValidateServerChallenge(account.userKeyFingerprint, account.serverPublicArmoredKey);
      await expect(promise).resolves.not.toThrow();
    });

    it("Should throw a server error if the server token is not the same", async() => {
      expect.assertions(1);
      // Mock account.
      const account = new AccountEntity(defaultAccountDto({server_public_armored_key: pgpKeys.server.public}));

      const service = new AuthVerifyServerChallengeService(defaultApiClientOptions());
      jest.spyOn(service.authVerifyServerKeyService, "verify").mockImplementationOnce(() => ({
        headers: defaultGpgAuthTokenVerifyHeadersDto(),
        body: {}
      }));

      const promise = service.verifyAndValidateServerChallenge(account.userKeyFingerprint, account.serverPublicArmoredKey);
      await expect(promise).rejects.toThrowError(new Error('The server was unable to prove it can use the advertised OpenPGP key.'));
    });

    it("Should throw a server error if the server cannot be verified", async() => {
      expect.assertions(1);
      // Mock account.
      const account = new AccountEntity(defaultAccountDto({server_public_armored_key: pgpKeys.server.public}));

      const service = new AuthVerifyServerChallengeService(defaultApiClientOptions());
      jest.spyOn(service.authVerifyServerKeyService, "verify").mockImplementationOnce(() => { throw Error('Unknown error'); });

      const promise = service.verifyAndValidateServerChallenge(account.userKeyFingerprint, account.serverPublicArmoredKey);
      await expect(promise).rejects.toThrowError(new Error('Unknown error'));
    });
  });
});
