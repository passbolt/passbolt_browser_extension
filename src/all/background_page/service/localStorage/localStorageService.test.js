/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */

import LocalStorageService from "./localStorageService";
import GetLegacyAccountService from "../account/getLegacyAccountService";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import RbacLocalStorage, { RBACS_LOCAL_STORAGE_KEY } from "../local_storage/rbacLocalStorage";
import MockExtension from "../../../../../test/mocks/mockExtension";
import PostponeUserSettingInvitationService from "../invitation/postponeUserSettingInvitationService";
import { PASSWORD_POLICIES_LOCAL_STORAGE_KEY } from "../local_storage/passwordPoliciesLocalStorage";
import { PASSWORD_EXPIRY_SETTINGS_LOCAL_STORAGE_KEY } from "../local_storage/passwordExpirySettingsLocalStorage";
import MetadataTypesSettingsLocalStorage, {
  METADATA_TYPES_SETTINGS_LOCAL_STORAGE_KEY,
} from "../local_storage/metadataTypesSettingsLocalStorage";
import MetadataKeysSessionStorage, {
  METADATA_KEYS_SESSION_STORAGE_KEY,
} from "../session_storage/metadataKeysSessionStorage";
import SessionKeysBundlesSessionStorageService, {
  SESSION_KEYS_BUNDLES_SESSION_STORAGE_KEY,
} from "../sessionStorage/sessionKeysBundlesSessionStorageService";
import { METADATA_KEYS_SETTINGS_LOCAL_STORAGE_KEY } from "../local_storage/metadataKeysSettingsLocalStorage";
import GroupLocalStorage, { GROUP_LOCAL_STORAGE_KEY } from "../local_storage/groupLocalStorage";
import UserMeLocalStorage, { USER_ME_STORAGE_KEY_PREFIX } from "../local_storage/userMeLocalStorage";
import ResourceTypeLocalStorage, { RESOURCE_TYPES_LOCAL_STORAGE_KEY } from "../local_storage/resourceTypeLocalStorage";
import ActiveSessionLocalStorage, {
  ACTIVE_SESSION_LOCAL_STORAGE_KEY,
} from "../local_storage/activeSessionLocalStorage";
import SiteSettingsLocalStorage, { SITE_SETTINGS } from "../local_storage/siteSettingsLocalStorage";
import CanUseOfflineStorageService from "../offline/canUseOfflineStorageService";
import OfflineRetentionDataFlushService from "../offline/offlineRetentionDataFlushService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LocalStorageService", () => {
  describe("LocalStorageService::flush", () => {
    it("Should flush all storage (with no account set)", async () => {
      expect.assertions(24);
      // spy on
      jest.spyOn(browser.storage.local, "remove");
      jest.spyOn(browser.storage.session, "remove");
      jest.spyOn(browser.alarms, "clear");
      jest.spyOn(GetLegacyAccountService, "get");
      jest.spyOn(UserMeLocalStorage.prototype, "flush");
      jest.spyOn(PostponeUserSettingInvitationService, "reset");
      jest.spyOn(MetadataTypesSettingsLocalStorage.prototype, "flush");
      jest.spyOn(MetadataKeysSessionStorage.prototype, "flush");
      jest.spyOn(SessionKeysBundlesSessionStorageService.prototype, "flush");
      jest.spyOn(GroupLocalStorage.prototype, "flush");
      jest.spyOn(ResourceTypeLocalStorage.prototype, "flush");
      jest.spyOn(RbacLocalStorage.prototype, "flush");
      jest.spyOn(ActiveSessionLocalStorage.prototype, "flush");
      jest.spyOn(SiteSettingsLocalStorage.prototype, "flush");
      // process
      await LocalStorageService.flush();
      // expectations
      expect(browser.storage.local.remove).toHaveBeenCalledTimes(5);
      expect(browser.storage.session.remove).toHaveBeenCalledTimes(3);
      expect(browser.alarms.clear).toHaveBeenCalledTimes(2);
      expect(browser.storage.local.remove).toHaveBeenCalledWith("resources");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("folders");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("users");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("roles");
      expect(browser.storage.local.remove).toHaveBeenCalledWith("passwordGenerator");
      expect(PostponeUserSettingInvitationService.reset).toHaveBeenCalled();
      expect(browser.storage.session.remove).toHaveBeenCalledWith("passphrase");
      expect(browser.alarms.clear).toHaveBeenCalledWith("PassphraseStorageFlush");
      expect(browser.alarms.clear).toHaveBeenCalledWith("SessionKeepAlive");
      expect(browser.storage.session.remove).toHaveBeenCalledWith("temp_server_part_sso_kit");
      expect(browser.storage.session.remove).toHaveBeenCalledWith("webauthn-setup-ceremony");
      expect(GetLegacyAccountService.get).not.toHaveBeenCalled();
      expect(UserMeLocalStorage.prototype.flush).not.toHaveBeenCalled();
      expect(MetadataTypesSettingsLocalStorage.prototype.flush).not.toHaveBeenCalled();
      expect(MetadataKeysSessionStorage.prototype.flush).not.toHaveBeenCalled();
      expect(SessionKeysBundlesSessionStorageService.prototype.flush).not.toHaveBeenCalled();
      expect(GroupLocalStorage.prototype.flush).not.toHaveBeenCalled();
      expect(ResourceTypeLocalStorage.prototype.flush).not.toHaveBeenCalled();
      expect(RbacLocalStorage.prototype.flush).not.toHaveBeenCalled();
      expect(ActiveSessionLocalStorage.prototype.flush).not.toHaveBeenCalled();
      expect(SiteSettingsLocalStorage.prototype.flush).not.toHaveBeenCalled();
    });
  });

  describe("LocalStorageService::flushAccountBasedStorages", () => {
    it("Should retain the offline-related storages when the user can use offline storage while flushing others", async () => {
      expect.assertions(17);
      // mock data
      await MockExtension.withConfiguredAccount();
      const account = new AccountEntity(defaultAccountDto());
      // spy on
      jest.spyOn(browser.storage.local, "remove");
      jest.spyOn(browser.storage.session, "remove");
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest.spyOn(OfflineRetentionDataFlushService.prototype, "flushIfExceeded").mockImplementationOnce(jest.fn());
      // The user is eligible for offline access, resolved from the local storages only.
      jest
        .spyOn(CanUseOfflineStorageService, "canUseOfflineStorageFromLocalStorage")
        .mockImplementation(() => Promise.resolve(true));
      // process
      await LocalStorageService.flushAccountBasedStorages();
      // expectations: the always-flushed account storages are removed.
      expect(CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage).toHaveBeenCalledWith(account);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${PASSWORD_POLICIES_LOCAL_STORAGE_KEY}-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(
        `${PASSWORD_EXPIRY_SETTINGS_LOCAL_STORAGE_KEY}-${account.id}`,
      );
      expect(browser.storage.local.remove).toHaveBeenCalledWith(
        `${METADATA_TYPES_SETTINGS_LOCAL_STORAGE_KEY}-${account.id}`,
      );
      expect(browser.storage.local.remove).toHaveBeenCalledWith(
        `${METADATA_KEYS_SETTINGS_LOCAL_STORAGE_KEY}-${account.id}`,
      );
      expect(browser.storage.session.remove).toHaveBeenCalledWith(`${METADATA_KEYS_SESSION_STORAGE_KEY}-${account.id}`);
      expect(browser.storage.session.remove).toHaveBeenCalledWith(
        `${SESSION_KEYS_BUNDLES_SESSION_STORAGE_KEY}-${account.id}`,
      );
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${GROUP_LOCAL_STORAGE_KEY}-${account.id}`);
      // The offline-related storages are intentionally retained to keep offline mode functional after logout.
      expect(browser.storage.local.remove).not.toHaveBeenCalledWith(
        `${USER_ME_STORAGE_KEY_PREFIX}-metadata-${account.id}`,
      );
      expect(browser.storage.local.remove).not.toHaveBeenCalledWith(`${USER_ME_STORAGE_KEY_PREFIX}-${account.id}`);
      expect(browser.storage.local.remove).not.toHaveBeenCalledWith(
        `${RBACS_LOCAL_STORAGE_KEY}-metadata-${account.id}`,
      );
      expect(browser.storage.local.remove).not.toHaveBeenCalledWith(`${RBACS_LOCAL_STORAGE_KEY}-${account.id}`);
      expect(browser.storage.local.remove).not.toHaveBeenCalledWith(
        `${RESOURCE_TYPES_LOCAL_STORAGE_KEY}-metadata-${account.id}`,
      );
      expect(browser.storage.local.remove).not.toHaveBeenCalledWith(
        `${RESOURCE_TYPES_LOCAL_STORAGE_KEY}-${account.id}`,
      );
      expect(browser.storage.local.remove).not.toHaveBeenCalledWith(
        `${ACTIVE_SESSION_LOCAL_STORAGE_KEY}-${account.id}`,
      );
      expect(browser.storage.local.remove).not.toHaveBeenCalledWith(`${SITE_SETTINGS}-${account.id}`);
      expect(OfflineRetentionDataFlushService.prototype.flushIfExceeded).toHaveBeenCalledWith();
    });

    it("Should flush the offline-related storages when the user cannot use offline storage", async () => {
      expect.assertions(9);
      // mock data
      await MockExtension.withConfiguredAccount();
      const account = new AccountEntity(defaultAccountDto());
      // spy on
      jest.spyOn(browser.storage.local, "remove");
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      // The user is not eligible for offline access: the org did not configure it, or its role is denied.
      jest
        .spyOn(CanUseOfflineStorageService, "canUseOfflineStorageFromLocalStorage")
        .mockImplementation(() => Promise.resolve(false));
      // process
      await LocalStorageService.flushAccountBasedStorages();
      // expectations: the offline-related storages are fully flushed.
      expect(CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage).toHaveBeenCalledWith(account);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${ACTIVE_SESSION_LOCAL_STORAGE_KEY}-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${SITE_SETTINGS}-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${RBACS_LOCAL_STORAGE_KEY}-metadata-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${RBACS_LOCAL_STORAGE_KEY}-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(
        `${RESOURCE_TYPES_LOCAL_STORAGE_KEY}-metadata-${account.id}`,
      );
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${RESOURCE_TYPES_LOCAL_STORAGE_KEY}-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${USER_ME_STORAGE_KEY_PREFIX}-metadata-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${USER_ME_STORAGE_KEY_PREFIX}-${account.id}`);
    });

    it("Should flush the offline-related storages when the offline capability cannot be resolved", async () => {
      expect.assertions(6);
      // mock data
      await MockExtension.withConfiguredAccount();
      const account = new AccountEntity(defaultAccountDto());
      const error = new Error("Could not resolve the offline capability.");
      // spy on
      jest.spyOn(browser.storage.local, "remove");
      jest.spyOn(console, "error").mockImplementation(() => {});
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest
        .spyOn(CanUseOfflineStorageService, "canUseOfflineStorageFromLocalStorage")
        .mockImplementation(() => Promise.reject(error));
      // process
      await LocalStorageService.flushAccountBasedStorages();
      // expectations: nothing is retained, and the failure does not interrupt the flush.
      expect(console.error).toHaveBeenCalledWith(
        "LocalStorageService: could not resolve the offline capability, flushing all storages.",
        error,
      );
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${ACTIVE_SESSION_LOCAL_STORAGE_KEY}-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${SITE_SETTINGS}-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${RBACS_LOCAL_STORAGE_KEY}-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${RESOURCE_TYPES_LOCAL_STORAGE_KEY}-${account.id}`);
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${USER_ME_STORAGE_KEY_PREFIX}-${account.id}`);
    });

    it("Should log a failing storage flush and carry on with the other ones", async () => {
      expect.assertions(4);
      // mock data
      await MockExtension.withConfiguredAccount();
      const account = new AccountEntity(defaultAccountDto());
      const error = new Error("Could not flush the groups.");
      // spy on
      jest.spyOn(browser.storage.local, "remove");
      jest.spyOn(console, "error").mockImplementation(() => {});
      jest.spyOn(GetLegacyAccountService, "get").mockImplementation(() => account);
      jest
        .spyOn(CanUseOfflineStorageService, "canUseOfflineStorageFromLocalStorage")
        .mockImplementation(() => Promise.resolve(false));
      jest.spyOn(GroupLocalStorage.prototype, "flush").mockImplementation(() => Promise.reject(error));
      // process & expectations: the rejection is never rethrown to the caller.
      await expect(LocalStorageService.flushAccountBasedStorages()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith("LocalStorageService: a storage flush failed and was ignored.", error);
      // The storages flushed alongside the failing one are not impacted.
      expect(browser.storage.local.remove).toHaveBeenCalledWith(`${ACTIVE_SESSION_LOCAL_STORAGE_KEY}-${account.id}`);
    });
  });

  describe("LocalStorageService::logFlushFailures", () => {
    it("Should log every rejection of a settled batch", async () => {
      expect.assertions(3);
      // mock data
      const firstError = new Error("First failure.");
      const secondError = new Error("Second failure.");
      // spy on
      jest.spyOn(console, "error").mockImplementation(() => {});
      // process
      const settledResults = await Promise.allSettled([
        Promise.reject(firstError),
        Promise.resolve(),
        Promise.reject(secondError),
      ]);
      LocalStorageService.logFlushFailures(settledResults);
      // expectations
      expect(console.error).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith(
        "LocalStorageService: a storage flush failed and was ignored.",
        firstError,
      );
      expect(console.error).toHaveBeenCalledWith(
        "LocalStorageService: a storage flush failed and was ignored.",
        secondError,
      );
    });

    it("Should not log anything when every flush succeeded", async () => {
      expect.assertions(1);
      // spy on
      jest.spyOn(console, "error").mockImplementation(() => {});
      // process
      LocalStorageService.logFlushFailures(await Promise.allSettled([Promise.resolve(), Promise.resolve()]));
      // expectations
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
