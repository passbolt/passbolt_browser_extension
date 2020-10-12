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
const {GroupEntity} = require('../entity/group/groupEntity');
const {GroupsCollection} = require('../entity/group/groupsCollection');
const {GroupDeleteTransferEntity} = require('../entity/group/transfer/groupDeleteTransfer');

const {GroupService} = require('../../service/api/group/groupService');
const {GroupLocalStorage} = require('../../service/local_storage/groupLocalStorage');

const {PassboltApiFetchError} = require('../../error/passboltApiFetchError');
const {DeleteDryRunError} = require('../../error/deleteDryRunError');

class GroupModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.groupService = new GroupService(apiClientOptions);
  }

  /**
   * Update the groups local storage with the latest API
   *
   * @return {GroupsCollection}
   * @public
   */
  async updateLocalStorage () {
    const contain = {groups_users: true, my_group_user: true, modifier: false};
    const groupDtos = await this.groupService.findAll(contain);
    const groupsCollection = new GroupsCollection(groupDtos);
    await GroupLocalStorage.set(groupsCollection);
    return groupsCollection;
  }

  /**
   * Find all groups
   *
   * @param {Object} [contains] optional
   * @param {Object} [filters] optional
   * @param {Object} [orders] optional
   * @returns {Promise<GroupsCollection>}
   */
  async findAll(contains, filters, orders) {
    let groupsDto = await this.groupService.findAll(contains, filters, orders);
    return new GroupsCollection(groupsDto);
  }

  //==============================================================
  // CRUD
  //==============================================================
  /**
   * Create a group using Passbolt API and add result to local storage
   *
   * @param {GroupEntity} groupEntity
   * @returns {Promise<GroupEntity>}
   * @public
   */
  async create(groupEntity) {
    const data = groupEntity.toDto({groups_users: true});
    const groupDto = await this.groupService.create(data);
    const newGroupEntity = new GroupEntity(groupDto);
    await GroupLocalStorage.addGroup(newGroupEntity);
    return newGroupEntity;
  }

  /**
   * Update a group using Passbolt API and add result to local storage
   *
   * @param {GroupEntity} groupEntity
   * @returns {Promise<GroupEntity>}
   * @public
   */
  async update(groupEntity) {
    const data = groupEntity.toDto({groups_users: true});
    const groupDto = await this.groupService.update(groupEntity.id, data);
    const updatedGroupEntity = new GroupEntity(groupDto);
    await GroupLocalStorage.updateGroup(updatedGroupEntity);
    return updatedGroupEntity;
  }

  /**
   * Check if a group can be deleted
   *
   * A group can not be deleted if:
   * - they are the only owner of a shared resource
   * - they are the only group manager of a group that owns a shared resource
   * In such case ownership transfer is required.
   *
   * @param {string} groupId The group id
   * @param {GroupDeleteTransferEntity} [transfer] optional ownership transfer information if needed
   * @returns {Promise<void>}
   * @throws {DeleteDryRunError} if some permissions must be transferred
   * @public
   */
  async deleteDryRun(groupId, transfer) {
    try {
      let deleteData = (transfer && transfer instanceof GroupDeleteTransferEntity) ? transfer.toDto() : {};
      await this.groupService.delete(groupId, deleteData, true);
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
   * Delete a group and transfer ownership if needed
   *
   * @param {string} groupId The group id
   * @param {GroupDeleteTransferEntity} [transfer] optional ownership transfer information if needed
   * @returns {Promise<void>}
   * @public
   */
  async delete(groupId, transfer) {
    try {
      let deleteData = (transfer && transfer instanceof GroupDeleteTransferEntity) ? transfer.toDto() : {};
      await this.groupService.delete(groupId, deleteData);
    } catch(error) {
      if (error instanceof PassboltApiFetchError && error.data.code === 400 && error.data.body.errors) {
        // recast generic 400 error into a delete dry run error
        // allowing validation of the returned entities and reuse down the line to transfer permissions
        throw new DeleteDryRunError(error.message, error.data.body.errors);
      }
      throw error;
    }

    // Update local storage
    await GroupLocalStorage.delete(groupId);
  }
}

exports.GroupModel = GroupModel;