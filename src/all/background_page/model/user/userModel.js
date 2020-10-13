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
  async updateLocalStorage () {
    const contain =  {profile: true, gpgkey: false, groups_users: false};
    const userDtos = await this.userService.findAll(contain);
    const usersCollection = new UsersCollection(userDtos);
    await UserLocalStorage.set(usersCollection);
    return usersCollection;
  }

  //==============================================================
  // Finders / remote calls
  //==============================================================

  /**
   * Find all
   *
   * @param {Object} [contains] optional example: {permissions: true}
   * @param {Object} [filters] optional
   * @param {Object} [orders] optional
   * @returns {Promise<ResourcesCollection>}
   */
  async findOne(userId, contains) {
    const userDto = await this.userService.get(userId, contains);
    return new UserEntity(userDto);
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

  //==============================================================
  // CRUD
  //==============================================================
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
   * @returns {Promise<UserEntity>}
   * @public
   */
  async update(userEntity) {
    const data = userEntity.toDto({profile: {avatar: false}});
    const userDto = await this.userService.update(userEntity.id, data);
    const updatedUserEntity = new UserEntity(userDto);
    await UserLocalStorage.updateUser(updatedUserEntity);
    return updatedUserEntity;
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
      let deleteData = (transfer && transfer instanceof UserDeleteTransferEntity) ? transfer.toDto() : {};
      await this.userService.delete(userId, deleteData, true);
    } catch(error) {
      if (error instanceof PassboltApiFetchError && error.data.code === 400 && error.data.body.errors) {
        // recast generic 400 error into a delete dry run error
        // allowing validation of the returned entities and reuse down the line to transfer permissions
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
      let deleteData = (transfer && transfer instanceof UserDeleteTransferEntity) ? transfer.toDto() : {};
      await this.userService.delete(userId, deleteData);
    } catch(error) {
      if (error instanceof PassboltApiFetchError && error.data.code === 400 && error.data.body.errors) {
        // recast generic 400 error into a delete dry run error
        // allowing validation of the returned entities and reuse down the line to transfer permissions
        throw new DeleteDryRunError(error.message, error.data.body.errors);
      }
      throw error;
    }

    // Update local storage
    await UserLocalStorage.delete(userId);
  }
}

exports.UserModel = UserModel;