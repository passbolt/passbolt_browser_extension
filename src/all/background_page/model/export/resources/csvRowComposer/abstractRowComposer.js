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
 */

class AbstractRowComposer {
  /**
   * Get the composer supported format name
   * @returns {string}
   */
  static get format() {
    throw new Error("format should be overridden by the inherited class.");
  }

  /**
   * Get the row composer properties mapping.
   * Key values object where key represents the passbolt entity property name and the value represents the CSV property name.
   * @returns {object}
   */
  static get mapping() {
    throw new Error("mapping should be overridden by the inherited class.");
  }

  /**
   * Compose a csv row
   * @param {ExternalResourceEntity} externalResourceEntity The resource to use to compose the row
   * @returns {object}
   */
  /* eslint-disable no-unused-vars */
  static compose(externalResourceEntity) {
    throw new Error("compose should be overridden by the inherited class.");
  }
  /* eslint-enable no-unused-vars */
}

export default AbstractRowComposer;
