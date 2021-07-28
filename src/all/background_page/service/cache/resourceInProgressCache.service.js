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

const {ExternalResourceEntity} = require("../../model/entity/resource/external/externalResourceEntity");

/**
 * A cache service used whenever one wants to store information about a resource creation in progress.
 * This cache is a one-shot getter i.e. after one call the get, the cache is reset. Moreover, the cache information
 * is stored for a certain time given when one set a value and whenever the user is logged out
 */
class ResourceInProgressCacheService {

  /** Default validity timeout of the cache */
  static #VALIDITY_TIMEOUT_IN_MS = 6000;

  /** The cached resource*/
  #resource;

  /** The invalidity timeout */
  #invalidTimeout;

  /**
   * Default constructor
   */
  constructor() {
    this.#resource = null;
    this.bindCallbacks();
  }

  /**
   * Bind callbacks
   */
  bindCallbacks() {
    this.reset = this.reset.bind(this);
  }

  /**
   * Returns the resource information in progress
   * @return A resource
   */
  getAndConsume() {
    const resource =  this.#resource;
    this.reset();
    return resource?.toDto();
  }

  /**
   * Set resource information in progress
   * @param value
   * @param timeoutInMs
   */
  set(resource, timeoutInMs = ResourceInProgressCacheService.#VALIDITY_TIMEOUT_IN_MS) {
    // Clean everything before set the value
    this.reset();

    this.#resource = new ExternalResourceEntity(resource);

    // Invalid the cache after a given time
    this.#invalidTimeout = setTimeout(this.reset, timeoutInMs);

    // Invalid the cache if the user is logged out
    window.addEventListener("passbolt.auth.after-logout", this.reset);
  }

  /**
   * Resets the cache
   */
  reset() {
    this.#resource = null;
    clearTimeout(this.#invalidTimeout);
    window.removeEventListener("passbolt.auth.after-logout", this.reset);
  }
}

exports.ResourceInProgressCacheService = new ResourceInProgressCacheService();