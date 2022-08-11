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
import GroupLocalStorage from "../../service/local_storage/groupLocalStorage";
import GroupsCollection from "../entity/group/groupsCollection";
import DeleteDryRunError from "../../error/deleteDryRunError";
import GroupEntity from "../entity/group/groupEntity";
import GroupService from "../../service/api/group/groupService";
import GroupUpdateDryRunResultEntity from "../entity/group/update/groupUpdateDryRunResultEntity";
import GroupDeleteTransferEntity from "../entity/group/transfer/groupDeleteTransfer";
import PassboltApiFetchError from "../../error/passboltApiFetchError";

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
  async updateLocalStorage() {
    const contains = {groups_users: true, my_group_user: true, modifier: false};
    const groupsCollection = await this.findAll(contains, null, null, true);
    await GroupLocalStorage.set(groupsCollection);
    return groupsCollection;
  }

  /*
   * ==============================================================
   *  Local storage getters
   * ==============================================================
   */

  /**
   * Get a group by id
   *
   * @param {string} groupId The group id
   * @return {GroupEntity}
   */
  async getById(groupId) {
    const localGroup = await GroupLocalStorage.getGroupById(groupId);
    if (localGroup) {
      return new GroupEntity(localGroup);
    }
  }

  /*
   * ==============================================================
   *  CRUD
   * ==============================================================
   */

  /**
   * Find all groups
   *
   * @param {Object} [contains] optional
   * @param {Object} [filters] optional
   * @param {Object} [orders] optional
   * @param {boolean?} preSanitize (optional) should the service result be sanitized prior to the entity creation
   * @returns {Promise<GroupsCollection>}
   */
  async findAll(contains, filters, orders, preSanitize) {
    let groupsDto = await this.groupService.findAll(contains, filters, orders);
    if (preSanitize) {
      groupsDto = GroupsCollection.sanitizeDto(groupsDto);
    }
    return new GroupsCollection(groupsDto);
  }

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
   * Simulate update a group using Passbolt API
   *
   * @param {GroupUpdateEntity} groupUpdateEntity
   * @returns {Promise<GroupUpdateDryRunResultEntity>}
   * @public
   */
  async updateDryRun(groupUpdateEntity) {
    const data = groupUpdateEntity.toDto();
    const groupUpdateDryRunResultDto = await this.groupService.updateDryRun(groupUpdateEntity.id, data);
    return new GroupUpdateDryRunResultEntity(groupUpdateDryRunResultDto);
  }

  /**
   * Update a group using Passbolt API and add result to local storage
   *
   * @param {GroupUpdateEntity} groupUpdateEntity
   * @param {boolean?} preSanitize (optional) should the service result be sanitized prior to the entity creation
   * @returns {Promise<GroupEntity>}
   * @public
   */
  async update(groupUpdateEntity, preSanitize) {
    const data = groupUpdateEntity.toDto();
    let groupDto = await this.groupService.update(groupUpdateEntity.id, data);
    if (preSanitize) {
      groupDto = GroupEntity.sanitizeDto(groupDto);
    }
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
      const deleteData = (transfer && transfer instanceof GroupDeleteTransferEntity) ? transfer.toDto() : {};
      await this.groupService.delete(groupId, deleteData, true);
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
   * Delete a group and transfer ownership if needed
   *
   * @param {string} groupId The group id
   * @param {GroupDeleteTransferEntity} [transfer] optional ownership transfer information if needed
   * @returns {Promise<void>}
   * @public
   */
  async delete(groupId, transfer) {
    try {
      const deleteData = (transfer && transfer instanceof GroupDeleteTransferEntity) ? transfer.toDto() : {};
      await this.groupService.delete(groupId, deleteData);
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
    await GroupLocalStorage.delete(groupId);
  }
}

export default GroupModel;
