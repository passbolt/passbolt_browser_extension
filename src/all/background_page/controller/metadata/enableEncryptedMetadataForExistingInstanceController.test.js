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
 * @since         5.4.0
 */
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import EnableEncryptedMetadataForExistingInstanceController from "./enableEncryptedMetadataForExistingInstanceController";

describe("EnableEncryptedMetadataForExistingInstanceController", () => {
  describe("::exec", () => {
    it("should call for the orchestrator to enable metadata", async() => {
      expect.assertions(3);

      const passphrase = "ada@passbolt.com";
      await PassphraseStorageService.set(passphrase);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
      const controller = new EnableEncryptedMetadataForExistingInstanceController(null, null, apiClientOptions, account);
      jest.spyOn(controller.getPassphraseService, "getPassphrase");
      jest.spyOn(controller.configureMetadataSettingsService, "enableEncryptedMetadataForExistingInstance").mockImplementation(() => {});

      await controller.exec();

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.configureMetadataSettingsService.enableEncryptedMetadataForExistingInstance).toHaveBeenCalledTimes(1);
      expect(controller.configureMetadataSettingsService.enableEncryptedMetadataForExistingInstance).toHaveBeenCalledWith(passphrase);
    });

    it("should not intercept unexpected error if something goes wrong when enabling the metadata encryption", async() => {
      expect.assertions(1);

      const passphrase = "ada@passbolt.com";
      await PassphraseStorageService.set(passphrase);
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
      const controller = new EnableEncryptedMetadataForExistingInstanceController(null, null, apiClientOptions, account);
      jest.spyOn(controller.configureMetadataSettingsService, "enableEncryptedMetadataForExistingInstance").mockImplementation(() => { throw new Error("Something went wrong!"); });

      await expect(() => controller.exec()).rejects.toThrowError("Something went wrong!");
    });
  });
});
