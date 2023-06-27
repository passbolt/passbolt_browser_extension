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
 */
import GroupEntity from "../groupEntity";
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import SecretsCollection from "../../secret/secretsCollection";
import GroupUserChangesCollection from "../../groupUser/change/groupUserChangesCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'GroupUpdate';

class GroupUpdateEntity extends Entity {
  /**
   * GroupUpdate entity constructor
   *
   * @param {Object} groupUpdateDto group update DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(groupUpdateDto) {
    super(EntitySchema.validate(
      GroupUpdateEntity.ENTITY_NAME,
      groupUpdateDto,
      GroupUpdateEntity.getSchema()
    ));

    // Association
    if (this._props.groups_users) {
      this._groups_users = new GroupUserChangesCollection(this._props.groups_users);
      delete this._props.groups_users;
    }
    if (this._props.secrets) {
      this._secrets = new SecretsCollection(this._props.secrets);
      delete this._props.secrets;
    }
  }

  /**
   * Get group entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const groupEntitySchema = GroupEntity.getSchema();
    return {
      "type": "object",
      "required": [
        "id",
        "name"
      ],
      "properties": {
        "id": groupEntitySchema.properties.id,
        "name": groupEntitySchema.properties.name,
        // Associations
        "groups_users": GroupUserChangesCollection.getSchema(),
        "secrets": SecretsCollection.getSchema()
      }
    };
  }

  static createFromGroupsDiff(originalGroupEntity, updatedGroupEntity) {
    const id = originalGroupEntity.id;
    const name = updatedGroupEntity.name;
    const groupsUsers = GroupUserChangesCollection.createFromGroupsUsersCollectionsChanges(originalGroupEntity.groupsUsers, updatedGroupEntity.groupsUsers);
    const groupUpdateDto = {id: id, name: name, groups_users: groupsUsers.toDto()};
    return new GroupUpdateEntity(groupUpdateDto);
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */

  /**
   * Return a DTO ready to be sent to API
   * @returns {*}
   */
  toDto() {
    const result = Object.assign({}, this._props);
    if (this._groups_users) {
      result.groups_users = this._groups_users.toDto();
    }
    if (this._secrets) {
      result.secrets = this._secrets.toDto();
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get group id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get group name
   * @returns {string} admin or user
   */
  get name() {
    return this._props.name;
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */

  /**
   * Return groups users
   * @returns {(GroupUserChangesCollection|null)}
   */
  get groupsUsers() {
    return this._groups_users || null;
  }

  /**
   * Return secrets
   * @returns {(SecretsCollection|null)}
   */
  get secrets() {
    return this._secrets || null;
  }

  /**
   * Set secrets
   * @param {SecretsCollection} secrets
   */
  set secrets(secrets) {
    this._secrets = secrets;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * GroupEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default GroupUpdateEntity;
