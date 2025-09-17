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
import RotateResourcesMetadataKeyController from "./rotateResourcesMetadataKeyController";

describe("RotateResourcesMetadataKeyController", () => {
  describe("::exec", () => {
    it("Rotate the resources metadata.", async() => {
      expect.assertions(4);

      const passphrase = "ada@passbolt.com";
      const worker = {port: new MockPort()};
      const controller = new RotateResourcesMetadataKeyController(worker, null, defaultApiClientOptions(), new AccountEntity(defaultAccountDto()));

      jest.spyOn(controller.rotateResourcesMetadataKeyService, "rotate").mockReturnValue();
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockReturnValue(passphrase);
      jest.spyOn(controller.progressService, "start");
      jest.spyOn(controller.progressService, "close");

      await controller.exec();

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.rotateResourcesMetadataKeyService.rotate).toHaveBeenNthCalledWith(1, passphrase, {count: 0});
      expect(controller.progressService.start).toHaveBeenNthCalledWith(1, 10, "Rotating metadata");
      expect(controller.progressService.close).toHaveBeenCalledTimes(1);
    });
  });
});
