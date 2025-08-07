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
 * @since         5.1.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import {
  decryptedMetadataPrivateKeyDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import {
  defaultMetadataTrustedKeyDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity.test.data";
import MetadataTrustedKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {v4 as uuidv4} from "uuid";
import MockExtension from "../../../../../test/mocks/mockExtension";
import VerifyOrTrustMetadataKeyService from "./verifyOrTrustMetadataKeyService";
import UntrustedMetadataKeyError from "../../error/UntrustedMetadataKeyError";
import {
  defaultCeOrganizationSettings
} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";

describe("VerifyOrTrustMetadataKeyService", () => {
  let account, apiClientOptions, service;
  beforeEach(async() => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
    await MockExtension.withConfiguredAccount();
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    service = new VerifyOrTrustMetadataKeyService(null, account, apiClientOptions);
    // Flush the storages.
    await service.metadataKeysSessionStorage.flush();
    // Mock the site settings
    const siteSettingsDto = defaultCeOrganizationSettings();
    jest.spyOn(service.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);
  });

  describe('::verifyTrustedOrTrustNewMetadataKey', () => {
    it("does nothing if the plugin metadata is disabled", async() => {
      expect.assertions(1);

      const siteSettingsDto = defaultCeOrganizationSettings();
      delete siteSettingsDto.passbolt.plugins.metadata;
      jest.spyOn(service.organisationSettingsModel.organizationSettingsService, "find").mockImplementation(() => siteSettingsDto);
      await expect(service.verifyTrustedOrTrustNewMetadataKey(pgpKeys.ada.passphrase)).resolves.not.toThrow();
    });

    it("trusts the metadata key if no metadata key already trusted.", async() => {
      expect.assertions(2);

      const id = uuidv4();
      const metadataPrivateKeysDto = [decryptedMetadataPrivateKeyDto({metadata_key_id: id, user_id: account.userId})];
      const metadataKeyDto = defaultMetadataKeyDto({id: id, metadata_private_keys: metadataPrivateKeysDto});
      const metadataKeysCollection = new MetadataKeysCollection([metadataKeyDto]);
      service.metadataKeysSessionStorage.set(metadataKeysCollection);

      jest.spyOn(service.trustMetadataKeyService, "trust").mockImplementationOnce(jest.fn);
      jest.spyOn(service.confirmMetadataKeyContentCodeService, "requestConfirm").mockImplementationOnce(jest.fn);

      await service.verifyTrustedOrTrustNewMetadataKey(pgpKeys.ada.passphrase);

      expect(service.trustMetadataKeyService.trust).toHaveBeenCalledWith(metadataKeysCollection.items[0].metadataPrivateKeys.items[0], pgpKeys.ada.passphrase);
      expect(service.confirmMetadataKeyContentCodeService.requestConfirm).not.toHaveBeenCalled();
    });

    it("does nothing if the metadata key is already trusted.", async() => {
      expect.assertions(2);

      const id = uuidv4();
      const fingerprint = pgpKeys.metadataKey.fingerprint;
      const metadataPrivateKeysDto = [decryptedMetadataPrivateKeyDto({metadata_key_id: id, user_id: account.userId})];
      const metadataKeyDto = defaultMetadataKeyDto({id: id, fingerprint: fingerprint, metadata_private_keys: metadataPrivateKeysDto});
      const metadataKeysCollection = new MetadataKeysCollection([metadataKeyDto]);
      service.metadataKeysSessionStorage.set(metadataKeysCollection);
      const trustedMetadataKey = new MetadataTrustedKeyEntity({
        fingerprint: metadataKeyDto.fingerprint,
        signed: (new Date()).toISOString()
      });
      await service.getMetadataTrustedKeyService.trustedMetadataKeyLocalStorage.set(trustedMetadataKey);

      jest.spyOn(service.trustMetadataKeyService, "trust").mockImplementationOnce(jest.fn);
      jest.spyOn(service.confirmMetadataKeyContentCodeService, "requestConfirm").mockImplementationOnce(jest.fn);

      await service.verifyTrustedOrTrustNewMetadataKey(pgpKeys.ada.passphrase);

      expect(service.trustMetadataKeyService.trust).not.toHaveBeenCalled();
      expect(service.confirmMetadataKeyContentCodeService.requestConfirm).not.toHaveBeenCalled();
    });

    it("does nothing if the user does not have a metadata private key shared with the active metadata key returned by the server.", async() => {
      expect.assertions(2);

      const metadataKeyDto = defaultMetadataKeyDto();
      const metadataKeysCollection = new MetadataKeysCollection([metadataKeyDto]);

      jest.spyOn(service.getOrFindMetadataKeysService.findAndUpdateMetadataKeysService.findMetadataKeysService, "findAll").mockReturnValue(metadataKeysCollection);
      jest.spyOn(service.trustMetadataKeyService, "trust").mockImplementationOnce(jest.fn);
      jest.spyOn(service.confirmMetadataKeyContentCodeService, "requestConfirm").mockImplementationOnce(jest.fn);

      await service.verifyTrustedOrTrustNewMetadataKey(pgpKeys.ada.passphrase);

      expect(service.trustMetadataKeyService.trust).not.toHaveBeenCalled();
      expect(service.confirmMetadataKeyContentCodeService.requestConfirm).not.toHaveBeenCalled();
    });

    it("throws if the active metadata key is not the one already trusted, and the user does not trust it.", async() => {
      expect.assertions(2);

      const id = uuidv4();
      const fingerprint = pgpKeys.metadataKey.fingerprint;
      const metadataPrivateKeysDto = [decryptedMetadataPrivateKeyDto({metadata_key_id: id, user_id: account.userId})];
      const metadataKeyDto = defaultMetadataKeyDto({id: id, fingerprint: fingerprint, metadata_private_keys: metadataPrivateKeysDto});
      const metadataKeysCollection = new MetadataKeysCollection([metadataKeyDto]);
      service.metadataKeysSessionStorage.set(metadataKeysCollection);
      const trustedMetadataKey = new MetadataTrustedKeyEntity(defaultMetadataTrustedKeyDto({fingerprint: pgpKeys.ada.fingerprint}));
      await service.getMetadataTrustedKeyService.trustedMetadataKeyLocalStorage.set(trustedMetadataKey);

      jest.spyOn(service.trustMetadataKeyService, "trust").mockImplementationOnce(jest.fn);
      jest.spyOn(service.confirmMetadataKeyContentCodeService, "requestConfirm").mockImplementationOnce(() => false);

      expect(() => service.verifyTrustedOrTrustNewMetadataKey(pgpKeys.ada.passphrase)).rejects.toThrow(UntrustedMetadataKeyError);
      expect(service.trustMetadataKeyService.trust).not.toHaveBeenCalled();
    });

    it("trusts the active metadata key if the key is not the one already trusted, and the user confirm it trusts it.", async() => {
      expect.assertions(1);

      const id = uuidv4();
      const fingerprint = pgpKeys.metadataKey.fingerprint;
      const metadataPrivateKeysDto = [decryptedMetadataPrivateKeyDto({metadata_key_id: id, user_id: account.userId})];
      const metadataKeyDto = defaultMetadataKeyDto({id: id, fingerprint: fingerprint, metadata_private_keys: metadataPrivateKeysDto});
      const metadataKeysCollection = new MetadataKeysCollection([metadataKeyDto]);
      service.metadataKeysSessionStorage.set(metadataKeysCollection);
      const trustedMetadataKey = new MetadataTrustedKeyEntity(defaultMetadataTrustedKeyDto({fingerprint: pgpKeys.ada.fingerprint}));
      await service.getMetadataTrustedKeyService.trustedMetadataKeyLocalStorage.set(trustedMetadataKey);

      jest.spyOn(service.trustMetadataKeyService, "trust").mockImplementationOnce(jest.fn);
      jest.spyOn(service.confirmMetadataKeyContentCodeService, "requestConfirm").mockImplementationOnce(() => true);

      await service.verifyTrustedOrTrustNewMetadataKey(pgpKeys.ada.passphrase);
      expect(service.trustMetadataKeyService.trust).toHaveBeenCalledWith(metadataKeysCollection.items[0].metadataPrivateKeys.items[0], pgpKeys.ada.passphrase);
    });

    it("throws if the passphrase parameter is not valid.", async() => {
      expect.assertions(1);
      await expect(() => service.verifyTrustedOrTrustNewMetadataKey(42)).rejects.toThrow("The parameter \"passphrase\" should be a string.");
    });
  });
});
