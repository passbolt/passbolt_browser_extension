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
import PermissionEntity from "./permissionEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";

const ENTITY_NAME = 'Permissions';

const RULE_UNIQUE_ID = 'unique_id';
const RULE_UNIQUE_ARO = 'unique_aro';
const RULE_SAME_ACO = 'same_aco';
const RULE_ONE_OWNER = 'owner';

class PermissionsCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return PermissionEntity;
  }

  /**
   * @inheritDoc
   * Validation rules are to be expected:
   * - All items should be a valid PermissionEntity
   * - All items should be about the same folder or resource
   * - There can be only one permission per user or group
   * @param {boolean} [options.assertAtLeastOneOwner=true] Assert the collection contains at least one owner.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by ID.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection are unique by aco & aro.
   * @throws {EntityCollectionError} Build Rule: Ensure all items in the collection target the same aco.
   * @throws {EntityCollectionError} Build Rule: Ensure there is at least one owner in the collection.
   */
  constructor(dtos = [], options = {}) {
    dtos = EntitySchema.validate(
      PermissionsCollection.ENTITY_NAME,
      dtos,
      PermissionsCollection.getSchema()
    );
    super(dtos, options);
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   *
   * @param {object} [contain] optional
   * @returns {object}
   */
  toDto(contain) {
    const result = [];
    if (!contain) {
      contain = PermissionEntity.ALL_CONTAIN_OPTIONS;
    }
    for (const permission of this) {
      result.push(permission.toDto(contain));
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(PermissionEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Validation
   * ==================================================
   */

  /**
   * Get permissions entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": PermissionEntity.getSchema(),
    };
  }

  /**
   * @inheritDoc
   * @param {Set} [options.uniqueIdsSetCache] A set of unique ids.
   * @param {Set} [options.uniqueAroForeignKeysSetCache] A set of unique aro foreign keys.
   * @throws {EntityValidationError} If a permission already exists with the same id.
   * @throws {EntityValidationError} If a permission already exists with the same aro foreign keys.
   * @throws {EntityValidationError} If the permission does not have target the same aco than the other permissions of the collection.
   */
  validateBuildRules(item, options = {}) {
    this.assertItemSameAco(item);
    this.assertNotExist("id", item._props.id, {haystackSet: options?.uniqueIdsSetCache});
    this.assertNotExist("aro_foreign_key", item._props.aro_foreign_key, {haystackSet: options?.uniqueAroForeignKeysSetCache});
  }

  /**
   * Assert that the item pushed to the collection is about the same ACO.
   *
   * @param {PermissionEntity} permission The perm
   * @throws {EntityValidationError} if a permission for another ACO already exist
   */
  assertItemSameAco(permission) {
    if (!this.permissions.length) {
      return;
    }
    const referencePermission = this.permissions[0];
    if (!PermissionEntity.isAcoMatching(permission, referencePermission)) {
      const error = new EntityValidationError();
      const message = `The collection is already composed of this type of aco: ${referencePermission.aco} / aco_foreign_key: ${referencePermission.acoForeignKey}.`;
      error.addError("aco_foreign_key", PermissionsCollection.RULE_SAME_ACO, message);
      throw error;
    }
  }

  /**
   * Assert the collection contain at least one owner
   *
   * @return {void}
   * @throws {CollectionValidationError} if not owner is found in the collection
   */
  assertAtLeastOneOwner() {
    if (!this.length) {
      return;
    }

    const hasOwnerPermission = this.items.some(permission => permission.isOwner());
    if (hasOwnerPermission) {
      return;
    }

    const collectionValidationError = new CollectionValidationError();
    const message = 'Permission collection should contain at least one owner.';
    collectionValidationError.addCollectionValidationError(PermissionsCollection.RULE_ONE_OWNER, message);
    throw collectionValidationError;
  }

  /*
   * ==================================================
   * Dynamic getters
   * ==================================================
   */

  /**
   * Get permissions
   * @returns {Array<PermissionEntity>} permissions
   */
  get permissions() {
    return this._items;
  }

  /*
   * ==================================================
   * Finders
   * ==================================================
   */
  /**
   * Return true if a given permission can be found already in the collection
   *
   * @param {PermissionEntity} permission
   * @returns {(PermissionEntity|undefined)} if a match is found in collection
   */
  getByAroMatchingPermission(permission) {
    return this._items.find(existingPermission => PermissionEntity.isAroMatching(existingPermission, permission));
  }

  /**
   * Return true if a given permission can be found already in the collection
   *
   * @param {string} aro
   * @param {string} aroForeignKey
   * @returns {(PermissionEntity|undefined)} if a match is found in collection
   */
  getByAro(aro, aroForeignKey) {
    return this._items.find(permission => permission.aro === aro && permission.aroForeignKey === aroForeignKey);
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */

  /**
   * @inheritDoc
   * @param {boolean} [options.assertAtLeastOneOwner=true] Assert the collection contains at least one owner.
   */
  pushMany(data, entityOptions = {}, options = {}) {
    const assertAtLeastOneOwner = entityOptions?.assertAtLeastOneOwner ?? true;
    const uniqueIdsSetCache = new Set(this.extract("id"));
    const uniqueAroForeignKeysSetCache = new Set(this.extract("aro_foreign_key"));
    const onItemPushed = item => {
      uniqueIdsSetCache.add(item.id);
      uniqueAroForeignKeysSetCache.add(item.aroForeignKey);
    };

    options = {
      onItemPushed: onItemPushed,
      validateBuildRules: {...options?.validateBuildRules, uniqueIdsSetCache, uniqueAroForeignKeysSetCache},
      ...options
    };

    super.pushMany(data, entityOptions, options);

    if (assertAtLeastOneOwner) {
      this.assertAtLeastOneOwner();
    }
  }

  /**
   * Add or replace an already existing permission if type is higher
   *
   * @param {PermissionEntity} permission
   * @throws {EntityCollectionError} if the permission cannot be pushed or replaced
   */
  addOrReplace(permission) {
    permission = this.buildOrCloneEntity(permission);

    const permissionToReplaceIndex = this.items.findIndex(item =>
      (!item.id || item.id === permission._props.id)
      && (PermissionEntity.isAcoAndAroMatching(item, permission))
    );

    // No matching item, add the permission to the collection.
    if (permissionToReplaceIndex === -1) {
      this.push(permission);
      return;
    }

    const replacedItem = this._items[permissionToReplaceIndex];
    // Do not replace the matching permission if the new permission has a lower access.
    if (permission.type <= replacedItem.type) {
      return;
    }

    // Remove the element from the collection.
    this._items.splice(permissionToReplaceIndex, 1);
    try {
      this.validateBuildRules(permission);
      this._items.splice(permissionToReplaceIndex, 0, permission);
    } catch (error) {
      // Rollback to the existing permission if an unexpected error occurred.
      this._items.splice(permissionToReplaceIndex, 0, replacedItem);
      throw error;
    }
  }

  /*
   * ==================================================
   * Permissions "arithmetics"
   * ==================================================
   */
  /**
   * Create a new set based on set1 + set2
   * Keep the highest permission if there is an overlap
   *
   * @param {PermissionsCollection} set1
   * @param {PermissionsCollection} set2
   * @param {boolean} [assertAtLeastOneOwner=true] Validate the collection has at least one owner.
   * @return {PermissionsCollection} set3
   */
  static sum(set1, set2, assertAtLeastOneOwner = true) {
    const set3 = new PermissionsCollection(set1.toDto(), {assertAtLeastOneOwner: false});
    set2.items.forEach((set2Permission, index) => {
      try {
        set3.addOrReplace(set2Permission);
      } catch (error) {
        set2.handlePushItemError(index, error);
      }
    });
    if (assertAtLeastOneOwner) {
      set3.assertAtLeastOneOwner();
    }
    return set3;
  }

  /**
   * Create a new set based on set1 - set2
   * Match is based on ARO and TYPE
   *
   * @param {PermissionsCollection} set1
   * @param {PermissionsCollection} set2
   * @param {boolean} [assertAtLeastOneOwner=true] Validate the collection has at least one owner.
   * @return {PermissionsCollection} set3
   */
  static diff(set1, set2, assertAtLeastOneOwner = true) {
    const set3 = new PermissionsCollection([], {assertAtLeastOneOwner: false});
    for (const permission of set1) {
      if (!set2.containAtLeastPermission(permission.aro, permission.aroForeignKey, permission.type)) {
        set3.push(permission);
      }
    }
    if (assertAtLeastOneOwner) {
      set3.assertAtLeastOneOwner();
    }
    return set3;
  }

  /**
   * Return true if a set contain a permission equal or superior for the given type and aro, aroForeign key
   *
   * @param {string} aro group or user
   * @param {string} aroForeignKey uuid
   * @param {number} type see permission entity types
   * @returns {boolean}
   */
  containAtLeastPermission(aro, aroForeignKey, type) {
    for (const permission of this.items) {
      if (permission.aro === aro && permission.aroForeignKey === aroForeignKey && permission.type >= type) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clone permission set for another ACO
   *
   * @param {string} aco resource or folder
   * @param {string} acoId
   * @param {boolean} [assertAtLeastOneOwner=true] Validate the collection has at least one owner.
   * @return {PermissionsCollection}
   */
  cloneForAco(aco, acoId, assertAtLeastOneOwner = true) {
    const permissions = new PermissionsCollection([], {assertAtLeastOneOwner: false});
    for (const parentPermission of this.permissions) {
      const clone = parentPermission.copyForAnotherAco(aco, acoId);
      permissions.addOrReplace(clone);
    }
    if (assertAtLeastOneOwner) {
      permissions.assertAtLeastOneOwner();
    }
    return permissions;
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * PermissionsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * PermissionsCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }

  /**
   * PermissionsCollection.PERMISSION_COLLECTION_RULE_UNIQUE_ARO
   * @returns {string}
   */
  static get RULE_UNIQUE_ARO() {
    return RULE_UNIQUE_ARO;
  }

  /**
   * PermissionsCollection.RULE_SAME_ACO
   * @returns {string}
   */
  static get RULE_SAME_ACO() {
    return RULE_SAME_ACO;
  }

  /**
   * PermissionsCollection.RULE_ONE_OWNER
   * @returns {string}
   */
  static get RULE_ONE_OWNER() {
    return RULE_ONE_OWNER;
  }
}

export default PermissionsCollection;
