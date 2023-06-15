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
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import NeededSecretEntity from "./neededSecretEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'NeededSecrets';

class NeededSecretsCollection extends EntityCollection {
  /**
   * Secrets Entity constructor
   *
   * @param {Object} NeededSecretsCollectionDto secret DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(NeededSecretsCollectionDto) {
    super(EntitySchema.validate(
      NeededSecretsCollection.ENTITY_NAME,
      NeededSecretsCollectionDto,
      NeededSecretsCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(neededSecret => {
      this.push(new NeededSecretEntity(neededSecret));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": NeededSecretEntity.getSchema(),
    };
  }

  /**
   * Get needed secrets
   * @returns {Array<NeededSecretEntity>}
   */
  get neededSecrets() {
    return this._items;
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */

  /**
   * Push a copy of the needed secret to the list
   * @param {object} neededSecret DTO or NeededSecretEntity
   */
  push(neededSecret) {
    if (!neededSecret || typeof neededSecret !== 'object') {
      throw new TypeError(`NeededSecretsCollection push parameter should be an object.`);
    }
    if (neededSecret instanceof NeededSecretEntity) {
      neededSecret = neededSecret.toDto(); // clone
    }
    const neededSecretEntity = new NeededSecretEntity(neededSecret); // validate

    super.push(neededSecretEntity);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */

  /**
   * NeededSecretsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default NeededSecretsCollection;
