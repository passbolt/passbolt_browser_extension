/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import ExternalGpgKeyEntity from "./externalGpgKeyEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

const ENTITY_NAME = 'externalGpgKey';
const RULE_UNIQUE_ID = 'fingerprint';

class ExternalGpgKeyCollection extends EntityCollection {
  /**
   * Resources Entity constructor
   *
   * @param {Object} externalGpgKeyCollectionDto resource DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(externalGpgKeyCollectionDto) {
    super(EntitySchema.validate(
      ExternalGpgKeyCollection.ENTITY_NAME,
      externalGpgKeyCollectionDto,
      ExternalGpgKeyCollection.getSchema()
    ));

    /**
     * Check if resource ids are unique
     * Why not this.push? It is faster than adding items one by one
     */
    const ids = this._props.map(resource => resource.id);
    ids.sort().sort((a, b) => {
      if (a === b) {
        throw new EntityCollectionError(0, ExternalGpgKeyCollection.RULE_UNIQUE_ID, `Gpgkey fingerprint ${a} already exists.`);
      }
    });
    // Directly push into the private property _items[]
    this._props.forEach(resource => {
      this._items.push(new ExternalGpgKeyEntity(resource));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get resources entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": ExternalGpgKeyEntity.getSchema(),
    };
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * ExternalGpgKeyCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * ExternalGpgKeyCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }
}

export default ExternalGpgKeyCollection;
