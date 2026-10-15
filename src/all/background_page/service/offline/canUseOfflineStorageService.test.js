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

import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import {
  defaultRbacWithActionData,
  denyRbacWithActionData,
} from "passbolt-styleguide/src/shared/models/entity/rbac/rbacEntity.test.data";
import { defaultActionData } from "passbolt-styleguide/src/shared/models/entity/rbac/actionEntity.test.data";
import { actions } from "passbolt-styleguide/src/shared/services/rbacs/actionEnumeration";
import { defaultOfflineSettingsDto } from "passbolt-styleguide/src/shared/models/entity/offline/offlineSettingsEntity.test.data";
import OfflineSettingsEntity from "passbolt-styleguide/src/shared/models/entity/offline/offlineSettingsEntity";
import {
  defaultAdminUserDto,
  defaultUserDto,
} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import UserEntity from "../../model/entity/user/userEntity";
import SiteSettingsEntity from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity";
import {
  defaultCeSiteSettings,
  offlinePluginEnabledSiteSettings,
} from "passbolt-styleguide/src/shared/models/entity/siteSettings/siteSettingsEntity.test.data";
import OfflineSettingsLocalStorage from "../local_storage/offlineSettingsLocalStorage";
import SiteSettingsLocalStorage from "../local_storage/siteSettingsLocalStorage";
import UserMeLocalStorage from "../local_storage/userMeLocalStorage";
import RbacsLocalStorage from "../local_storage/rbacLocalStorage";
import CanUseOfflineStorageService from "./canUseOfflineStorageService";
import SiteSettingsRuntimeCache from "../siteSettings/siteSettingsRuntimeCache";

const allowOfflineAccessRbac = (data = {}) =>
  defaultRbacWithActionData({ action: defaultActionData({ name: actions.OFFLINE_ITEMS_VIEW }), ...data });

const denyOfflineAccessRbac = (data = {}) =>
  denyRbacWithActionData({ action: defaultActionData({ name: actions.OFFLINE_ITEMS_VIEW }), ...data });

describe("CanUseOfflineStorageService", () => {
  let account;

  beforeEach(() => {
    jest.clearAllMocks();
    account = new AccountEntity(defaultAccountDto());
  });

  describe("::canUseOfflineStorage", () => {
    let canUseOfflineStorageService;

    const mockSiteSettings = (siteSettingsDto) =>
      jest
        .spyOn(canUseOfflineStorageService.getOrFindSiteSettingsService, "getOrFind")
        .mockResolvedValue(new SiteSettingsEntity(siteSettingsDto));

    beforeEach(() => {
      canUseOfflineStorageService = new CanUseOfflineStorageService(account, defaultApiClientOptions());
      mockSiteSettings(offlinePluginEnabledSiteSettings());
    });

    const mockOfflineSettings = (offlineSettings) =>
      jest
        .spyOn(canUseOfflineStorageService.getOrFindOfflineSettingsService, "getOrFind")
        .mockResolvedValue(offlineSettings);

    const mockMe = (userDto) =>
      jest
        .spyOn(canUseOfflineStorageService.getOrFindMeService, "getOrFindMe")
        .mockResolvedValue(new UserEntity(userDto));

    const mockRbacs = (rbacs) =>
      jest.spyOn(canUseOfflineStorageService.getOrFindRbacService, "getOrFindMe").mockResolvedValue(rbacs);

    it("returns false when the offline mode plugin is not enabled, without consulting the offline settings.", async () => {
      expect.assertions(4);
      mockSiteSettings(defaultCeSiteSettings());
      const offlineSettingsSpy = jest.spyOn(canUseOfflineStorageService.getOrFindOfflineSettingsService, "getOrFind");
      const meSpy = jest.spyOn(canUseOfflineStorageService.getOrFindMeService, "getOrFindMe");
      const rbacsSpy = jest.spyOn(canUseOfflineStorageService.getOrFindRbacService, "getOrFindMe");

      expect(await canUseOfflineStorageService.canUseOfflineStorage()).toBe(false);
      // Short-circuits before consulting the offline settings, the user and its rbacs.
      expect(offlineSettingsSpy).not.toHaveBeenCalled();
      expect(meSpy).not.toHaveBeenCalled();
      expect(rbacsSpy).not.toHaveBeenCalled();
    });

    it("returns false when the org has no offline settings, without resolving the user.", async () => {
      expect.assertions(3);
      mockOfflineSettings(null);
      const meSpy = jest.spyOn(canUseOfflineStorageService.getOrFindMeService, "getOrFindMe");
      const rbacsSpy = jest.spyOn(canUseOfflineStorageService.getOrFindRbacService, "getOrFindMe");

      expect(await canUseOfflineStorageService.canUseOfflineStorage()).toBe(false);
      // Short-circuits before consulting the user and its rbacs.
      expect(meSpy).not.toHaveBeenCalled();
      expect(rbacsSpy).not.toHaveBeenCalled();
    });

    it("returns true for an administrator, without retrieving the rbacs.", async () => {
      expect.assertions(2);
      mockOfflineSettings(new OfflineSettingsEntity(defaultOfflineSettingsDto()));
      mockMe(defaultAdminUserDto());
      const rbacsSpy = jest.spyOn(canUseOfflineStorageService.getOrFindRbacService, "getOrFindMe");

      expect(await canUseOfflineStorageService.canUseOfflineStorage()).toBe(true);
      expect(rbacsSpy).not.toHaveBeenCalled();
    });

    it("returns true when the offline settings are set and the user role is allowed.", async () => {
      expect.assertions(1);
      const userDto = defaultUserDto({}, { withRole: true });
      mockOfflineSettings(new OfflineSettingsEntity(defaultOfflineSettingsDto()));
      mockMe(userDto);
      mockRbacs(new RbacsCollection([allowOfflineAccessRbac({ role_id: userDto.role.id })]));

      expect(await canUseOfflineStorageService.canUseOfflineStorage()).toBe(true);
    });

    it("returns false when the offline settings are set but the user role is denied.", async () => {
      expect.assertions(1);
      const userDto = defaultUserDto({}, { withRole: true });
      mockOfflineSettings(new OfflineSettingsEntity(defaultOfflineSettingsDto()));
      mockMe(userDto);
      mockRbacs(new RbacsCollection([denyOfflineAccessRbac({ role_id: userDto.role.id })]));

      expect(await canUseOfflineStorageService.canUseOfflineStorage()).toBe(false);
    });

    it("returns false when the offline settings throw an error.", async () => {
      expect.assertions(1);
      jest
        .spyOn(canUseOfflineStorageService.getOrFindOfflineSettingsService, "getOrFind")
        .mockImplementationOnce(() => {
          throw new Error("error");
        });

      expect(await canUseOfflineStorageService.canUseOfflineStorage()).toBe(false);
    });
  });

  describe("::canUseOfflineStorageFromLocalStorage", () => {
    const mockStorages = ({ offlineSettings, user, rbacs, ...storages }) => {
      const siteSettings = "siteSettings" in storages ? storages.siteSettings : offlinePluginEnabledSiteSettings();
      jest.spyOn(SiteSettingsLocalStorage.prototype, "get").mockResolvedValue(siteSettings);
      jest.spyOn(OfflineSettingsLocalStorage.prototype, "getData").mockResolvedValue(offlineSettings);
      jest.spyOn(UserMeLocalStorage.prototype, "getData").mockResolvedValue(user);
      jest.spyOn(RbacsLocalStorage.prototype, "getData").mockResolvedValue(rbacs);
      jest.spyOn(SiteSettingsRuntimeCache, "set");
    };

    it("returns false when the site settings storage is empty, without reading the other storages.", async () => {
      expect.assertions(4);
      mockStorages({
        siteSettings: undefined,
        offlineSettings: defaultOfflineSettingsDto(),
        user: defaultAdminUserDto(),
        rbacs: [],
      });

      expect(await CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage(account)).toBe(false);
      expect(OfflineSettingsLocalStorage.prototype.getData).not.toHaveBeenCalled();
      expect(UserMeLocalStorage.prototype.getData).not.toHaveBeenCalled();
      expect(RbacsLocalStorage.prototype.getData).not.toHaveBeenCalled();
    });

    it("returns false when the stored site settings have the offline mode plugin disabled.", async () => {
      expect.assertions(2);
      mockStorages({
        siteSettings: defaultCeSiteSettings(),
        offlineSettings: defaultOfflineSettingsDto(),
        user: defaultAdminUserDto(),
        rbacs: [],
      });

      expect(await CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage(account)).toBe(false);
      expect(OfflineSettingsLocalStorage.prototype.getData).not.toHaveBeenCalled();
    });

    it("returns false when the offline settings storage is empty, without reading the other storages.", async () => {
      expect.assertions(4);
      mockStorages({ offlineSettings: undefined, user: defaultAdminUserDto(), rbacs: [] });

      expect(await CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage(account)).toBe(false);
      expect(UserMeLocalStorage.prototype.getData).not.toHaveBeenCalled();
      expect(RbacsLocalStorage.prototype.getData).not.toHaveBeenCalled();
      expect(SiteSettingsRuntimeCache.set).toHaveBeenCalled();
    });

    it("returns false when the user me storage is empty.", async () => {
      expect.assertions(2);
      mockStorages({ offlineSettings: defaultOfflineSettingsDto(), user: undefined, rbacs: [] });

      expect(await CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage(account)).toBe(false);
      expect(SiteSettingsRuntimeCache.set).toHaveBeenCalled();
    });

    it("returns true for an administrator even when the rbacs storage is empty.", async () => {
      expect.assertions(2);
      mockStorages({ offlineSettings: defaultOfflineSettingsDto(), user: defaultAdminUserDto(), rbacs: undefined });

      expect(await CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage(account)).toBe(true);
      expect(SiteSettingsRuntimeCache.set).toHaveBeenCalled();
    });

    it("returns false for a user when the rbacs storage is empty.", async () => {
      expect.assertions(2);
      mockStorages({
        offlineSettings: defaultOfflineSettingsDto(),
        user: defaultUserDto({}, { withRole: true }),
        rbacs: undefined,
      });

      expect(await CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage(account)).toBe(false);
      expect(SiteSettingsRuntimeCache.set).toHaveBeenCalled();
    });

    it("returns true when the user role is allowed.", async () => {
      expect.assertions(2);
      const userDto = defaultUserDto({}, { withRole: true });
      mockStorages({
        offlineSettings: defaultOfflineSettingsDto(),
        user: userDto,
        rbacs: [allowOfflineAccessRbac({ role_id: userDto.role.id })],
      });

      expect(await CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage(account)).toBe(true);
      expect(SiteSettingsRuntimeCache.set).toHaveBeenCalled();
    });

    it("returns false when the user role is denied.", async () => {
      expect.assertions(2);
      const userDto = defaultUserDto({}, { withRole: true });
      mockStorages({
        offlineSettings: defaultOfflineSettingsDto(),
        user: userDto,
        rbacs: [denyOfflineAccessRbac({ role_id: userDto.role.id })],
      });

      expect(await CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage(account)).toBe(false);
      expect(SiteSettingsRuntimeCache.set).toHaveBeenCalled();
    });

    it("throws when a stored dto does not validate, return false to not block the process.", async () => {
      expect.assertions(1);
      mockStorages({ offlineSettings: defaultOfflineSettingsDto(), user: { username: 42 }, rbacs: [] });

      await expect(CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage(account)).rejects.toThrow();
    });
  });
});
