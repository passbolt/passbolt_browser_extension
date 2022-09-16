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
import VerifyAccountPassphraseController from "./verifyAccountPassphraseController";
import InvalidMasterPasswordError from "../../error/invalidMasterPasswordError";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";

describe("VerifyAccountPassphraseController", () => {
  describe("VerifyAccountPassphraseController::exec", () => {
    it("Should pass if the passphrase is correct.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      const controller = new VerifyAccountPassphraseController(null, null, account);

      expect.assertions(1);
      const promise = controller.exec(pgpKeys.ada.passphrase);
      await expect(promise).resolves.toBeUndefined();
    }, 10000);

    it("Should throw an exception if no passphrase provided.", () => {
      const account = new AccountEntity(defaultAccountDto());
      const controller = new VerifyAccountPassphraseController(null, null, account);

      expect.assertions(1);
      const promise = controller.exec();
      return expect(promise).rejects.toThrowError(new TypeError("The passphrase should be a string."));
    }, 10000);

    it("Should throw an exception if the passphrase is incorrect.", () => {
      const account = new AccountEntity(defaultAccountDto());
      const controller = new VerifyAccountPassphraseController(null, null, account);

      expect.assertions(1);
      const promise = controller.exec("wrong passphrase");
      return expect(promise).rejects.toThrowError(new InvalidMasterPasswordError());
    }, 10000);

    it("Should throw an exception if the setupEntity doesn't have a private key set.", () => {
      const account = new AccountEntity(defaultAccountDto());
      delete account._props.user_private_armored_key;
      const controller = new VerifyAccountPassphraseController(null, null, account);

      expect.assertions(1);
      const promise = controller.exec("whatever passphrase");
      return expect(promise).rejects.toThrowError(new Error("An account user private key is required."));
    });
  });
});
