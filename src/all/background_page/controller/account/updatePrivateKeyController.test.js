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
 * @since         3.6.3
 */
import {v4 as uuidv4} from "uuid";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import DecryptPrivateKeyService from "../../service/crypto/decryptPrivateKeyService";
import UpdatePrivateKeyController from "./updatePrivateKeyController";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {FileController} from "../fileController";

const mockedSaveFile = jest.spyOn(FileController, "saveFile");

describe("UpdatePrivateKeyController", () => {
  describe("UpdatePrivateKeyController::exec", () => {
    it("Should trigger the download of the recovery kit with the new passphrase.", async() => {
      expect.assertions(4);

      await MockExtension.withConfiguredAccount();
      mockedSaveFile.mockImplementation(async(fileName, fileContent, fileContentType, workerTabId) => {
        expect(fileName).toStrictEqual("passbolt-recovery-kit.asc");
        expect(fileContentType).toStrictEqual("text/plain");
        expect(workerTabId).toStrictEqual(worker.tab.id);

        const key = await OpenpgpAssertion.readKeyOrFail(fileContent);
        OpenpgpAssertion.assertEncryptedPrivateKey(key);

        const decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(key, newPassphrase);
        expect(decryptedPrivateKey).toBeTruthy();
      });

      const worker = {
        tab: {
          id: uuidv4()
        }
      };

      const controller = new UpdatePrivateKeyController(worker, null, defaultApiClientOptions());
      const oldPassphrase = pgpKeys.ada.passphrase;
      const newPassphrase = "newPassphrase";
      await controller.exec(oldPassphrase, newPassphrase);
    });

    it("Should throw an error if no passphrase is provided.", async() => {
      expect.assertions(2);
      await MockExtension.withConfiguredAccount();
      const controller = new UpdatePrivateKeyController(null, null, defaultApiClientOptions());

      const nullPassphrase = null;
      const stringPassphrase = "stringPassphrase";
      const expectedError = new Error("The old and new passphrase have to be string");
      try {
        await controller.exec(nullPassphrase, stringPassphrase);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }

      try {
        await controller.exec(stringPassphrase, nullPassphrase);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });

    it("Should throw an error if passphrases are not strings.", async() => {
      expect.assertions(2);
      await MockExtension.withConfiguredAccount();
      const controller = new UpdatePrivateKeyController(null, null, defaultApiClientOptions());

      const notStringPassphrase = {};
      const stringPassphrase = "stringPassphrase";
      const expectedError = new Error("The old and new passphrase have to be string");
      try {
        await controller.exec(notStringPassphrase, stringPassphrase);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }

      try {
        await controller.exec(stringPassphrase, notStringPassphrase);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
