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
import UserLocalStorage from "../../service/local_storage/userLocalStorage";
import DeleteDryRunError from "../../error/deleteDryRunError";
import UserService from "../../service/api/user/userService";
import UserDeleteTransferEntity from "../entity/user/transfer/userDeleteTransferEntity";
import UserEntity from "../entity/user/userEntity";
import UsersCollection from "../entity/user/usersCollection";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import Validator from "validator";
import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import UserMeSessionStorageService from "../../service/sessionStorage/userMeSessionStorageService";

/**
 * @deprecated
 */
class UserModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account the account associated to the worker
   * @public
   */
  constructor(apiClientOptions, account = null) {
    this.userService = new UserService(apiClientOptions);
    this.account = account;
  }

  /**
   * Update the users local storage with the latest API
   *
   * @return {UsersCollection}
   * @public
   */
  async updateLocalStorage() {
    // contain pending_account_recovery_request is only available for admin or recovery contact role
    const contains =  {profile: true, gpgkey: false, groups_users: false, last_logged_in: true, pending_account_recovery_request: true, account_recovery_user_setting: true};
    // Add is_mfa_enabled contain if the user account role name is admin
    if (this.account && this.account.roleName === RoleEntity.ROLE_ADMIN) {
      contains.is_mfa_enabled = true;
    }
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
   * Get or find the signed-in user information.
   * @param {boolean} refreshCache (Optional) Should request the API and refresh the cache. Default false.
   * @returns {Promise<UserEntity>}
   */
  async getOrFindMe(refreshCache = false) {
    let user = await UserMeSessionStorageService.get(this.account);
    if (!user || refreshCache) {
      const contains = {profile: true, role: true, account_recovery_user_setting: true};
      user = await this.findOne(this.account.userId, contains, true);
      await UserMeSessionStorageService.set(this.account, user);
    }

    return user;
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
   * @param {boolean?} [ignoreInvalidEntity] Should invalid entities be ignored.
   * @returns {Promise<UserEntity>}
   */
  async findOne(userId, contains, ignoreInvalidEntity) {
    const userDto = await this.userService.get(userId, contains);
    return new UserEntity(userDto, {ignoreInvalidEntity: ignoreInvalidEntity});
  }

  /**
   * Find all
   *
   * @param {Object} [contains] optional example: {groups_users: true}
   * @param {Object} [filters] optional
   * @param {Object} [orders] optional
   * @param {boolean?} [ignoreInvalidEntity] Should invalid entities be ignored.
   * @returns {Promise<UsersCollection>}
   */
  async findAll(contains, filters, orders, ignoreInvalidEntity) {
    const usersDto = await this.userService.findAll(contains, filters, orders);
    return new UsersCollection(usersDto, {clone: false, ignoreInvalidEntity: ignoreInvalidEntity});
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
   * @param {boolean?} [ignoreInvalidEntity] Should invalid entities be ignored.
   * @returns {Promise<UserEntity>}
   * @public
   */
  async update(userEntity, ignoreInvalidEntity) {
    const data = userEntity.toDto({profile: {avatar: false}});
    const userDto = await this.userService.update(userEntity.id, data);
    const updatedUserEntity = new UserEntity(userDto, {ignoreInvalidEntity});
    await UserLocalStorage.updateUser(updatedUserEntity);
    return updatedUserEntity;
  }

  /**
   * Update a user using Passbolt API and add result to local storage
   *
   * @param {string} userId The user id to update the avatar for
   * @param {AvatarUpdateEntity} avatarUpdateEntity The avatar update entity
   * @param {boolean?} [ignoreInvalidEntity] Should invalid entities be ignored.
   * @returns {Promise<UserEntity>}
   * @public
   */
  async updateAvatar(userId, avatarUpdateEntity, ignoreInvalidEntity) {
    const userDto = await this.userService.updateAvatar(userId, avatarUpdateEntity.file, avatarUpdateEntity.filename);
    return  new UserEntity(userDto, {ignoreInvalidEntity});
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

  /**
   * Request help when a user lost its credentials.
   * @param {AbstractAccountEntity} account The account the credentials have been lost for.
   * @returns {Promise<void>}
   */
  async requestHelpCredentialsLost(account) {
    const requestHelpDto = {
      username: account.username,
      case: "lost-passphrase"
    };
    await this.userService.requestHelpCredentialsLost(requestHelpDto);
  }
}

export default UserModel;
