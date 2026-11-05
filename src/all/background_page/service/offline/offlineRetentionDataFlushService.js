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
import GetOrFindOfflineSettingsService from "./getOrFindOfflineSettingsService";
import MetadataKeyOPFSStorage from "../opfsStorage/metadataKeyOPFSStorage";
import OfflineResourcesOPFSStorage from "../opfsStorage/offlineResourcesOPFSStorage";
import OfflineSecretsOPFSStorage from "../opfsStorage/offlineSecretsOPFSStorage";
import GetSessionTimestampsService from "../sessionTimestamps/getSessionTimestampsService";

/**
 * Flush offline data if time is exceeded.
 *
 */
export default class OfflineRetentionDataFlushService {
  /**
   * @constructor
   * @param {AccountEntity} account The current user account.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(account, apiClientOptions) {
    this.getSessionTimestampsService = new GetSessionTimestampsService(account, apiClientOptions);
    this.getOrFindOfflineSettingsService = new GetOrFindOfflineSettingsService(account, apiClientOptions);
    this.metadataKeyOPFSStorage = new MetadataKeyOPFSStorage(account);
    this.offlineResourcesOPFSStorage = new OfflineResourcesOPFSStorage(account);
    this.offlineSecretsOPFSStorage = new OfflineSecretsOPFSStorage(account);
  }

  /**
   * Flush offline data if time is exceeded according to the offline settings.
   * Log error if any (Do not block any process)
   * @returns {Promise<void>}
   */
  async flushIfExceeded() {
    try {
      const sessionTimestampsEntity = await this.getSessionTimestampsService.get();
      const offlineSettingsEntity = await this.getOrFindOfflineSettingsService.getOrFind();

      if (offlineSettingsEntity === null) {
        return;
      }

      // A missing last seen online date counts as expired.
      let isExpired = !sessionTimestampsEntity?.lastSeenOnline;
      if (!isExpired) {
        // Create the date (last seen online + maximum retention period in days) to compare with now
        const retentionPeriodDate = new Date(sessionTimestampsEntity.lastSeenOnline);
        retentionPeriodDate.setDate(retentionPeriodDate.getDate() + offlineSettingsEntity.maximumRetentionPeriod);
        isExpired = retentionPeriodDate.getTime() < Date.now();
      }
      if (isExpired) {
        // Keep a trace if any error happen during the flush
        const logErrorFlushOPFSStorage = (settledResults) => {
          settledResults.forEach((result) => {
            if (result.status === "rejected") {
              console.error(result.reason);
            }
          });
        };
        await Promise.allSettled([
          this.metadataKeyOPFSStorage.flush(),
          this.offlineResourcesOPFSStorage.flush(),
          this.offlineSecretsOPFSStorage.flush(),
        ]).then(logErrorFlushOPFSStorage);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
