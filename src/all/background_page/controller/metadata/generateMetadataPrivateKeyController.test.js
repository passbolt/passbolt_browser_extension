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

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import GenerateMetadataPrivateKeyController from "./generateMetadataPrivateKeyController";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import ExternalGpgKeyPairEntity
  from "passbolt-styleguide/src/shared/models/entity/gpgkey/external/externalGpgKeyPairEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GenerateMetadataPrivateKeyController", () => {
  let controller, account;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    controller = new GenerateMetadataPrivateKeyController(null, null, account);
  });

  describe("::exec", () => {
    it("generates a metadata key", async() => {
      expect.assertions(3);

      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.generateMetadataKeyService, "generateKey");

      const keyPair = await controller.exec();

      expect(keyPair).toBeInstanceOf(ExternalGpgKeyPairEntity);
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalled();
      expect(controller.generateMetadataKeyService.generateKey).toHaveBeenCalledWith(pgpKeys.ada.passphrase);
    });

    it("throws if the passphrase is invalid", async() => {
      expect.assertions(1);

      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.betty.passphrase);

      await expect(() => controller.exec()).rejects.toThrow("This is not a valid passphrase");
    });
  });
});
