/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.0.0
 */
import User from "../model/user";
import GroupModel from "../model/group/groupModel";
import GroupsUpdateController from "../controller/group/groupUpdateController";
import GroupEntity from "../model/entity/group/groupEntity";
import GroupDeleteTransferEntity from "../model/entity/group/transfer/groupDeleteTransfer";


const listen = function(worker) {
  /*
   * Pull the groups from the API and update the local storage.
   *
   * @listens passbolt.groups.update-local-storage
   * @param {uuid} requestId The request identifier
   */
  worker.port.on('passbolt.groups.update-local-storage', async requestId => {
    try {
      const groupModel = new GroupModel(await User.getInstance().getApiClientOptions());
      await groupModel.updateLocalStorage();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Find all the groups
   *
   * @listens passbolt.groups.find-all
   * @param requestId {uuid} The request identifier
   * @param options {object} The options to apply to the find
   */
  worker.port.on('passbolt.groups.find-all', async(requestId, options) => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const groupModel = new GroupModel(clientOptions);
      const {contains, filters, orders} = options;
      const groupsCollection = await groupModel.findAll(contains, filters, orders);
      worker.port.emit(requestId, 'SUCCESS', groupsCollection);
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
   * Create a groups
   *
   * @listens passbolt.groups.create
   * @param requestId {uuid} The request identifier
   * @param groupDto {Object} The group object, example:
   *  {name: 'group name', groups_users: [{user_id: <UUID>, is_admin: <boolean>}]}
   */
  worker.port.on('passbolt.groups.create', async(requestId, groupDto) => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const groupModel = new GroupModel(clientOptions);
      const groupEntity = new GroupEntity(groupDto);
      const newGroup = await groupModel.create(groupEntity);
      worker.port.emit(requestId, 'SUCCESS', newGroup);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Edit a groups
   *
   * @listens passbolt.groups.update
   * @param requestId {uuid} The request identifier
   * @param groupDto {Object} The group object, example:
   *  {name: 'group name', groups_users: [{user_id: <UUID>, is_admin: <boolean>, deleted: <boolean>}]}
   */
  worker.port.on('passbolt.groups.update', async(requestId, groupDto) => {
    const clientOptions = await User.getInstance().getApiClientOptions();
    const controller = new GroupsUpdateController(worker, requestId, clientOptions);
    try {
      const groupUpdated = await controller.main(groupDto);
      worker.port.emit(requestId, 'SUCCESS', groupUpdated);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Delete a Group - dry run
   *
   * @param {string} requestId The request identifier uuid
   * @param {string} groupId The user uuid
   * @param {object} [transferDto] optional data ownership transfer
   * example: {owners: [{aco_foreign_key: <UUID>, id: <UUID>}]}
   */
  worker.port.on('passbolt.groups.delete-dry-run', async(requestId, groupId, transferDto) => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const groupModel = new GroupModel(clientOptions);
      const transferEntity = transferDto ? new GroupDeleteTransferEntity(transferDto) : null;
      await groupModel.deleteDryRun(groupId, transferEntity);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Delete a Group
   *
   * @param {string} requestId The request identifier uuid
   * @param {string} groupId The group uuid
   * @param {object} [transferDto] optional data ownership transfer
   * example: {owners: [{aco_foreign_key: <UUID>, id: <UUID>}]}
   */
  worker.port.on('passbolt.groups.delete', async(requestId, groupId, transferDto) => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const groupModel = new GroupModel(clientOptions);
      const transferEntity = transferDto ? new GroupDeleteTransferEntity(transferDto) : null;
      await groupModel.delete(groupId, transferEntity);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};
export const GroupEvents = {listen};
