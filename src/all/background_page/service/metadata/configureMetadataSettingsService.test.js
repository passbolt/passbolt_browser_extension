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
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import ConfigureMetadataSettingsService from "./configureMetadataSettingsService";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import MetadataKeysSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";
import ExternalGpgKeyPairEntity from "passbolt-styleguide/src/shared/models/entity/gpgkey/external/externalGpgKeyPairEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";

describe("ConfigureMetadataSettingsService", () => {
  describe("::enableEncryptedMetadataForNewInstance", () => {
    it("should orchestrate all the necessary service in order to activate the encryption of metadata", async() => {
      expect.assertions(8);

      const passphrase = "ada@passbolt.com";
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const expectedKeySettings = MetadataKeysSettingsEntity.createFromDefault();
      const expectedTypeSettings = MetadataTypesSettingsEntity.createFromV5Default();

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.generateMetadataKeyService, "generateKey");
      jest.spyOn(orchestrator.createMetadataKeyService, "create").mockImplementation(() => {});
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveKeysSettings").mockImplementation(() => {});
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveTypesSettings").mockImplementation(() => {});

      await orchestrator.enableEncryptedMetadataForNewInstance(passphrase);

      expect(orchestrator.generateMetadataKeyService.generateKey).toHaveBeenCalledTimes(1);
      expect(orchestrator.generateMetadataKeyService.generateKey).toHaveBeenCalledWith(passphrase);

      expect(orchestrator.createMetadataKeyService.create).toHaveBeenCalledTimes(1);
      expect(orchestrator.createMetadataKeyService.create).toHaveBeenCalledWith(expect.any(ExternalGpgKeyPairEntity), passphrase);

      expect(orchestrator.saveMetadaSettingsService.saveKeysSettings).toHaveBeenCalledTimes(1);
      expect(orchestrator.saveMetadaSettingsService.saveKeysSettings).toHaveBeenCalledWith(expectedKeySettings);

      expect(orchestrator.saveMetadaSettingsService.saveTypesSettings).toHaveBeenCalledTimes(1);
      expect(orchestrator.saveMetadaSettingsService.saveTypesSettings).toHaveBeenCalledWith(expectedTypeSettings);
    });

    it("should not intercept errors if anything goes wrong and let the caller manage it: errors from the key generation", async() => {
      expect.assertions(1);

      const passphrase = "ada@passbolt.com";
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.createMetadataKeyService, "create").mockImplementation(() => { throw new Error("unexpected error"); });

      await expect(() => orchestrator.enableEncryptedMetadataForNewInstance(passphrase)).rejects.toThrowError();
    });

    it("should not intercept errors if anything goes wrong and let the caller manage it: errors from the key save", async() => {
      expect.assertions(1);

      const passphrase = "ada@passbolt.com";
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.createMetadataKeyService, "create").mockImplementation(() => { throw new Error("unexpected error"); });

      await expect(() => orchestrator.enableEncryptedMetadataForNewInstance(passphrase)).rejects.toThrowError();
    });

    it("should not intercept errors if anything goes wrong and let the caller manage it: errors from saving the key settings", async() => {
      expect.assertions(1);

      const passphrase = "ada@passbolt.com";
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.createMetadataKeyService, "create").mockImplementation(() => {});
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveKeysSettings").mockImplementation(() => { throw new Error("unexpected error"); });

      await expect(() => orchestrator.enableEncryptedMetadataForNewInstance(passphrase)).rejects.toThrowError();
    });

    it("should not intercept errors if anything goes wrong and let the caller manage it: errors from saving the types settings", async() => {
      expect.assertions(1);

      const passphrase = "ada@passbolt.com";
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.createMetadataKeyService, "create").mockImplementation(() => {});
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveKeysSettings").mockImplementation(() => {});
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveTypesSettings").mockImplementation(() => { throw new Error("unexpected error"); });

      await expect(() => orchestrator.enableEncryptedMetadataForNewInstance(passphrase)).rejects.toThrowError();
    });
  });

  describe("::enableEncryptedMetadataForExistingInstance", () => {
    it("should orchestrate all the necessary service in order to activate the encryption of metadata", async() => {
      expect.assertions(8);

      const passphrase = "ada@passbolt.com";
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const expectedKeySettings = MetadataKeysSettingsEntity.createFromDefault();
      const expectedTypeSettings = MetadataTypesSettingsEntity.createFromV5Default({
        allow_v4_v5_upgrade: true
      });

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.generateMetadataKeyService, "generateKey");
      jest.spyOn(orchestrator.createMetadataKeyService, "create").mockImplementation(() => {});
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveKeysSettings").mockImplementation(() => {});
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveTypesSettings").mockImplementation(() => {});

      await orchestrator.enableEncryptedMetadataForExistingInstance(passphrase);

      expect(orchestrator.generateMetadataKeyService.generateKey).toHaveBeenCalledTimes(1);
      expect(orchestrator.generateMetadataKeyService.generateKey).toHaveBeenCalledWith(passphrase);

      expect(orchestrator.createMetadataKeyService.create).toHaveBeenCalledTimes(1);
      expect(orchestrator.createMetadataKeyService.create).toHaveBeenCalledWith(expect.any(ExternalGpgKeyPairEntity), passphrase);

      expect(orchestrator.saveMetadaSettingsService.saveKeysSettings).toHaveBeenCalledTimes(1);
      expect(orchestrator.saveMetadaSettingsService.saveKeysSettings).toHaveBeenCalledWith(expectedKeySettings);

      expect(orchestrator.saveMetadaSettingsService.saveTypesSettings).toHaveBeenCalledTimes(1);
      expect(orchestrator.saveMetadaSettingsService.saveTypesSettings).toHaveBeenCalledWith(expectedTypeSettings);
    });

    it("should not intercept errors if anything goes wrong and let the caller manage it: errors from the key generation", async() => {
      expect.assertions(1);

      const passphrase = "ada@passbolt.com";
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.createMetadataKeyService, "create").mockImplementation(() => { throw new Error("unexpected error"); });

      await expect(() => orchestrator.enableEncryptedMetadataForExistingInstance(passphrase)).rejects.toThrowError();
    });

    it("should not intercept errors if anything goes wrong and let the caller manage it: errors from the key save", async() => {
      expect.assertions(1);

      const passphrase = "ada@passbolt.com";
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.createMetadataKeyService, "create").mockImplementation(() => { throw new Error("unexpected error"); });

      await expect(() => orchestrator.enableEncryptedMetadataForExistingInstance(passphrase)).rejects.toThrowError();
    });

    it("should not intercept errors if anything goes wrong and let the caller manage it: errors from saving the key settings", async() => {
      expect.assertions(1);

      const passphrase = "ada@passbolt.com";
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.createMetadataKeyService, "create").mockImplementation(() => {});
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveKeysSettings").mockImplementation(() => { throw new Error("unexpected error"); });

      await expect(() => orchestrator.enableEncryptedMetadataForExistingInstance(passphrase)).rejects.toThrowError();
    });

    it("should not intercept errors if anything goes wrong and let the caller manage it: errors from saving the types settings", async() => {
      expect.assertions(1);

      const passphrase = "ada@passbolt.com";
      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.createMetadataKeyService, "create").mockImplementation(() => {});
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveKeysSettings").mockImplementation(() => {});
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveTypesSettings").mockImplementation(() => { throw new Error("unexpected error"); });

      await expect(() => orchestrator.enableEncryptedMetadataForExistingInstance(passphrase)).rejects.toThrowError();
    });
  });

  describe("::keepCleartextMetadataForExistingInstance", () => {
    it("should orchestrate all the necessary service in order to deactivate the encryption of metadata", async() => {
      expect.assertions(2);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const expectedTypeSettings = MetadataTypesSettingsEntity.createFromV4Default();

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveTypesSettings").mockImplementation(() => {});

      await orchestrator.keepCleartextMetadataForExistingInstance();

      expect(orchestrator.saveMetadaSettingsService.saveTypesSettings).toHaveBeenCalledTimes(1);
      expect(orchestrator.saveMetadaSettingsService.saveTypesSettings).toHaveBeenCalledWith(expectedTypeSettings);
    });

    it("should not intercept errors if anything goes wrong and let the caller manage it: errors from saving the types settings", async() => {
      expect.assertions(1);

      const account = new AccountEntity(defaultAccountDto());
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

      const orchestrator = new ConfigureMetadataSettingsService(account, apiClientOptions);
      jest.spyOn(orchestrator.saveMetadaSettingsService, "saveTypesSettings").mockImplementation(() => { throw new Error("unexpected error"); });

      await expect(() => orchestrator.keepCleartextMetadataForExistingInstance()).rejects.toThrowError();
    });
  });
});
