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
const {Entity} = require('../abstract/entity');
const {EntitySchema} = require('../abstract/entitySchema');
const {PermissionEntity} = require('./permissionEntity');

const ENTITY_NAME = 'Permissions';

class PermissionsCollection extends Entity {
  /**
   * Permissions Entity constructor
   *
   * @param {Object} permissionsDto folder DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(permissionsDto) {
    super(EntitySchema.validate(
      PermissionsCollection.ENTITY_NAME,
      permissionsDto,
      PermissionsCollection.getSchema()
    ));

    // Note: there is no "multi-item" validation
    // Collection validation will fail at the first items that doesn't validate
    this._items = [];
    this._props.forEach(permission => {
      this._items.push(new PermissionEntity(permission));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get permissions entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": PermissionEntity.getSchema(),
    }
  }

  /**
   * Return a DTO ready to be sent to API
   *
   * @returns {*}
   */
  toApiData() {
    return JSON.parse(JSON.stringify(this._items));
  }

  // ==================================================
  // Static and dynamic properties getters
  // ==================================================
  /**
   * Get all items references
   * @returns {Array} items
   */
  get items() {
    return this._items;
  }

  /**
   * PermissionsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  // ==================================================
  // Setters
  // ==================================================
  /**
   * Push a copy of the permission to the list
   * @param {object} permission DTO or PermissionEntity
   */
  push(permission) {
    if (!permission) {
      throw new TypeError(`PermissionsCollection push parameter cannot be empty.`);
    }
    if (typeof permission !== 'object') {
      throw new TypeError(`PermissionsCollection push parameter should be an object.`);
    }
    if (permission instanceof PermissionEntity) {
      permission = permission.toApiData(); // clone
    }
    permission = new PermissionEntity(permission); // validate
    this._items.push(permission);
  }
}

exports.PermissionsCollection = PermissionsCollection;
