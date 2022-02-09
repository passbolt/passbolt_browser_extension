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
      armored_key: "-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n\r\nmQINBFXHTB8BEADAaRMUn++WVatrw3kQK7\/6S6DvBauIYcBateuFjczhwEKXUD6T\r\nhLm7nOv5\/TKzCpnB5WkP+UZyfT\/+jCC2x4+pSgog46jIOuigWBL6Y9F6KkedApFK\r\nxnF6cydxsKxNf\/V70Nwagh9ZD4W5ujy+RCB6wYVARDKOlYJnHKWqco7anGhWYj8K\r\nKaDT+7yM7LGy+tCZ96HCw4AvcTb2nXF197Btu2RDWZ\/0MhO+DFuLMITXbhxgQC\/e\r\naA1CS6BNS7F91pty7s2hPQgYg3HUaDogTiIyth8R5Inn9DxlMs6WDXGc6IElSfhC\r\nnfcICao22AlM6X3vTxzdBJ0hm0RV3iU1df0J9GoM7Y7y8OieOJeTI22yFkZpCM8i\r\ntL+cMjWyiID06dINTRAvN2cHhaLQTfyD1S60GXTrpTMkJzJHlvjMk0wapNdDM1q3\r\njKZC+9HAFvyVf0UsU156JWtQBfkE1lqAYxFvMR\/ne+kI8+6ueIJNcAtScqh0LpA5\r\nuvPjiIjvlZygqPwQ\/LUMgxS0P7sPNzaKiWc9OpUNl4\/P3XTboMQ6wwrZ3wOmSYuh\r\nFN8ez51U8UpHPSsI8tcHWx66WsiiAWdAFctpeR\/ZuQcXMvgEad57pz\/jNN2JHycA\r\n+awesPIJieX5QmG44sfxkOvHqkB3l193yzxu\/awYRnWinH71ySW4GJepPQARAQAB\r\ntB9BZGEgTG92ZWxhY2UgPGFkYUBwYXNzYm9sdC5jb20+iQJOBBMBCgA4AhsDBQsJ\r\nCAcDBRUKCQgLBRYCAwEAAh4BAheAFiEEA\/YOlY9MspcjrN92E1O1sV2bBU8FAl0b\r\nmi8ACgkQE1O1sV2bBU+Okw\/\/b\/PRVTz0\/hgdagcVNYPn\/lclDFuwwqanyvYu6y6M\r\nAiLVn6CUtxfU7GH2aSwZSr7D\/46TSlBHvxVvNlYROMx7odbLgq47OJxfUDG5OPi7\r\nLZgsuE8zijCPURZTZu20m+ratsieV0ziri+xJV09xJrjdkXHdX2PrkU0YeJxhE50\r\nJuMR1rf7EHfCp45nWbXoM4H+LnadGC1zSHa1WhSJkeaYw9jp1gh93BKD8+kmUrm6\r\ncKEjxN54YpgjFwSdA60b+BZgXbMgA37gNQCnZYjk7toaQClUbqLMaQxHPIjETB+Z\r\njJNKOYn740N2LTRtCi3ioraQNgXQEU7tWsXGS0tuMMN7w4ya1I6sYV3fCtfiyXFw\r\nfuYnjjGzn5hXtTjiOLJ+2kdy5OmNZc9wpf6IpKv7\/F2RUwLsBUfH4ondNNXscdkB\r\n6Zoj1Hxt16TpkHnYrKsSWtoOs90JnlwYbHnki6R\/gekYRSRSpD\/ybScQDRASQ0aO\r\nhbi71WuyFbLZF92P1mEK5GInJeiFjKaifvJ8F+oagI9hiYcHgX6ghktaPrANa2De\r\nOjmesQ0WjIHirzFKx3avYIkOFwKp8v6KTzynAEQ8XUqZmqEhNjEgVKHH0g3sC+EC\r\nZ\/HGLHsRRIN1siYnJGahrrkNs7lFI5LTqByHh52bismY3ADLemxH6Voq+DokvQn4\r\nHxS5Ag0EVcdMHwEQAMFWZvlswoC+dEFISBhJLz0XpTR5M84MCn19s\/ILjp6dGPbC\r\nvlGcT5Ol\/wL43T3hML8bzq18MRGgkzhwsBkUXO+E7jVePjuGFvRwS5W+QYwCuAmw\r\nDijDdMhrev1mrdVK61v\/2U9kt5faETW8ZIYIvAWLaw\/lMHbVmKOa35ZCIJWcNsrv\r\noro2kGUklM6Nq1JQyU+puGPHuvm+1ywZzpAH5q55pMgfO+9JjMU3XFs+eqv6LVyA\r\n\/Y6T7ZK1H8inbUPm\/26sSvmYsT\/4xNVosC\/ha9lFEAasz\/rbVg7thffje4LWOXJB\r\no40iBTlHsNbCGs5BfNC0wl719JDA4V8mwhGInNtETCrGwg3mBlDrk5jYrDq5IMVk\r\nyX4Z6T8Fd2fLHmUr2kFc4vC96tGQGhNrbAa\/EeaAkWMeFyp\/YOW0Z3X2tz5A+lm+\r\nqevJZ3HcQd+7ca6mPTrYSVVXhclwSkyCLlhRJwEwSxrn+a2ZToYNotLs1uEy6tOL\r\nbIyhFBQNsR6mTa2ttkd\/89wJ+r9s7XYDOyibTQyUGgOXu\/0l1K0jTREKlC91wKkm\r\ndw\/lJkjZCIMc\/KTHiB1e7f5NdFtxwErToEZOLVumop0FjRqzHoXZIR9OCSMUzUmM\r\nspGHalE71GfwB9DkAlgvoJPohyiipJ\/Paw3pOytZnb\/7A\/PoRSjELgDNPJhxABEB\r\nAAGJAjYEGAEKACACGwwWIQQD9g6Vj0yylyOs33YTU7WxXZsFTwUCXRuaPgAKCRAT\r\nU7WxXZsFTxX0EADAN9lreHgEvsl4JK89JqwBLjvGeXGTNmHsfczCTLAutVde+Lf0\r\nqACAhKhG0J8Omru2jVkUqPhkRcaTfaPKopT2KU8GfjKuuAlJ+BzH7oUq\/wy70t2h\r\nsglAYByv4y0emwnGyFC8VNw2Fe+Wil2y5d8DI8XHGp0bAXehjT2S7\/v1lEypeiiE\r\nNbhAnGG94Zywwwim0RltyNKXOgGeT4mroYxAL0zeTaX99Lch+DqyaeDq94g4sfhA\r\nVvGT2KJDT85vR3oNbB0U5wlbKPa+bUl8CokEDjqrDmdZOOs\/UO2mc45V3X5RNRtp\r\nNZMBGPJsxOKQExEOZncOVsY7ZqLrecuR8UJBQnhPd1aoz3HCJppaPI02uINWyQLs\r\nCogTf+nQWnLyN9qLrToriahNcZlDfuJCRVKTQ1gw1lkSN3IZRSkBuRYRe05US+C6\r\n8JMKHP+1XMKMgQM2XR7r4noMJKLaVUzfLXuPIWH2xNdgYXcIOSRjiANkIv4O7lWM\r\nxX9vD6LklijrepMl55Omu0bhF5rRn2VAubfxKhJs0eQn69+NWaVUrNMQ078nF+8G\r\nKT6vH32q9i9fpV38XYlwM9qEa0il5wfrSwPuDd5vmGgk9AOlSEzY2vE1kvp7lEt1\r\nTdb3ZfAajPMO3Iov5dwvm0zhJDQHFo7SFi5jH0Pgk4bAd9HBmB8sioxL4Q==\r\n=Kwft\r\n-----END PGP PUBLIC KEY BLOCK-----",
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
