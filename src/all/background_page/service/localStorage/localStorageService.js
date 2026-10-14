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
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";
import ResourceTypeLocalStorage from "../local_storage/resourceTypeLocalStorage";
import FolderLocalStorage from "../local_storage/folderLocalStorage";
import UserLocalStorage from "../local_storage/userLocalStorage";
import GroupLocalStorage from "../local_storage/groupLocalStorage";
import RolesLocalStorage from "../local_storage/rolesLocalStorage";
import PasswordGeneratorLocalStorage from "../local_storage/passwordGeneratorLocalStorage";
import PostponeUserSettingInvitationService from "../invitation/postponeUserSettingInvitationService";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import SsoKitTemporaryStorageService from "../session_storage/ssoKitTemporaryStorageService";
import WebauthnSetupCeremonySessionStorageService from "../sessionStorage/webauthnSetupCeremonySessionStorageService";
import GetLegacyAccountService from "../account/getLegacyAccountService";
import RbacsLocalStorage from "../local_storage/rbacLocalStorage";
import User from "../../model/user";
import PasswordPoliciesLocalStorage from "../local_storage/passwordPoliciesLocalStorage";
import PasswordExpirySettingsLocalStorage from "../local_storage/passwordExpirySettingsLocalStorage";
import KeepSessionAliveService from "../session_storage/keepSessionAliveService";
import MetadataKeysSettingsLocalStorage from "../local_storage/metadataKeysSettingsLocalStorage";
import MetadataTypesSettingsLocalStorage from "../local_storage/metadataTypesSettingsLocalStorage";
import MetadataKeysSessionStorage from "../session_storage/metadataKeysSessionStorage";
import SessionKeysBundlesSessionStorageService from "../sessionStorage/sessionKeysBundlesSessionStorageService";
import ActiveSessionLocalStorage from "../local_storage/activeSessionLocalStorage";
import UserMeLocalStorage from "../local_storage/userMeLocalStorage";
import SiteSettingsLocalStorage from "../local_storage/siteSettingsLocalStorage";
import SiteSettingsRuntimeCache from "../siteSettings/siteSettingsRuntimeCache";
import OfflineSettingsLocalStorage from "../local_storage/offlineSettingsLocalStorage";
import CanUseOfflineStorageService from "../offline/canUseOfflineStorageService";
import OfflineRetentionDataFlushService from "../offline/offlineRetentionDataFlushService";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";

/**
 * Flush storage data when:
 * - the webextension starts.
 * - the user is signed-out.
 */
class LocalStorageService {
  /**
   * Flush all storage
   */
  static async flush() {
    PostponeUserSettingInvitationService.reset();

    SiteSettingsRuntimeCache.flushAll();
    /*
     * Non-blocking as before, but rejections are captured through Promise.allSettled
     * so a failing flush never leaks as an unhandled promise rejection. The handler is silent
     * (see logFlushFailures) and never rethrows, so other journeys are not impacted
     */
    // eslint-disable-next-line promise/catch-or-return
    Promise.allSettled([
      ResourceLocalStorage.flush(),
      FolderLocalStorage.flush(),
      UserLocalStorage.flush(),
      RolesLocalStorage.flush(),
      PasswordGeneratorLocalStorage.flush(),
      PassphraseStorageService.flush(),
      SsoKitTemporaryStorageService.flush(),
      WebauthnSetupCeremonySessionStorageService.flush(),
      KeepSessionAliveService.stop(),
      LocalStorageService.flushAccountBasedStorages(),
    ]).then(LocalStorageService.logFlushFailures);
  }

  static async flushAccountBasedStorages() {
    // If no user is yet configured no need to continue.
    if (!User.getInstance().isValid()) {
      return;
    }

    const account = GetLegacyAccountService.get();

    /*
     * Resolve the offline capability before flushing anything, so the decision can never depend on the
     * flush order below: some of the storages it reads are part of the conditional flush.
     * The resolution is local-storage only (no network, no cache write-back), which is what a teardown
     * requires: it must not re-create the storages it is about to remove, and it must work on the offline
     * logout paths and on browser startup, where the server is not reachable and no session exists.
     * Failing to resolve it fails closed: everything is flushed.
     */
    let canUseOfflineStorage = false;
    try {
      canUseOfflineStorage = await CanUseOfflineStorageService.canUseOfflineStorageFromLocalStorage(account);
    } catch (error) {
      console.error("LocalStorageService: could not resolve the offline capability, flushing all storages.", error);
    }

    const flushes = [
      new PasswordPoliciesLocalStorage(account).flush(),
      new PasswordExpirySettingsLocalStorage(account).flush(),
      new MetadataKeysSettingsLocalStorage(account).flush(),
      new MetadataTypesSettingsLocalStorage(account).flush(),
      new MetadataKeysSessionStorage(account).flush(),
      new SessionKeysBundlesSessionStorageService(account).flush(),
      new GroupLocalStorage(account).flush(),
    ];

    /*
     * The following storages hold non-secret, cache-like data required to log back in offline without a
     * server round-trip, so they are retained on logout to keep offline mode functional (including after
     * an offline session expiry) for the users who can actually use it.
     *
     * A user who cannot use offline storage has nothing to preserve, so we fully flush. Both gates matter
     * here: the org may not have offline mode configured, or this user's role may be denied access to the
     * offline items (see CanUseOfflineStorageService).
     */
    if (!canUseOfflineStorage) {
      flushes.push(
        new ActiveSessionLocalStorage(account).flush(),
        new RbacsLocalStorage(account).flush(),
        new ResourceTypeLocalStorage(account).flush(),
        new UserMeLocalStorage(account).flush(),
        new SiteSettingsLocalStorage(account).flush(),
        new OfflineSettingsLocalStorage(account).flush(),
      );
    } else {
      const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
      // Flush offline data if time is exceeded
      flushes.push(new OfflineRetentionDataFlushService(account, apiClientOptions).flushIfExceeded());
    }

    LocalStorageService.logFlushFailures(await Promise.allSettled(flushes));
  }

  /**
   * Error handler for a batch of settled flush operations. Rejections are intentionally never thrown
   * so that a single failing storage cannot interrupt logout or any other journey. The individual
   * storages already log their own failure details, so this stays silent aside from a debug breadcrumb.
   * @param {Array<PromiseSettledResult>} settledResults The result of a Promise.allSettled call.
   * @return {void}
   */
  static logFlushFailures(settledResults) {
    settledResults.forEach((result) => {
      if (result.status === "rejected") {
        console.error("LocalStorageService: a storage flush failed and was ignored.", result.reason);
      }
    });
  }
}

export default LocalStorageService;
