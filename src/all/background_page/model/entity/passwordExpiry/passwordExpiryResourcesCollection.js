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
 * @since         4.5.0
 */
import PasswordExpiryResourceEntity from "./passwordExpiryResourceEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

const ENTITY_NAME = 'PasswordExpiryResources';

const RULE_UNIQUE_ID = 'unique_id';

class PasswordExpiryResourcesCollection extends EntityCollection {
  /**
   * @inheritDoc
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   */
  constructor(passwordExpiryResourcesCollectionDto, options = {}) {
    super(EntitySchema.validate(
      PasswordExpiryResourcesCollection.ENTITY_NAME,
      passwordExpiryResourcesCollectionDto,
      PasswordExpiryResourcesCollection.getSchema()
    ), options);

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(passwordExpiryResources => {
      this.push(new PasswordExpiryResourceEntity(passwordExpiryResources));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get passwordExpiryResources entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": PasswordExpiryResourceEntity.getSchema(),
    };
  }

  /**
   * Get passwordExpiryResources
   * @returns {Array<PasswordExpiryResourceEntity>}
   */
  get passwordExpiryResources() {
    return this._items;
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */
  /**
   * Assert there is no other passwordExpiryResources with the same id in the collection
   *
   * @param {PasswordExpiryResourceEntity} passwordExpiryResourcesEntity
   * @throws {EntityValidationError} if a passwordExpiryResources with the same id already exist
   */
  assertUniqueId(passwordExpiryResourcesEntity) {
    if (!passwordExpiryResourcesEntity.id) {
      return;
    }
    const length = this.passwordExpiryResources.length;
    let i = 0;
    for (; i < length; i++) {
      const existingPasswordExpiryResource = this.passwordExpiryResources[i];
      if (existingPasswordExpiryResource.id && existingPasswordExpiryResource.id === passwordExpiryResourcesEntity.id) {
        throw new EntityCollectionError(i, PasswordExpiryResourcesCollection.RULE_UNIQUE_ID, `PasswordExpiryResource id ${passwordExpiryResourcesEntity.id} already exists.`);
      }
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the passwordExpiryResources to the list
   * @param {object} passwordExpiryResource DTO or PasswordExpiryResourceEntity
   */
  push(passwordExpiryResource) {
    if (!passwordExpiryResource || typeof passwordExpiryResource !== 'object') {
      throw new TypeError('PasswordExpiryResourcesCollection push parameter should be an object.');
    }
    if (passwordExpiryResource instanceof PasswordExpiryResourceEntity) {
      passwordExpiryResource = passwordExpiryResource.toDto(); // deep clone
    }
    const passwordExpiryResourceEntity = new PasswordExpiryResourceEntity(passwordExpiryResource); // validate

    // Build rules
    this.assertUniqueId(passwordExpiryResourceEntity);

    super.push(passwordExpiryResourceEntity);
  }

  /**
   * Remove a passwordExpiryResources identified by an Id
   * @param passwordExpiryResourcesId
   */
  remove(passwordExpiryResourcesId) {
    const i = this.items.findIndex(item => item.id === passwordExpiryResourcesId);
    this.items.splice(i, 1);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * PasswordExpiryResourcesCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * PasswordExpiryResourcesCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }
}

export default PasswordExpiryResourcesCollection;
