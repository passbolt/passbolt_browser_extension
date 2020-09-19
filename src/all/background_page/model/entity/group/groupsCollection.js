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
 * @since         3.0.0
 */
const {EntityCollection} = require('../abstract/entityCollection');
const {EntitySchema} = require('../abstract/entitySchema');
const {EntityCollectionError} = require('../abstract/entityCollectionError');
const {GroupEntity} = require('./groupEntity');

const ENTITY_NAME = 'Groups';

const RULE_UNIQUE_ID = 'unique_id';
const RULE_UNIQUE_GROUP_NAME = 'unique_group_name';

class GroupsCollection extends EntityCollection {
  /**
   * Groups Entity constructor
   *
   * @param {Object} groupsCollectionDto group DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(groupsCollectionDto) {
    super(EntitySchema.validate(
      GroupsCollection.ENTITY_NAME,
      groupsCollectionDto,
      GroupsCollection.getSchema()
    ));

    // Note: there is no "multi-item" validation
    // Collection validation will fail at the first item that doesn't validate
    this._props.forEach(group => {
      this.push(new GroupEntity(group));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get groups entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": GroupEntity.getSchema(),
    }
  }

  /**
   * Get groups
   * @returns {Array<GroupEntity>}
   */
  get groups() {
    return this._items;
  }

  /**
   * Get all the ids of the groups in the collection
   *
   * @returns {Array<string>}
   */
  get ids() {
    return this._items.map(r => r.id);
  }

  /**
   * Get first group in the collection matching requested id
   * @returns {(GroupEntity|undefined)}
   */
  getFirstById(groupId) {
    return this._items.find(r => (r.id === groupId));
  }

  // ==================================================
  // Assertions
  // ==================================================
  /**
   * Assert there is no other group with the same id in the collection
   *
   * @param {GroupEntity} group
   * @throws {EntityValidationError} if a group with the same id already exist
   */
  assertUniqueId(group) {
    if (!group.id) {
      return;
    }
    const length = this.groups.length;
    let i = 0;
    for(; i < length; i++) {
      let existingGroup = this.groups[i];
      if (existingGroup.id && existingGroup.id === group.id) {
        throw new EntityCollectionError(i, GroupsCollection.RULE_UNIQUE_ID, `Group id ${group.id} already exists.`);
      }
    }
  }

  /**
   * Assert there is no other group with the same group name in the collection
   *
   * @param {GroupEntity} group
   * @throws {EntityValidationError} if a group with the same group name already exist
   */
  assertUniqueGroupName(group) {
    const length = this.groups.length;
    let i = 0;
    for(; i < length; i++) {
      let existingGroup = this.groups[i];
      if (existingGroup.name === group.name) {
        throw new EntityCollectionError(i, GroupsCollection.RULE_UNIQUE_GROUP_NAME, `The group name ${group.name} already exists.`);
      }
    }
  }

  // ==================================================
  // Setters
  // ==================================================
  /**
   * Push a copy of the group to the list
   * @param {object} group DTO or GroupEntity
   */
  push(group) {
    if (!group || typeof group !== 'object') {
      throw new TypeError(`GroupsCollection push parameter should be an object.`);
    }
    if (group instanceof GroupEntity) {
      group = group.toDto(GroupEntity.ALL_CONTAIN_OPTIONS); // deep clone
    }
    const groupEntity = new GroupEntity(group); // validate

    // Build rules
    this.assertUniqueId(groupEntity);
    this.assertUniqueGroupName(groupEntity);

    super.push(groupEntity);
  }

  /**
   * Remove a group identified by an Id
   * @param groupId
   */
  remove(groupId) {
    const i = this.items.findIndex(item => item.id === groupId);
    this.items.splice(i, 1);
  }

  /**
   * Remove multiple groups identified by their Ids
   * @param {Array} groupIds
   */
  removeMany(groupIds) {
    for (let i in groupIds) {
      this.remove(groupIds[i]);
    }
  }

  // ==================================================
  // Static getters
  // ==================================================
  /**
   * GroupsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * GroupsCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }

  /**
   * GroupsCollection.RULE_UNIQUE_GROUP_NAME
   * @returns {string}
   */
  static get RULE_UNIQUE_GROUP_NAME() {
    return RULE_UNIQUE_GROUP_NAME;
  }
}

exports.GroupsCollection = GroupsCollection;
