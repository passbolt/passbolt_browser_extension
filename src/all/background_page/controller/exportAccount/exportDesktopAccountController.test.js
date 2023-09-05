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
 * @since         4.3.0
 */
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import ExportDesktopAccountController from "./exportDesktopAccountController";
import {requestId, worker} from "./exportDesktopAccountController.test.data";
import {PassphraseController} from "../../controller/passphrase/passphraseController";
import FileService from "../../service/file/fileService";
import GetLegacyAccountService from "../../service/account/getLegacyAccountService";
import AccountKitEntity from "../../model/entity/account/accountKitEntity";
import {Buffer} from 'buffer';

describe("ExportDesktopAccountController", () => {
  const accountDto = new AccountEntity(defaultAccountDto());
  const controller = new ExportDesktopAccountController(worker, requestId, accountDto);

  beforeEach(() => {
    jest.spyOn(PassphraseController, "get").mockImplementation(() => true);
    jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => accountDto);
    jest.spyOn(FileService, "saveFile").mockImplementation(jest.fn());
    jest.spyOn(controller.desktopTransferModel, "getAccountKit");
  });

  describe("ExportDesktopAccountController::exec", () => {
    it("Should request the passphrase before any other action.", async() => {
      expect.assertions(3);
      //Simulate an error to check is the other methods have not been called
      jest.spyOn(PassphraseController, "get").mockRejectedValue(() => new Error());

      try {
        await controller.exec();
      } catch {}

      expect(PassphraseController.get).toHaveBeenCalledWith(worker);
      expect(controller.desktopTransferModel.getAccountKit).not.toHaveBeenCalled();
      expect(FileService.saveFile).not.toHaveBeenCalled();
    });
    it("Should save the account kit.", async() => {
      expect.assertions(2);
      await controller.exec();

      const accountToExport = new AccountKitEntity(accountDto.toDto({
        user_private_armored_key: true,
        security_token: true
      }));

      const base64Content =  Buffer.from(JSON.stringify(accountToExport.toDto())).toString('base64');

      expect(controller.desktopTransferModel.getAccountKit).toHaveBeenCalled();
      expect(FileService.saveFile).toHaveBeenCalledWith("account-kit.passbolt", base64Content, "application/passbolt", worker.tab.id);
    });
  });

  describe("ExportDesktopAccountController::_exec", () => {
    it("Should call exec method.", async() => {
      expect.assertions(1);
      jest.spyOn(controller, "exec");

      await controller._exec();

      expect(controller.exec).toHaveBeenCalled();
    });

    it("Should emit success when the file is downloaded.", async() => {
      expect.assertions(1);
      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, 'SUCCESS');
    });


    it("Should emit error when an error occured.", async() => {
      expect.assertions(1);
      const error = new Error('Cannot download');
      PassphraseController.get = jest.fn().mockRejectedValue(error);

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, 'ERROR', error);
    });
  });
});
