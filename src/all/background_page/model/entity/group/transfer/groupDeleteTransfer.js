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
import PermissionTransfersCollection from "../../permission/transfer/permissionTransfersCollection";
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";


const ENTITY_NAME = 'GroupDeleteTransfer';

class GroupDeleteTransferEntity extends Entity {
  /**
   * GroupDeleteTransfer entity constructor
   *
   * @param {Object} transferDto transfer DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(transferDto) {
    /*
     * cannot use default entity schema validation as there are no required field
     * e.g. owners or managers should be set or both
     */
    super(GroupDeleteTransferEntity.validate(transferDto));

    // Association
    if (this._props.owners) {
      this._owners = new PermissionTransfersCollection(this._props.owners);
      delete this._props.owners;
    }
  }

  /**
   * Validate the props
   */
  static validate(transferDto) {
    const props = {};
    if (!transferDto || !transferDto.owners) {
      throw new EntityValidationError(`The group delete transfer data cannot be empty.`);
    }
    if (transferDto.owners && Array.isArray(transferDto.owners)) {
      props.owners = transferDto.owners;
    }
    return props;
  }

  /**
   * Get role entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "properties": {
        "owners": PermissionTransfersCollection.getSchema()
      }
    };
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API
   * @returns {Object} with owners and/or managers key set
   */
  toDto() {
    const result = {};
    if (this.owners) {
      result.owners = this.owners.toDto();
    }
    return result;
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get the collection of resource/folder permission transfers if any
   * @returns {PermissionTransfersCollection}
   * @public
   */
  get owners() {
    return this._owners || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * GroupDeleteTransferEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default GroupDeleteTransferEntity;
