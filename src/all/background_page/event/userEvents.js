/**
 * User events
 *
 * Used to handle the events related to the current user
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import UserModel from "../model/user/userModel";
import AccountModel from "../model/account/accountModel";
import UpdatePrivateKeyController from "../controller/account/updatePrivateKeyController";
import UserEntity from "../model/entity/user/userEntity";
import SecurityTokenEntity from "../model/entity/securityToken/securityTokenEntity";
import AvatarUpdateEntity from "../model/entity/avatar/update/avatarUpdateEntity";
import UpdateUserLocalStorageController from "../controller/user/updateUserLocalStorageController";
import GetOrFindLoggedInUserController from "../controller/user/getOrFindLoggedInUserController";
import UpdateUserController from "../controller/user/updateUserController";
import DeleteDryRunUserController from "../controller/user/deleteDryRunUserController";
import DeleteUserController from "../controller/user/deleteUserController";

/**
 * Listens the user events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions the api client options
 * @param {AccountEntity} account the user account
 */
const listen = function(worker, apiClientOptions, account) {
  /*
   * ==================================================================================
   *  Getters for user
   * ==================================================================================
   */
  /*
   * Get the users from the local storage.
   *
   * @listens passbolt.users.get-all
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.users.get-all', async requestId => {
    try {
      const userModel = new UserModel(apiClientOptions, account);
      const users = await userModel.getOrFindAll();
      worker.port.emit(requestId, 'SUCCESS', users);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * ==================================================================================
   *  CRUD
   * ==================================================================================
   */
  /*
   * Create a user user
   *
   * @listens passbolt.user.create
   * @param requestId {uuid} The request identifier
   * @param userDto {Object} The user object, example:
   *  {username: 'ada@passbolt.com', profile: {first_name: 'ada', last_name: 'lovelace'}, role_id: <UUID>}
   */
  worker.port.on('passbolt.users.create', async(requestId, userDto) => {
    try {
      const userModel = new UserModel(apiClientOptions, account);
      const userEntity = new UserEntity(userDto);
      const updatedUser = await userModel.create(userEntity);
      worker.port.emit(requestId, 'SUCCESS', updatedUser);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Create a user user
   *
   * @listens passbolt.users.find-logged-in-user
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.users.find-logged-in-user', async(requestId, refreshCache) => {
    const controller = new GetOrFindLoggedInUserController(worker, requestId, apiClientOptions, account);
    await controller._exec(refreshCache);
  });

  /*
   * Update a user
   * Can be used to change the role or firstname/lastname but nothing else
   *
   * @listens passbolt.users.update
   * @param requestId {uuid} The request identifier
   * @param userDato {Object} The user object, example:
   *  {id: <UUID>, username: 'ada@passbolt.com', profile: {first_name: 'ada', last_name: 'lovelace'}, role_id: <UUID>}
   */
  worker.port.on('passbolt.users.update', async(requestId, userDto) => {
    const controller = new UpdateUserController(worker, requestId, apiClientOptions, account);
    await controller._exec(userDto);
  });

  /*
   * Update a user avatar
   *
   * @listens passbolt.users.update-avatar
   * @param requestId {uuid} The request identifier
   * @param avatarBase64UpdateDto {object} The avatar dto
   *  {fileBase64: <string>, mimeType: <string>, filename: <string>}
   */
  worker.port.on('passbolt.users.update-avatar', async(requestId, userId, avatarBase64UpdateDto) => {
    try {
      const userModel = new UserModel(apiClientOptions, account);
      const avatarUpdateEntity = AvatarUpdateEntity.createFromFileBase64(avatarBase64UpdateDto);
      const updatedUser = await userModel.updateAvatar(userId, avatarUpdateEntity, true);
      worker.port.emit(requestId, 'SUCCESS', updatedUser);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Update a user avatar
   *
   * @listens passbolt.users.update-security-token
   * @param requestId {uuid} The request identifier
   * @param {{code: string, color: string, textColor: string}} securityTokenDto
   *
   */
  worker.port.on('passbolt.users.update-security-token', async(requestId, securityTokenDto) => {
    try {
      const accountModel = new AccountModel(apiClientOptions, account);
      const securityTokenEntity = new SecurityTokenEntity(securityTokenDto);
      await accountModel.changeSecurityToken(securityTokenEntity);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Update the private key of the user and send the new recovery kit
   *
   * @listens passbolt.user.update-private-key
   * @param requestId {uuid} The request identifier
   * @param oldPassphrase {string} The old passphrase
   * @param newPassphrase {string} The new passphrase
   */
  worker.port.on('passbolt.user.update-private-key', async(requestId, oldPassphrase, newPassphrase) => {
    const controller = new UpdatePrivateKeyController(worker, requestId, apiClientOptions);
    await controller._exec(oldPassphrase, newPassphrase);
  });

  /*
   * Delete a user - dry run
   *
   * @param {string} requestId The request identifier uuid
   * @param {string} userId The user uuid
   */
  worker.port.on('passbolt.users.delete-dry-run', async(requestId, userId) => {
    const controller = new DeleteDryRunUserController(worker, requestId, apiClientOptions, account);
    await controller._exec(userId);
  });

  /*
   * Delete a user
   *
   * @param {string} requestId The request identifier uuid
   * @param {string} userId The user uuid
   * @param {object} [transferDto] optional data ownership transfer
   */
  worker.port.on('passbolt.users.delete', async(requestId, userId, transferDto) => {
    const controller = new DeleteUserController(worker, requestId, apiClientOptions, account);
    await controller._exec(userId, transferDto);
  });

  /*
   * ==================================================================================
   *  Others
   * ==================================================================================
   */

  /*
   * Pull the users from the API and update the local storage.
   *
   * @listens passbolt.users.update-local-storage
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.users.update-local-storage', async requestId => {
    const controller = new UpdateUserLocalStorageController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  /*
   * Resend an invite to a user.
   *
   * @listens passbolt.users.resend-invite
   * @param {uuid} requestId The request identifier
   * @param {string} username The user username
   */
  worker.port.on('passbolt.users.resend-invite', async(requestId, username) => {
    try {
      const userModel = new UserModel(apiClientOptions);
      await userModel.resendInvite(username);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const UserEvents = {listen};
