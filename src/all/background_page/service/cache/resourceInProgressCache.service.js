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
 * @since         3.4
 */

import ExternalResourceEntity from "../../model/entity/resource/external/externalResourceEntity";
import browser from "../../sdk/polyfill/browserPolyfill";

/** Default validity timeout of the cache */
const VALIDITY_TIMEOUT_IN_MS = 6000;

const RESOURCE_IN_PROGRESS_CACHE_FLUSH_ALARM = "ResourceInProgressCacheFlush";
const RESOURCE_IN_PROGRESS_STORAGE_KEY = "resourceInProgress";

/**
 * A cache service used whenever one wants to store information about a resource creation in progress.
 * This cache is a one-shot getter i.e. after one call the get, the cache is reset. Moreover, the cache information
 * is stored for a certain time given when one set a value and whenever the user is logged out
 */
class ResourceInProgressCacheService {
  /**
   * Default constructor
   */
  constructor() {
    this.bindCallbacks();
  }

  /**
   * Bind callbacks
   */
  bindCallbacks() {
    this.reset = this.reset.bind(this);
    this.handleFlushEvent = this.handleFlushEvent.bind(this);
  }

  /**
   * Consume the cached resource.
   * @return {Object} A resource DTO
   */
  async consume() {
    const storedResourceData = await browser.storage.session.get(RESOURCE_IN_PROGRESS_STORAGE_KEY);
    this.reset();
    return storedResourceData?.[RESOURCE_IN_PROGRESS_STORAGE_KEY] || null;
  }

  /**
   * Store a resource in cache.
   * @param {ExternalResourceEntity|object} resource The resource to store in cache.
   * @param {?int} timeoutInMs Period of time in millsecond after which the cache will be cleaned.
   */
  async set(resource, timeoutInMs = VALIDITY_TIMEOUT_IN_MS) {
    if (!(resource instanceof ExternalResourceEntity)) {
      throw new TypeError('ResourceInProgressCacheService::set expects a ExternalResourceEntity');
    }
    // Clean everything before set the value
    this.reset();

    await browser.storage.session.set({[RESOURCE_IN_PROGRESS_STORAGE_KEY]: resource.toDto()});

    this.scheduleStorageFlush(timeoutInMs);

    // Invalid the cache if the user is logged out
    self.addEventListener("passbolt.auth.after-logout", this.reset);
  }

  /**
   * Schedule an alarm to flush the resource
   * @param timeInMs
   * @private
   */
  scheduleStorageFlush(timeInMs) {
    // Create an alarm to invalid the cache after a given time
    browser.alarms.create(RESOURCE_IN_PROGRESS_CACHE_FLUSH_ALARM, {
      when: Date.now() + timeInMs
    });
    browser.alarms.onAlarm.addListener(this.handleFlushEvent);
  }

  /**
   * Clear the alarm and listener configured for flushing the resource if any.
   * @private
   */
  clearAlarm() {
    browser.alarms.onAlarm.removeListener(this.handleFlushEvent);
    browser.alarms.clear(RESOURCE_IN_PROGRESS_CACHE_FLUSH_ALARM);
  }

  /**
   * Flush the current stored resource when the ResourceInProgressCacheFlush alarm triggers.
   * @param {Alarm} alarm
   * @private
   */
  async handleFlushEvent(alarm) {
    if (alarm.name === RESOURCE_IN_PROGRESS_CACHE_FLUSH_ALARM) {
      this.reset();
    }
  }

  /**
   * Resets the cache
   */
  reset() {
    browser.storage.session.remove(RESOURCE_IN_PROGRESS_STORAGE_KEY);
    this.clearAlarm();
    self.removeEventListener("passbolt.auth.after-logout", this.reset);
  }
}

export default new ResourceInProgressCacheService();
