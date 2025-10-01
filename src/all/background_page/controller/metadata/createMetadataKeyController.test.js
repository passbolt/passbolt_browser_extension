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
 * @since         4.11.0
 */

import expect from "expect";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import CreateMetadataKeyController from "./createMetadataKeyController";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import ExternalGpgKeyPairEntity
  from "passbolt-styleguide/src/shared/models/entity/gpgkey/external/externalGpgKeyPairEntity";

describe("CreateMetadataKeyController", () => {
  describe("::exec", () => {
    let controller, account, apiClientOptions;

    beforeEach(async() => {
      account = new AccountEntity(defaultAccountDto());
      apiClientOptions = defaultApiClientOptions();
      controller = new CreateMetadataKeyController(null, null, account, apiClientOptions);
      await controller.createMetadataKeyService.getOrFindMetadataSettings.metadataKeysSettingsLocalStorage.flush();
    });

    it("Create the metadata key.", async() => {
      expect.assertions(3);

      const metadataKeyPairDto = {
        private_key: {armored_key: pgpKeys.eddsa_ed25519.private},
        public_key: {armored_key: pgpKeys.eddsa_ed25519.public},
      };

      jest.spyOn(controller.createMetadataKeyService, "create")
        .mockReturnValue(new MetadataKeyEntity(defaultMetadataKeyDto()));
      jest.spyOn(controller.getPassphraseService, "getPassphrase")
        .mockResolvedValue(pgpKeys.ada.passphrase);

      const savedMetadataKey = await controller.exec(metadataKeyPairDto);

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalled();
      expect(controller.createMetadataKeyService.create).toHaveBeenCalledWith(
        new ExternalGpgKeyPairEntity(metadataKeyPairDto),
        pgpKeys.ada.passphrase,
      );
      expect(savedMetadataKey).toBeInstanceOf(MetadataKeyEntity);
    });

    it("throws if the parameters are not valid.", async() => {
      expect.assertions(1);
      await expect(() => controller.exec({}))
        .toThrowEntityValidationError("private_key", "required");
    });
  });
});
