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

import DownloadUserPrivateKeyController from "./downloadUserPrivateKeyController";
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";
import GpgKeyError from "../../error/GpgKeyError";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import {PassphraseController} from "../passphrase/passphraseController";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import FileService from "../../service/file/fileService";

const mockedSaveFile = jest.spyOn(FileService, "saveFile");

jest.mock("../passphrase/passphraseController");

const expectedTabId = "tabIdentifier";
const mockedWorker = {tab: {id: expectedTabId}};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DownloadUserPrivateKeyController", () => {
  it(`Should trigegr a file download with the private key`, async() => {
    expect.assertions(8);
    await MockExtension.withConfiguredAccount();
    PassphraseController.request.mockResolvedValue("");
    const controller = new DownloadUserPrivateKeyController(mockedWorker, null);
    const privateKey = pgpKeys.ada;

    mockedSaveFile.mockImplementation(async(fileName, fileContent, fileContentType, workerTabId) => {
      expect(fileName).toBe("passbolt_private.asc");
      expect(fileContentType).toBe("text/plain");
      expect(workerTabId).toBe(expectedTabId);

      const keyFromFile = await OpenpgpAssertion.readKeyOrFail(fileContent);
      const downloadedKeyInfo = await GetGpgKeyInfoService.getKeyInfo(keyFromFile);
      expect(downloadedKeyInfo.private).toBe(true);
      expect(downloadedKeyInfo.keyId).toBe(privateKey.key_id);
      expect(downloadedKeyInfo.fingerprint).toBe(privateKey.fingerprint);
    });

    await controller.exec();

    expect(mockedSaveFile).toHaveBeenCalledTimes(1);
    expect(PassphraseController.request).toHaveBeenCalledTimes(1);
  });

  it(`Should throw an exception if the user's private key can't be find`, async() => {
    expect.assertions(3);
    MockExtension.withMissingPrivateKeyAccount();
    PassphraseController.request.mockResolvedValue("");
    const controller = new DownloadUserPrivateKeyController(mockedWorker, null);

    await expect(controller.exec()).rejects.toThrowError(new GpgKeyError("Private key not found."));
    expect(mockedSaveFile).not.toHaveBeenCalled();
    expect(PassphraseController.request).toHaveBeenCalledTimes(1);
  });
});
