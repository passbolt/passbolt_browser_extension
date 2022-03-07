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
const {UserEntity} = require('../entity/user/userEntity');
const {UsersCollection} = require('../entity/user/usersCollection');
const {UserDeleteTransferEntity} = require('../entity/user/transfer/userDeleteTransfer');

const {UserService} = require('../../service/api/user/userService');
const {UserLocalStorage} = require('../../service/local_storage/userLocalStorage');

const {PassboltApiFetchError} = require('../../error/passboltApiFetchError');
const {DeleteDryRunError} = require('../../error/deleteDryRunError');
const {pgpKeys} = require('../../../tests/fixtures/pgpKeys/keys');

class UserModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.userService = new UserService(apiClientOptions);
  }

  /**
   * Update the users local storage with the latest API
   *
   * @return {UsersCollection}
   * @public
   */
  async updateLocalStorage() {
    // contain pending_account_recovery_user_request is only available for admin or recovery contact role
    const contains =  {profile: true, gpgkey: false, groups_users: false, last_logged_in: true, pending_account_recovery_user_request: true};
    const usersCollection = await this.findAll(contains, null, null, true);
    await UserLocalStorage.set(usersCollection);
    return usersCollection;
  }

  /**
   * Resend an invite to a user
   *
   * @param {string} username The user username
   * @return {Promise<*>}
   * @public
   */
  async resendInvite(username) {
    return this.userService.resendInvite(username);
  }

  /**
   * Get a collection of all users from the local storage.
   * If the local storage is unset, initialize it.
   *
   * @return {UsersCollection}
   */
  async getOrFindAll() {
    const usersDto = await UserLocalStorage.get();
    if (typeof usersDto !== 'undefined') {
      return new UsersCollection(usersDto);
    }
    return this.updateLocalStorage();
  }

  /*
   * ==============================================================
   *  Finders / remote calls
   * ==============================================================
   */

  /**
   * Find one
   *
   * @param {string} userId The user id to find
   * @param {Object?} contains (optional) example: {permissions: true}
   * @param {boolean?} preSanitize (optional) should the service result be sanitized prior to the entity creation
   * @returns {Promise<UserEntity>}
   */
  async findOne(userId, contains, preSanitize) {
    let userDto = await this.userService.get(userId, contains);
    if (preSanitize) {
      userDto = UserEntity.sanitizeDto(userDto);
    }
    return new UserEntity(userDto);
  }

  /**
   * Find all
   *
   * @param {Object} [contains] optional example: {groups_users: true}
   * @param {Object} [filters] optional
   * @param {Object} [orders] optional
   * @param {boolean?} preSanitize (optional) should the service result be sanitized prior to the entity creation
   * @returns {Promise<UsersCollection>}
   */
  async findAll(contains, filters, orders, preSanitize) {
    let usersDto = await this.userService.findAll(contains, filters, orders);
    if (preSanitize) {
      usersDto = UsersCollection.sanitizeDto(usersDto);
    }
    // @todo @debug @mock for account-recovery
    usersDto[0].pending_account_recovery_user_request = {
      id: "d4c0e643-3967-443b-93b3-102d902c4510",
      authentication_token_id: "d4c0e643-3967-443b-93b3-102d902c4512",
      armored_key: pgpKeys.ada.public,
      fingerprint: "03f60e958f4cb29723acdf761353b5b15d9b054f",
      status: "pending",
      created: "2020-05-04T20:31:45+00:00",
      modified: "2020-05-04T20:31:45+00:00",
      created_by: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      modified_by: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    };
    return new UsersCollection(usersDto);
  }

  /**
   * Find all user ids who have access to a user
   *
   * @param {string} userId uuid
   * @returns {Promise<Array<string>>} Array of user uuids
   * @public
   */
  async findAllIdsForResourceUpdate(userId) {
    if (!Validator.isUUID(userId)) {
      throw new TypeError('Error in find all users for users updates. The user id is not a valid uuid.');
    }
    const usersDto = await this.userService.findAll(null, {'has-access': userId});
    const usersCollection = new UsersCollection(usersDto);
    return usersCollection.ids;
  }

  /*
   * ==============================================================
   *  CRUD
   * ==============================================================
   */
  /**
   * Create a user using Passbolt API and add result to local storage
   *
   * @param {UserEntity} userEntity
   * @returns {Promise<UserEntity>}
   * @public
   */
  async create(userEntity) {
    const data = userEntity.toDto({profile: {avatar: false}});
    const userDto = await this.userService.create(data);
    const newUserEntity = new UserEntity(userDto);
    await UserLocalStorage.addUser(newUserEntity);
    return newUserEntity;
  }

  /**
   * Update a user using Passbolt API and add result to local storage
   *
   * @param {UserEntity} userEntity
   * @param {boolean?} preSanitize (optional) should the service result be sanitized prior to the entity creation
   * @returns {Promise<UserEntity>}
   * @public
   */
  async update(userEntity, preSanitize) {
    const data = userEntity.toDto({profile: {avatar: false}});
    let userDto = await this.userService.update(userEntity.id, data);
    if (preSanitize) {
      userDto = UserEntity.sanitizeDto(userDto);
    }
    const updatedUserEntity = new UserEntity(userDto);
    await UserLocalStorage.updateUser(updatedUserEntity);
    return updatedUserEntity;
  }

  /**
   * Update a user using Passbolt API and add result to local storage
   *
   * @param {string} userId The user id to update the avatar for
   * @param {AvatarUpdateEntity} avatarUpdateEntity The avatar update entity
   * @param {boolean?} preSanitize (optional) should the service result be sanitized prior to the entity creation
   * @returns {Promise<UserEntity>}
   * @public
   */
  async updateAvatar(userId, avatarUpdateEntity, preSanitize) {
    let userDto = await this.userService.updateAvatar(userId, avatarUpdateEntity.file, avatarUpdateEntity.filename);
    if (preSanitize) {
      userDto = UserEntity.sanitizeDto(userDto);
    }
    return new UserEntity(userDto);
  }

  /**
   * Check if a user can be deleted
   *
   * A user can not be deleted if:
   * - they are the only owner of a shared resource
   * - they are the only group manager of a group that owns a shared resource
   * In such case ownership transfer is required.
   *
   * @param {string} userId The user id
   * @param {UserDeleteTransferEntity} [transfer] optional ownership transfer information if needed
   * @returns {Promise<void>}
   * @throws {DeleteDryRunError} if some permissions must be transferred
   * @public
   */
  async deleteDryRun(userId, transfer) {
    try {
      const deleteData = (transfer && transfer instanceof UserDeleteTransferEntity) ? transfer.toDto() : {};
      await this.userService.delete(userId, deleteData, true);
    } catch (error) {
      if (error instanceof PassboltApiFetchError && error.data.code === 400 && error.data.body.errors) {
        /*
         * recast generic 400 error into a delete dry run error
         * allowing validation of the returned entities and reuse down the line to transfer permissions
         */
        throw new DeleteDryRunError(error.message, error.data.body.errors);
      }
      throw error;
    }
  }

  /**
   * Delete a user and transfer ownership if needed
   *
   * @param {string} userId The user id
   * @param {UserDeleteTransferEntity} [transfer] optional ownership transfer information if needed
   * @returns {Promise<void>}
   * @public
   */
  async delete(userId, transfer) {
    try {
      const deleteData = (transfer && transfer instanceof UserDeleteTransferEntity) ? transfer.toDto() : {};
      await this.userService.delete(userId, deleteData);
    } catch (error) {
      if (error instanceof PassboltApiFetchError && error.data.code === 400 && error.data.body.errors) {
        /*
         * recast generic 400 error into a delete dry run error
         * allowing validation of the returned entities and reuse down the line to transfer permissions
         */
        throw new DeleteDryRunError(error.message, error.data.body.errors);
      }
      throw error;
    }

    // Update local storage
    await UserLocalStorage.delete(userId);
  }
}

exports.UserModel = UserModel;
