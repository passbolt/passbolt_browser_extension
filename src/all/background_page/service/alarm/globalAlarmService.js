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
import PassphraseStorageService from "../session_storage/passphraseStorageService";

const topLevelAlarmMapping = {
  [StartLoopAuthSessionCheckService.ALARM_NAME]: StartLoopAuthSessionCheckService.handleAuthStatusCheckAlarm,
  [PassphraseStorageService.PASSPHRASE_FLUSH_ALARM_NAME]: PassphraseStorageService.handleFlushEvent,
};

export default class GlobalAlarmService {
  static exec(alarm) {
    topLevelAlarmMapping[alarm.name]?.(alarm);
  }
}
