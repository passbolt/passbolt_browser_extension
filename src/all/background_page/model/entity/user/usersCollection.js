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
const {EntityCollection} = require('../abstract/entityCollection');
const {EntitySchema} = require('../abstract/entitySchema');
const {EntityCollectionError} = require('../abstract/entityCollectionError');
const {UserEntity} = require('./userEntity');

const ENTITY_NAME = 'Users';

const RULE_UNIQUE_ID = 'unique_id';
const RULE_UNIQUE_USERNAME = 'unique_username';

class UsersCollection extends EntityCollection {
  /**
   * Users Entity constructor
   *
   * @param {Object} usersCollectionDto user DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(usersCollectionDto) {
    super(EntitySchema.validate(
      UsersCollection.ENTITY_NAME,
      usersCollectionDto,
      UsersCollection.getSchema()
    ));

    // Note: there is no "multi-item" validation
    // Collection validation will fail at the first item that doesn't validate
    this._props.forEach(user => {
      this.push(new UserEntity(user));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get users entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": UserEntity.getSchema(),
    }
  }

  /**
   * Get users
   * @returns {Array<UserEntity>}
   */
  get users() {
    return this._items;
  }

  /**
   * Get all the ids of the users in the collection
   *
   * @returns {Array<string>}
   */
  get ids() {
    return this._items.map(r => r.id);
  }

  /**
   * Get first user in the collection matching requested id
   * @returns {(UserEntity|undefined)}
   */
  getFirstById(userId) {
    return this._items.find(r => (r.id === userId));
  }

  // ==================================================
  // Assertions
  // ==================================================
  /**
   * Assert there is no other user with the same id in the collection
   *
   * @param {UserEntity} user
   * @throws {EntityValidationError} if a user with the same id already exist
   */
  assertUniqueId(user) {
    if (!user.id) {
      return;
    }
    const length = this.users.length;
    let i = 0;
    for(; i < length; i++) {
      let existingUser = this.users[i];
      if (existingUser.id && existingUser.id === user.id) {
        throw new EntityCollectionError(i, UsersCollection.RULE_UNIQUE_ID, `User id ${user.id} already exists.`);
      }
    }
  }

  /**
   * Assert there is no other user with the same username in the collection
   *
   * @param {UserEntity} user
   * @throws {EntityValidationError} if a user with the same username already exist
   */
  assertUniqueUsername(user) {
    const length = this.users.length;
    let i = 0;
    for(; i < length; i++) {
      let existingUser = this.users[i];
      if (existingUser.username === user.username) {
        throw new EntityCollectionError(i, UsersCollection.RULE_UNIQUE_USERNAME, `The username ${user.username} already exists.`);
      }
    }
  }

  // ==================================================
  // Setters
  // ==================================================
  /**
   * Push a copy of the user to the list
   * @param {object} user DTO or UserEntity
   */
  push(user) {
    if (!user || typeof user !== 'object') {
      throw new TypeError(`UsersCollection push parameter should be an object.`);
    }
    if (user instanceof UserEntity) {
      user = user.toDto(UserEntity.ALL_CONTAIN_OPTIONS); // deep clone
    }
    const userEntity = new UserEntity(user); // validate

    // Build rules
    this.assertUniqueId(userEntity);
    this.assertUniqueUsername(userEntity);

    super.push(userEntity);
  }

  /**
   * Remove a user identified by an Id
   * @param userId
   */
  remove(userId) {
    const i = this.items.findIndex(item => item.id === userId);
    this.items.splice(i, 1);
  }

  /**
   * Remove multiple users identified by their Ids
   * @param {Array} userIds
   */
  removeMany(userIds) {
    for(let i in userIds) {
      this.remove(userIds[i]);
    }
  }

  // ==================================================
  // Static getters
  // ==================================================
  /**
   * UsersCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * UsersCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }

  /**
   * UsersCollection.RULE_UNIQUE_USERNAME
   * @returns {string}
   */
  static get RULE_UNIQUE_USERNAME() {
    return RULE_UNIQUE_USERNAME;
  }
}

exports.UsersCollection = UsersCollection;
