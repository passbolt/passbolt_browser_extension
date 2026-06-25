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
 * @since         5.13.0
 */
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

class LocalStorageMetadataEntity extends EntityV2 {
  /**
   * Get local storage metadata entity schema
   * @returns {object} schema
   */
  static getSchema() {
    return {
      type: "object",
      required: ["last_updated"],
      properties: {
        last_updated: {
          type: "string",
          format: "date-time",
        },
      },
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the last updated date
   * @returns {string}
   */
  get lastUpdated() {
    return this._props.last_updated;
  }
}

export default LocalStorageMetadataEntity;
