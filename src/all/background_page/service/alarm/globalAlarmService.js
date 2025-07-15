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
 * @since         4.7.0
 */

import StartLoopAuthSessionCheckService from "../auth/startLoopAuthSessionCheckService";
import CopyToClipboardService from "../clipboard/copyToClipboardService";
import KeepSessionAliveService from "../session_storage/keepSessionAliveService";
import PassphraseStorageService from "../session_storage/passphraseStorageService";

const topLevelAlarmMapping = {
  [StartLoopAuthSessionCheckService.ALARM_NAME]: StartLoopAuthSessionCheckService.handleAuthStatusCheckAlarm,
  [PassphraseStorageService.ALARM_NAME]: PassphraseStorageService.handleFlushEvent,
  [KeepSessionAliveService.ALARM_NAME]: KeepSessionAliveService.handleKeepSessionAlive,
  [CopyToClipboardService.ALARM_NAME]: CopyToClipboardService.handleClipboardTemporaryContentFlushEvent,
};

/**
 * Top-level GlobalAlarmService.
 * The role of the service is to manage alarms that need to be set on top-level.
 * This is necessary to process alarms' callbacks when the service worker wakes up.
 * Putting it at a top-level makes sure that the callbacks are still defined and could be called.
 */
export default class GlobalAlarmService {
  static exec(alarm) {
    const alarmCallback = topLevelAlarmMapping[alarm.name];
    if (alarmCallback) {
      alarmCallback(alarm);
    }
  }
}
