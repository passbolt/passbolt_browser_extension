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
import FileService from "../../service/file/fileService";
import GetLegacyAccountService from "../../service/account/getLegacyAccountService";
import {Buffer} from 'buffer';
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import DecryptPrivateKeyService from "../../service/crypto/decryptPrivateKeyService";
import SignMessageService from "../../service/crypto/signMessageService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

describe("ExportDesktopAccountController", () => {
  const account = new AccountEntity(defaultAccountDto());
  const controller = new ExportDesktopAccountController(worker, requestId, account);

  beforeEach(() => {
    jest.spyOn(controller.getPassphraseService, "requestPassphrase").mockImplementation(() => pgpKeys.ada.passphrase);
    jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
    jest.spyOn(controller.desktopTransferModel, "getAccountKit");
  });

  describe("ExportDesktopAccountController::exec", () => {
    it("Should request the passphrase before any other action.", async() => {
      expect.assertions(3);
      //Simulate an error to check is the other methods have not been called
      jest.spyOn(controller.getPassphraseService, "requestPassphrase").mockRejectedValue(() => new Error());
      jest.spyOn(FileService, "saveFile").mockImplementation(jest.fn());

      try {
        await controller.exec();
      } catch {}

      expect(controller.getPassphraseService.requestPassphrase).toHaveBeenCalledWith(worker);
      expect(controller.desktopTransferModel.getAccountKit).not.toHaveBeenCalled();
      expect(FileService.saveFile).not.toHaveBeenCalled();
    });
    it("Should save the signed account kit.", async() => {
      expect.assertions(5);

      let resultSignedAccountKit;
      jest.spyOn(DecryptPrivateKeyService, "decrypt");
      jest.spyOn(SignMessageService, "signClearMessage");
      jest.spyOn(FileService, "saveFile").mockImplementation(jest.fn((_, content) => {
        resultSignedAccountKit = content;
      }));

      await controller.exec();

      expect(SignMessageService.signClearMessage).toHaveBeenCalled();
      expect(DecryptPrivateKeyService.decrypt).toHaveBeenCalled();
      expect(controller.desktopTransferModel.getAccountKit).toHaveBeenCalled();
      expect(FileService.saveFile).toHaveBeenCalledWith("account-kit.passbolt", expect.anything(), "application/passbolt", worker.tab.id);
      // Assert the account kit output.
      const signedResultAccountKit = Buffer.from(resultSignedAccountKit, "base64").toString();
      const serializedResultAccountKit = await OpenpgpAssertion.readClearMessageOrFail(signedResultAccountKit);
      const resultAccountKitDto = JSON.parse(serializedResultAccountKit.getText());
      expect(resultAccountKitDto.user_id).toEqual(account.userId);
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
      controller.getPassphraseService.requestPassphrase.mockRejectedValue(error);

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith(requestId, 'ERROR', error);
    });
  });
});

