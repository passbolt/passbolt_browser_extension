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

import DecryptUserAuthTokenService from "./decryptUserAuthTokenService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {
  bettyAuthToken,
  bettyEncryptedAuthToken,
  invalidBettyEncryptedAuthToken
} from "./decryptUserAuthTokenService.test.data";

describe("DecryptUserAuthTokenService", () => {
  describe("DecryptUserAuthTokenService::decryptToken", () => {
    it("should decrypt and validate the user authentication token", async() => {
      expect.assertions(1);
      const gpgAuthToken = await DecryptUserAuthTokenService.decryptToken(bettyEncryptedAuthToken, pgpKeys.betty.private, pgpKeys.betty.passphrase);
      expect(gpgAuthToken).toEqual(bettyAuthToken);
    });

    it("should throw if the encrypted user auth token parameter is not a valid string", async() => {
      expect.assertions(1);
      await expect(() => DecryptUserAuthTokenService.decryptToken(42, pgpKeys.betty.private, pgpKeys.betty.passphrase))
        .rejects.toThrow(new TypeError("The encrypted user auth token should be string."));
    });

    it("should throw if the user private armored key parameter is not a valid string", async() => {
      expect.assertions(1);
      await expect(() => DecryptUserAuthTokenService.decryptToken(bettyEncryptedAuthToken, 42, pgpKeys.betty.passphrase))
        .rejects.toThrow(new TypeError("The user private armored key should be string."));
    });

    it("should throw if the user passphrase parameter is not a valid string", async() => {
      expect.assertions(1);
      await expect(() => DecryptUserAuthTokenService.decryptToken(bettyEncryptedAuthToken, pgpKeys.betty.private, 42))
        .rejects.toThrow(new TypeError("The passphrase should be string."));
    });

    it("should throw if the user private key cannot be read", async() => {
      expect.assertions(1);
      await expect(() => DecryptUserAuthTokenService.decryptToken(bettyEncryptedAuthToken, "not-valid-user-private-key", pgpKeys.betty.passphrase))
        .rejects.toThrow(new TypeError("The key should be a valid openpgp armored key string."));
    });

    it("should throw if the user private key cannot be decrypted", async() => {
      expect.assertions(1);
      await expect(() => DecryptUserAuthTokenService.decryptToken(bettyEncryptedAuthToken, pgpKeys.betty.private, "not-valid-passphrase"))
        .rejects.toThrow(new TypeError("This is not a valid passphrase"));
    });

    it("should throw if the encrypted token is not a valid gpg message", async() => {
      expect.assertions(1);
      await expect(() => DecryptUserAuthTokenService.decryptToken("not-valid-encrypted-message", pgpKeys.betty.private, pgpKeys.betty.passphrase))
        .rejects.toThrow(new TypeError("The message should be a valid openpgp message."));
    });

    it("should throw if the encrypted message cannot be decrypted if the user private key", async() => {
      expect.assertions(1);
      await expect(() => DecryptUserAuthTokenService.decryptToken(bettyEncryptedAuthToken, pgpKeys.ada.private, pgpKeys.ada.passphrase))
        .rejects.toThrow(new TypeError("Error decrypting message: Session key decryption failed."));
    });

    it("should throw if the token does not validate", async() => {
      expect.assertions(1);
      await expect(() => DecryptUserAuthTokenService.decryptToken(invalidBettyEncryptedAuthToken, pgpKeys.betty.private, pgpKeys.betty.passphrase))
        .rejects.toThrow(new TypeError("Passbolt does not support GPGAuth token nonce longer than 36 characters: A37B2216-0484-3610-a6E3-5F47B704FD0F"));
    });
  });
});
