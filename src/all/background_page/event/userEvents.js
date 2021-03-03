/**
 * User events
 *
 * Used to handle the events related to the current user
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {AccountModel} = require("../model/account/accountModel");
const {User} = require('../model/user');
const {UserModel} = require('../model/user/userModel');
const {UserEntity} = require('../model/entity/user/userEntity');
const {UserDeleteTransferEntity} = require('../model/entity/user/transfer/userDeleteTransfer');
const {AvatarUpdateEntity} = require("../model/entity/avatar/update/avatarUpdateEntity");
const {SecurityTokenEntity} = require("../model/entity/securityToken/securityTokenEntity");

const listen = function (worker) {

  /* ==================================================================================
   *  Getters for user
   * ================================================================================== */

  /*
   * Get the current user as stored in the plugin.
   *
   * @listens passbolt.user.get
   * @param requestId {uuid} The request identifier
   * @param data {array} The user filter
   */
  worker.port.on('passbolt.user.get', function (requestId, data) {
    try {
      const user = User.getInstance().get(data);
      worker.port.emit(requestId, 'SUCCESS', user);
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message);
    }
  });

  /* ==================================================================================
   *  CRUD
   * ================================================================================== */
  /*
   * Create a user user
   *
   * @listens passbolt.user.create
   * @param requestId {uuid} The request identifier
   * @param userDto {Object} The user object, example:
   *  {username: 'ada@passbolt.com', profile: {first_name: 'ada', last_name: 'lovelace'}, role_id: <UUID>}
   */
  worker.port.on('passbolt.users.create', async function (requestId, userDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const userModel = new UserModel(clientOptions);
      const userEntity = new UserEntity(userDto);
      const updatedUser = await userModel.create(userEntity);
      worker.port.emit(requestId, 'SUCCESS', updatedUser);
    } catch(error) {
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
  worker.port.on('passbolt.users.find-logged-in-user', async function (requestId) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const userModel = new UserModel(clientOptions);
      const loggedInUserId = User.getInstance().get().id;
      const contains = {profile: true, role: true};
      const userEntity = await userModel.findOne(loggedInUserId, contains, true);
      worker.port.emit(requestId, 'SUCCESS', userEntity);
    } catch(error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Update a user
   * Can be used to change the role or firstname/lastname but nothing else
   *
   * @listens passbolt.user.update
   * @param requestId {uuid} The request identifier
   * @param userDato {Object} The user object, example:
   *  {id: <UUID>, username: 'ada@passbolt.com', profile: {first_name: 'ada', last_name: 'lovelace'}, role_id: <UUID>}
   */
  worker.port.on('passbolt.users.update', async function (requestId, userDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const userModel = new UserModel(clientOptions);
      const userEntity = new UserEntity(userDto);
      const updatedUser = await userModel.update(userEntity, true);
      worker.port.emit(requestId, 'SUCCESS', updatedUser);
    } catch(error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Update a user avatar
   *
   * @listens passbolt.users.update-avatar
   * @param requestId {uuid} The request identifier
   * @param avatarBase64UpdateDto {object} The avatar dto
   *  {fileBase64: <string>, mimeType: <string>, filename: <string>}
   */
  worker.port.on('passbolt.users.update-avatar', async function (requestId, userId, avatarBase64UpdateDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const userModel = new UserModel(clientOptions);
      const avatarUpdateEntity = AvatarUpdateEntity.createFromFileBase64(avatarBase64UpdateDto);
      const updatedUser = await userModel.updateAvatar(userId, avatarUpdateEntity, true);
      worker.port.emit(requestId, 'SUCCESS', updatedUser);
    } catch(error) {
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
  worker.port.on('passbolt.users.update-security-token', async function (requestId, securityTokenDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const accountModel = new AccountModel(clientOptions);
      const securityTokenEntity = new SecurityTokenEntity(securityTokenDto);
      await accountModel.changeSecurityToken(securityTokenEntity);
      worker.port.emit(requestId, 'SUCCESS');
    } catch(error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Delete a user - dry run
   *
   * @param {string} requestId The request identifier uuid
   * @param {string} userId The user uuid
   */
  worker.port.on('passbolt.users.delete-dry-run', async function (requestId, userId, transferDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const userModel = new UserModel(clientOptions);
      const transferEntity = transferDto ? new UserDeleteTransferEntity(transferDto) : null;
      await userModel.deleteDryRun(userId, transferEntity);
      worker.port.emit(requestId, 'SUCCESS');
    } catch(error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Delete a user
   *
   * @param {string} requestId The request identifier uuid
   * @param {string} userId The user uuid
   * @param {object} [transferDto] optional data ownership transfer
   */
  worker.port.on('passbolt.users.delete', async function (requestId, userId, transferDto) {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const userModel = new UserModel(clientOptions);
      const transferEntity = transferDto ? new UserDeleteTransferEntity(transferDto) : null;
      await userModel.delete(userId, transferEntity);
      worker.port.emit(requestId, 'SUCCESS');
    } catch(error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /* ==================================================================================
   *  Others
   * ================================================================================== */

  /*
   * Pull the users from the API and update the local storage.
   *
   * @listens passbolt.users.update-local-storage
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.users.update-local-storage', async function (requestId) {
    try {
      let userModel = new UserModel(await User.getInstance().getApiClientOptions());
      await userModel.updateLocalStorage();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Resend an invite to a user.
   *
   * @listens passbolt.users.resend-invite
   * @param {uuid} requestId The request identifier
   * @param {string} username The user username
   */
  worker.port.on('passbolt.users.resend-invite', async function(requestId, username) {
    try {
      let userModel = new UserModel(await User.getInstance().getApiClientOptions());
      await userModel.resendInvite(username);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

exports.listen = listen;
