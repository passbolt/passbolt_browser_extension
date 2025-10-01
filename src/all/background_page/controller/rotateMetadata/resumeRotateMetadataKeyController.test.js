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
import ResumeRotateMetadataKeyController from "./resumeRotateMetadataKeyController";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";

describe("ResumeRotateMetadataKeyController", () => {
  describe("::exec", () => {
    it("Resume rotation of the metadata key.", async() => {
      expect.assertions(4);

      const passphrase = "ada@passbolt.com";
      const worker = {port: new MockPort()};
      const controller = new ResumeRotateMetadataKeyController(worker, null, defaultApiClientOptions(), new AccountEntity(defaultAccountDto()));

      jest.spyOn(controller.rotateMetadataKeyService, "resumeRotate").mockReturnValue();
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockReturnValue(passphrase);
      jest.spyOn(controller.progressService, "start");
      jest.spyOn(controller.progressService, "close");

      const metadataKeyEntity = new MetadataKeyEntity(defaultMetadataKeyDto());

      await controller.exec(metadataKeyEntity);

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.rotateMetadataKeyService.resumeRotate).toHaveBeenNthCalledWith(1,  metadataKeyEntity, passphrase);
      expect(controller.progressService.start).toHaveBeenNthCalledWith(1, 4, "Resume rotating metadata key");
      expect(controller.progressService.close).toHaveBeenCalledTimes(1);
    });
  });
});
