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

import DownloadRecoveryKitController from "./downloadRecoverKitController";
import {
  startAccountSetupDto,
  withUserKeyAccountSetupDto
} from "../../model/entity/account/accountSetupEntity.test.data";
import AccountSetupEntity from "../../model/entity/account/accountSetupEntity";
import FileService from "../../service/file/fileService";

jest.mock("../../service/file/fileService");

describe("DownloadRecoveryKitController", () => {
  describe("DownloadRecoveryKitController::exec", () => {
    it("Should throw an exception if the account does have a defined user armored private key.", async() => {
      const account = new AccountSetupEntity(startAccountSetupDto());
      const controller = new DownloadRecoveryKitController(null, null, account);

      expect.assertions(1);
      const promise = controller.exec();
      await expect(promise).rejects.toThrowError("An account user private armored key is required.");
    });

    it("Should trigger the recovery kit download.", async() => {
      FileService.saveFile = jest.fn();
      const mockedWorker = {
        tab: {
          id: "id"
        }
      };

      const account = new AccountSetupEntity(withUserKeyAccountSetupDto());
      const controller = new DownloadRecoveryKitController(mockedWorker, null, account);

      expect.assertions(1);
      await controller.exec();
      expect(FileService.saveFile).toHaveBeenCalledWith(
        "passbolt-recovery-kit.asc",
        account.userPrivateArmoredKey,
        "text/plain",
        mockedWorker.tab.id
      );
    });
  });
});
