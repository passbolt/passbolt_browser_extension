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
import VerifyImportedKeyPassphraseController from "./verifyImportedKeyPassphraseController";
import InvalidMasterPasswordError from "../../error/invalidMasterPasswordError";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";

describe("VerifyImportedKeyPassphraseController", () => {
  describe("VerifyImportedKeyPassphraseController::exec", () => {
    it("Should pass if the passphrase is correct.", async() => {
      const account = new AccountEntity(defaultAccountDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account}));
      jest.spyOn(AccountTemporarySessionStorageService, "set").mockImplementationOnce(() => jest.fn());
      const controller = new VerifyImportedKeyPassphraseController({port: {_port: {name: "test"}}}, null);

      expect.assertions(1);
      const promise = controller.exec(pgpKeys.ada.passphrase);
      await expect(promise).resolves.toBeUndefined();
    }, 10000);

    it("Should throw an exception if no passphrase provided.", () => {
      const account = new AccountEntity(defaultAccountDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account}));
      const controller = new VerifyImportedKeyPassphraseController({port: {_port: {name: "test"}}}, null);

      expect.assertions(1);
      const promise = controller.exec();
      return expect(promise).rejects.toThrowError(new TypeError("The passphrase should be a string."));
    }, 10000);

    it("Should throw an exception if the passphrase is incorrect.", () => {
      const account = new AccountEntity(defaultAccountDto());
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account}));
      const controller = new VerifyImportedKeyPassphraseController({port: {_port: {name: "test"}}}, null);

      expect.assertions(1);
      const promise = controller.exec("wrong passphrase");
      return expect(promise).rejects.toThrowError(new InvalidMasterPasswordError());
    }, 10000);

    it("Should throw an exception if the setupEntity doesn't have a private key set.", () => {
      const account = new AccountEntity(defaultAccountDto());
      delete account._props.user_private_armored_key;
      jest.spyOn(AccountTemporarySessionStorageService, "get").mockImplementationOnce(() => ({account: account}));
      const controller = new VerifyImportedKeyPassphraseController({port: {_port: {name: "test"}}}, null);

      expect.assertions(1);
      const promise = controller.exec("whatever passphrase");
      return expect(promise).rejects.toThrowError(new Error("An account user private key is required."));
    });

    it("Should raise an error if no account has been found.", async() => {
      const controller = new VerifyImportedKeyPassphraseController({port: {_port: {name: "test"}}}, null);
      expect.assertions(1);
      try {
        await controller.exec("test");
      } catch (error) {
        expect(error.message).toEqual("You have already started the process on another tab.");
      }
    });
  });
});
