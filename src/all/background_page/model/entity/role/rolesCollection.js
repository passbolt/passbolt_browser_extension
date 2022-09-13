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
import RoleEntity from "./roleEntity";
import EntityCollection from "../abstract/entityCollection";
import EntitySchema from "../abstract/entitySchema";
import EntityCollectionError from "../abstract/entityCollectionError";

const ENTITY_NAME = 'Roles';
const RULE_UNIQUE_ID = 'unique_id';

class RolesCollection extends EntityCollection {
  /**
   *Roles Entity constructor
   *
   * @param {Object} rolesCollectionDto roles DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(rolesCollectionDto) {
    super(EntitySchema.validate(
      RolesCollection.ENTITY_NAME,
      rolesCollectionDto,
      RolesCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(role => {
      this.push(new RoleEntity(role));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get collection entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": RoleEntity.getSchema(),
    };
  }

  /**
   * Get roles types
   * @returns {Array<RoleEntity>}
   */
  get roles() {
    return this._items;
  }

  /**
   * Get all the ids of the roles in the collection
   *
   * @returns {Array<RoleEntity>}
   */
  get ids() {
    return this._items.map(r => r.id);
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */
  /**
   * Assert there is no other role with the same id in the collection
   *
   * @param {RoleEntity} role entity
   * @throws {EntityValidationError} if a role with the same id already exist
   */
  assertUniqueId(role) {
    if (!role.id) {
      return;
    }
    const length = this.roles.length;
    let i = 0;
    for (; i < length; i++) {
      const existingRole = this.roles[i];
      if (existingRole.id && existingRole.id === role.id) {
        throw new EntityCollectionError(i, RolesCollection.RULE_UNIQUE_ID, `Role id ${role.id} already exists.`);
      }
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the role to the list
   * @param {object} role DTO or RoleEntity
   */
  push(role) {
    if (!role || typeof role !== 'object') {
      throw new TypeError(`RolesCollection push parameter should be an object.`);
    }
    if (role instanceof RoleEntity) {
      role = role.toDto(); // deep clone
    }
    const roleEntity = new RoleEntity(role); // validate

    // Build rules
    this.assertUniqueId(roleEntity);

    super.push(roleEntity);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * RolesCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * RolesCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }
}

export default RolesCollection;
