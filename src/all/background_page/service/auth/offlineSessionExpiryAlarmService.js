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
import GetActiveAccountService from "../account/getActiveAccountService";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import GetOrFindOfflineSettingsService from "../offline/getOrFindOfflineSettingsService";
import FindAndUpdateActiveSessionSessionStorageService from "../activeSession/findAndUpdateActiveSessionSessionStorageService";
import PostLogoutService from "./postLogoutService";
import { assertNumber } from "passbolt-styleguide/src/shared/utils/assertions";

const OFFLINE_SESSION_EXPIRY_ALARM = "OfflineSessionExpiry";
const MILLISECONDS_PER_SECOND = 1000;

/**
 * Dedicated service handling the offline session expiry alarm.
 * It schedules a one-shot alarm at the end of the offline session duration and, when it triggers,
 * resets the active session authentication in place and notifies the workers so the user is prompted
 * to re-authenticate. Unlike the online logout, the local storage is not flushed so the cached offline
 * data (and durable session fields) are preserved.
 * The passphrase is flushed independently by the PassphraseStorageService flush alarm, which is
 * scheduled for the same time.
 */
export default class OfflineSessionExpiryAlarmService {
  /**
   * Schedule the offline session expiry alarm.
   * The offline session length is the user's remember-me choice, clamped by the admin-configured
   * max session duration (both in seconds).
   * @param {AccountEntity} account The user account
   * @param {number|boolean} rememberMe The chosen remember-me duration in seconds (-1 until logout), or false
   * @return {Promise<void>}
   */
  static async scheduleSessionExpiry(account, rememberMe) {
    const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    const offlineSettings = await new GetOrFindOfflineSettingsService(account, apiClientOptions).getOrFind();
    const maxSessionDuration = offlineSettings?.sessionDuration;

    const sessionDuration = OfflineSessionExpiryAlarmService.resolveSessionDuration(rememberMe, maxSessionDuration);
    await OfflineSessionExpiryAlarmService.clearAlarm();
    // One-shot alarm at the end of the offline session duration.
    await browser.alarms.create(OfflineSessionExpiryAlarmService.ALARM_NAME, {
      when: Date.now() + sessionDuration * MILLISECONDS_PER_SECOND,
    });
  }

  /**
   * Resolve the effective offline session duration.
   * The user's remember-me choice drives the session length, but the admin-configured max session
   * duration is the ultimate ceiling and the fallback.
   * @param {number|boolean} rememberMe The chosen remember-me duration in seconds.
   * @param {number} maxSessionDuration The admin-configured max offline session duration in seconds.
   * @return {number} The effective session duration in seconds
   */
  static resolveSessionDuration(rememberMe, maxSessionDuration) {
    assertNumber(rememberMe);
    assertNumber(maxSessionDuration);
    if (rememberMe < 0 || rememberMe > maxSessionDuration) {
      return maxSessionDuration;
    }
    return rememberMe;
  }

  /**
   * Clear the offline session expiry alarm if any.
   * @returns {Promise<void>}
   */
  static async clearAlarm() {
    await browser.alarms.clear(OfflineSessionExpiryAlarmService.ALARM_NAME);
  }

  /**
   * Handle the offline session expiry when the OfflineSessionExpiry alarm triggers.
   * Reset the active session authentication in place and notify the workers so the user
   * re-authenticates. The passphrase is flushed independently by the PassphraseStorageService flush
   * alarm. This is a top-level alarm callback.
   * @param {Alarm} alarm
   * @returns {Promise<void>}
   */
  static async handleSessionExpiryAlarm(alarm) {
    if (alarm.name !== OfflineSessionExpiryAlarmService.ALARM_NAME) {
      return;
    }
    let account;
    try {
      account = await GetActiveAccountService.get();
    } catch (error) {
      // No account configured (already logged out) so nothing to reset.
      console.error(error);
      return;
    }
    const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    await new FindAndUpdateActiveSessionSessionStorageService(account, apiClientOptions).resetAuthentication();
    await PostLogoutService.exec();
  }

  /**
   * Returns the offline session expiry alarm name.
   * @return {string}
   */
  static get ALARM_NAME() {
    return OFFLINE_SESSION_EXPIRY_ALARM;
  }
}
