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
 * @since         5.0.0
 */
import DownloadOrganizationGeneratedKey from "./downloadOrganizationGenerateKeyController";
import FileService from "../../service/file/fileService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";

beforeEach(() => {
  jest.useFakeTimers(); //avoid shift of a few seconds crashing the tests.
});

describe("DownloadOrganizationGeneratedKey", () => {
  describe("::exec", () => {
    it("Should call for file service to trigger a download with the right information.", async() => {
      expect.assertions(2);
      const armoredPrivateKey = pgpKeys.account_recovery_organization.private;
      const now = new Date().toISOString().slice(0, 10);
      const keyId = pgpKeys.account_recovery_organization.key_id;
      const expectedFilename = `organization-recovery-private-key_${now}_${keyId}.asc`;

      const mockedWorker = {tab: {id: "tabID"}};
      const controller = new DownloadOrganizationGeneratedKey(mockedWorker);
      jest.spyOn(FileService, "saveFile").mockImplementation(() => {});

      await controller.exec(armoredPrivateKey);

      expect(FileService.saveFile).toHaveBeenCalledTimes(1);
      expect(FileService.saveFile).toHaveBeenCalledWith(expectedFilename, armoredPrivateKey, "text/plain", mockedWorker.tab.id);
    });

    it("Should throw an error if the given string is not a valid open pgp key.", async() => {
      expect.assertions(1);
      const controller = new DownloadOrganizationGeneratedKey();
      await expect(() => controller.exec("test")).rejects.toThrowError();
    });
  });
});
