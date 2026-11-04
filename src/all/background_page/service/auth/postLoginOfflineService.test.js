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
 * @since         6.0.0
 */
import PostLoginOfflineService from "./postLoginOfflineService";
import PostLoginService from "./postLoginService";
import OfflineSessionExpiryAlarmService from "./offlineSessionExpiryAlarmService";
import FindAndUpdateActiveSessionSessionStorageService from "../activeSession/findAndUpdateActiveSessionSessionStorageService";
import toolbarService from "../toolbar/toolbarService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import FindAndUpdateMetadataKeysSessionStorageFromOPFSService from "../metadata/findAndUpdateMetadataKeysSessionStorageFromOPFSService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PostLoginOfflineService", () => {
  const passphrase = "ada@passbolt.com";
  let account, apiClientOptions;

  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    jest.spyOn(PassphraseStorageService, "set").mockResolvedValue();
    jest.spyOn(FindAndUpdateActiveSessionSessionStorageService.prototype, "authenticateOffline").mockResolvedValue();
    jest
      .spyOn(FindAndUpdateMetadataKeysSessionStorageFromOPFSService.prototype, "findAndUpdateAll")
      .mockResolvedValue();
    jest.spyOn(OfflineSessionExpiryAlarmService, "scheduleSessionExpiry").mockResolvedValue();
    jest.spyOn(PostLoginService, "sendLoginEventForWorkers").mockResolvedValue();
    jest.spyOn(toolbarService, "handleUserLoggedIn").mockImplementation(() => {});
  });

  describe("::exec", () => {
    it("runs the offline post-login subset: updates the active session, schedules the expiry alarm and notifies the workers", async () => {
      expect.assertions(6);
      const service = new PostLoginOfflineService(account, apiClientOptions);

      await service.exec(passphrase, 300);

      expect(PassphraseStorageService.set).toHaveBeenCalledWith(passphrase, 300);
      expect(FindAndUpdateActiveSessionSessionStorageService.prototype.authenticateOffline).toHaveBeenCalledTimes(1);
      expect(FindAndUpdateMetadataKeysSessionStorageFromOPFSService.prototype.findAndUpdateAll).toHaveBeenCalledTimes(
        1,
      );
      expect(OfflineSessionExpiryAlarmService.scheduleSessionExpiry).toHaveBeenCalledWith(account, 300);
      expect(PostLoginService.sendLoginEventForWorkers).toHaveBeenCalledTimes(1);
      expect(toolbarService.handleUserLoggedIn).toHaveBeenCalledTimes(1);
    });
  });
});
