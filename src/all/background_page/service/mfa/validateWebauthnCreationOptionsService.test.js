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
 * @since         5.17.0
 */
import ValidateWebauthnCreationOptionsService from "./validateWebauthnCreationOptionsService";
import WebauthnCeremonyError from "../../error/webauthnCeremonyError";
import WebauthnCredentialCreationOptionsEntity from "../../model/entity/mfa/webauthnCredentialCreationOptionsEntity";
import { defaultWebauthnCredentialCreationOptionsDto } from "../../model/entity/mfa/webauthnCredentialCreationOptionsEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

describe("ValidateWebauthnCreationOptionsService", () => {
  const account = new AccountEntity(defaultAccountDto());
  const validate = (data) =>
    ValidateWebauthnCreationOptionsService.validate(
      new WebauthnCredentialCreationOptionsEntity(defaultWebauthnCredentialCreationOptionsDto(data)),
      account,
    );

  describe("ValidateWebauthnCreationOptionsService::validate", () => {
    it("accepts options matching the account", () => {
      expect.assertions(1);
      expect(() => validate()).not.toThrow();
    });

    it("rejects a relying party id different from the account domain hostname", () => {
      expect.assertions(1);
      expect(() => validate({ rp: { id: "evil.local", name: "Passbolt" } })).toThrow(WebauthnCeremonyError);
    });

    it("rejects a user name different from the account username", () => {
      expect.assertions(1);
      const user = { ...defaultWebauthnCredentialCreationOptionsDto().user, name: "betty@passbolt.com" };
      expect(() => validate({ user })).toThrow("The user name does not match the account username.");
    });

    it("rejects a user id not decoding to the account user id", () => {
      expect.assertions(1);
      const user = { ...defaultWebauthnCredentialCreationOptionsDto().user, id: "bm90LXRoZS11c2VyLWlk" };
      expect(() => validate({ user })).toThrow("The user id does not match the account user id.");
    });
  });
});
