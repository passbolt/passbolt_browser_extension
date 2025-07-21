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
 * @since         5.3.2
 */
import {assertString} from "../../utils/assertions";
import BrowserService from "../browser/browserService";
import ClipboardProviderService from "./clipboardProviderService";

const CLIPBOARD_TEMPORARY_CONTENT_FLUSH_DELAY_IN_SECOND = 30;
const CLIPBOARD_TEMPORARY_CONTENT_FLUSH_ALARM = "ClipboardTemporaryContentFlush";
/**
 * The service aims to use the clipboard capability on Edge MV2 where:
 * - navigator.clipboard.writeText cannot be used in Edge MV2 background page due to a focus issue.
 * - offscreen clipboard cannot be used due to offscreen API available only with MV3.
 */
export default class CopyToClipboardService {
  /**
   * @constructor
   */
  constructor() {
    this.clipboard = ClipboardProviderService.getClipboard();
  }

  /**
   * Copies the given data into the clipboard and sets a timer to remove after 30sec.
   * @param {string} data
   * @return {Promise<void>}
   */
  async copyTemporarily(data) {
    assertString(data);

    await this.clearAlarm();
    await this.clipboard.writeText(data);

    await browser.alarms.create(CopyToClipboardService.ALARM_NAME, {
      when: Date.now() + CLIPBOARD_TEMPORARY_CONTENT_FLUSH_DELAY_IN_SECOND * 1000
    });
  }

  /**
   * Copies the given data into the clipboard and unsets any flush timer.
   * @param {string} data
   * @return {Promise<void>}
   */
  async copy(data) {
    assertString(data);

    await this.clearAlarm();
    await this.clipboard.writeText(data);
  }

  /**
   * Flushes the clipboard if the content is the expected one.
   * @returns {Promise<void>}
   */
  async flushTemporaryContent() {
    await this.clearAlarm();
    await this.clipboard.writeText(this._getContentToFlushClipboard());
  }

  /**
   * Flushes the clipboard content if there is any temporary content in it.
   * @returns {Promise<void>}
   */
  async flushTemporaryContentIfAny() {
    const hasTemporaryContent = Boolean(await browser.alarms.get(CopyToClipboardService.ALARM_NAME));
    if (hasTemporaryContent) {
      this.flushTemporaryContent();
    }
  }

  /**
   * Removes the flush alarm if any.
   * @returns {Promise<void>}
   */
  async clearAlarm() {
    await browser.alarms.clear(CopyToClipboardService.ALARM_NAME);
  }

  /**
   * Returns a string that the browser can use to clean the clipboard.
   * The "empty" string depends on the browser.
   * Chromimum: "" is not accepted but "\x00" does the trick
   * Firefox: "" is working fine but "\x00" is a bit buggy (the character could be pasted)
   * @returns {string}
   * @private
   */
  _getContentToFlushClipboard() {
    return BrowserService.isFirefox()
      ? ""
      : "\x00";
  }

  /**
   * Flush the current stored passphrase when the PassphraseStorageFlush alarm triggers.
   * This is a top-level alarm callback
   * @param {Alarm} alarm
   * @returns {Promise<void>}
   */
  static async handleClipboardTemporaryContentFlushEvent(alarm) {
    if (alarm.name === CopyToClipboardService.ALARM_NAME) {
      const clipboardService = new CopyToClipboardService();
      await clipboardService.flushTemporaryContent();
    }
  }

  /**
   * Returns the PASSPHRASE_FLUSH_ALARM name
   * @returns {string}
   */
  static get ALARM_NAME() {
    return CLIPBOARD_TEMPORARY_CONTENT_FLUSH_ALARM;
  }
}
