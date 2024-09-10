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
 * @since         2.13.0
 */
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import NeededSecretEntity from "./neededSecretEntity";

class NeededSecretsCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return NeededSecretEntity;
  }
  /**
   * Get entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": NeededSecretEntity.getSchema()
    };
  }
}

export default NeededSecretsCollection;
