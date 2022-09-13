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

/** Default validity timeout of the cache */
const VALIDITY_TIMEOUT_IN_MS = 6000;

/** The cached resource*/
let resourceDto,
  /** The invalidity timeout */
  invalidTimeout;

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
    resourceDto = null;
    this.bindCallbacks();
  }

  /**
   * Bind callbacks
   */
  bindCallbacks() {
    this.reset = this.reset.bind(this);
  }

  /**
   * Consume the cached resource.
   * @return {Object} A resource DTO
   */
  consume() {
    const resource = resourceDto;
    this.reset();
    return resource;
  }

  /**
   * Store a resource in cache.
   * @param {ExternalResourceEntity|object} resource The resource to store in cache.
   * @param {?int} timeoutInMs Period of time in millsecond after which the cache will be cleaned.
   */
  set(resource, timeoutInMs = VALIDITY_TIMEOUT_IN_MS) {
    if (!(resource instanceof ExternalResourceEntity)) {
      throw new TypeError('ResourceInProgressCacheService::set expects a ExternalResourceEntity');
    }
    // Clean everything before set the value
    this.reset();

    resourceDto = resource.toDto();

    // Invalid the cache after a given time
    invalidTimeout = setTimeout(this.reset, timeoutInMs);

    // Invalid the cache if the user is logged out
    window.addEventListener("passbolt.auth.after-logout", this.reset);
  }

  /**
   * Resets the cache
   */
  reset() {
    resourceDto = null;
    clearTimeout(invalidTimeout);
    window.removeEventListener("passbolt.auth.after-logout", this.reset);
  }
}

export default new ResourceInProgressCacheService();
