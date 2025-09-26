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
 * @since         5.6.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import RotateMetadataKeyController from "./rotateMetadataKeyController";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {v4 as uuidv4} from "uuid";
import ExternalGpgKeyPairEntity
  from "passbolt-styleguide/src/shared/models/entity/gpgkey/external/externalGpgKeyPairEntity";

describe("RotateMetadataKeyController", () => {
  describe("::exec", () => {
    it("Rotate the metadata key.", async() => {
      expect.assertions(4);

      const passphrase = "ada@passbolt.com";
      const worker = {port: new MockPort()};
      const controller = new RotateMetadataKeyController(worker, null, defaultApiClientOptions(), new AccountEntity(defaultAccountDto()));

      jest.spyOn(controller.rotateMetadataKeyService, "rotate").mockReturnValue();
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockReturnValue(passphrase);
      jest.spyOn(controller.progressService, "start");
      jest.spyOn(controller.progressService, "close");

      const metadataKeyPairDto = {
        private_key: {armored_key: pgpKeys.eddsa_ed25519.private},
        public_key: {armored_key: pgpKeys.eddsa_ed25519.public},
      };

      const metadataKeyId = uuidv4();

      await controller.exec(metadataKeyPairDto, metadataKeyId);

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.rotateMetadataKeyService.rotate).toHaveBeenNthCalledWith(1,  new ExternalGpgKeyPairEntity(metadataKeyPairDto), metadataKeyId, passphrase);
      expect(controller.progressService.start).toHaveBeenNthCalledWith(1, 5, "Rotating metadata key");
      expect(controller.progressService.close).toHaveBeenCalledTimes(1);
    });
  });
});
