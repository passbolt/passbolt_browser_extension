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
 * @since         4.10.1
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import MoveFolderController from "./moveFolderController";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {v4 as uuidv4} from "uuid";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";

describe("MoveFolderController", () => {
  describe("::exec", () => {
    let worker, account, controller;

    beforeEach(() => {
      worker = {port: new MockPort()};
      account = new AccountEntity(defaultAccountDto());
      controller = new MoveFolderController(worker, null, defaultApiClientOptions(), account);
    });

    it("Should move a folder", async() => {
      expect.assertions(2);
      const expectedFolderId = uuidv4();
      const expectedDestinationFolderId = uuidv4();

      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockReturnValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.moveOneFolderService, "moveOne").mockImplementation(jest.fn);

      await controller.exec(expectedFolderId, expectedDestinationFolderId);

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.moveOneFolderService.moveOne).toHaveBeenCalledWith(
        expectedFolderId,
        expectedDestinationFolderId,
        controller.confirmMoveStrategyService,
        pgpKeys.ada.passphrase
      );
    });

    it("throws if the parameters are invalid", async() => {
      expect.assertions(7);

      jest.spyOn(controller.getPassphraseService, "getPassphrase");
      jest.spyOn(controller.moveOneFolderService, "moveOne");

      await expect(() => controller.exec()).rejects.toThrow("The parameter \"folderId\" should be a UUID");
      await expect(() => controller.exec(null)).rejects.toThrow("The parameter \"folderId\" should be a UUID");
      await expect(() => controller.exec(42)).rejects.toThrow("The parameter \"folderId\" should be a UUID");
      await expect(() => controller.exec(uuidv4(), 42)).rejects.toThrow("The parameter \"destinationFolderId\" should be a UUID");
      const sameId = uuidv4();
      await expect(() => controller.exec(sameId, sameId)).rejects.toThrow("The folder cannot be moved inside itself.");

      expect(controller.getPassphraseService.getPassphrase).not.toHaveBeenCalled();
      expect(controller.moveOneFolderService.moveOne).not.toHaveBeenCalled();
    });
  });
});
