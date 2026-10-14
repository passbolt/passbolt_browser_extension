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
 * @since         5.17.0
 */
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import MfaWebauthnCredentialEntity from "./mfaWebauthnCredentialEntity";

class MfaWebauthnCredentialsCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return MfaWebauthnCredentialEntity;
  }

  /**
   * Get the collection schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      type: "array",
      items: MfaWebauthnCredentialEntity.getSchema(),
    };
  }

  /**
   * @inheritDoc
   * @throws {EntityValidationError} If a credential already exists with the same id.
   */
  validateBuildRules(item) {
    this.assertNotExist("id", item._props.id);
  }

  /**
   * @returns {Array<MfaWebauthnCredentialEntity>}
   */
  get credentials() {
    return this._items;
  }
}

export default MfaWebauthnCredentialsCollection;
