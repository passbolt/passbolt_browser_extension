/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import AccountRecoveryRequestEntity from "./accountRecoveryRequestEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import deduplicateObjects from "../../../utils/array/deduplicateObjects";

const ENTITY_NAME = 'AccountRecoveryRequest';
const RULE_UNIQUE_ID = 'unique_id';

/**
 * Entity Collection related to the account recovery request
 */
class AccountRecoveryRequestsCollection extends EntityCollection {
  /**
   * AccountRecoveryRequests Entity constructor
   *
   * @param {Object} AccountRecoveryRequestsCollectionDto resource DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(AccountRecoveryRequestsCollectionDto) {
    super(EntitySchema.validate(
      AccountRecoveryRequestsCollection.ENTITY_NAME,
      AccountRecoveryRequestsCollectionDto,
      AccountRecoveryRequestsCollection.getSchema()
    ));

    /*
     * Check if accountRecoveryRequest ids are unique
     * Why not this.push? It is faster than adding items one by one
     */
    const ids = this._props.map(accountRecoveryRequest => accountRecoveryRequest.id);
    ids.sort().sort((a, b) => {
      if (a === b) {
        throw new EntityCollectionError(0, AccountRecoveryRequestsCollection.RULE_UNIQUE_ID, `AccountRecoveryRequest id ${a} already exists.`);
      }
    });
    // Directly push into the private property _items[]
    this._props.forEach(accountRecoveryRequest => {
      this._items.push(new AccountRecoveryRequestEntity(accountRecoveryRequest));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get accountRecoveryRequests entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": AccountRecoveryRequestEntity.getSchema(),
    };
  }

  /**
   * Get accountRecoveryRequests
   * @returns {Array<ResourceEntity>}
   */
  get accountRecoveryRequests() {
    return this._items;
  }

  /**
   * Get all the ids of the accountRecoveryRequests in the collection
   *
   * @returns {Array<string>}
   */
  get ids() {
    return this._items.map(r => r.id);
  }

  /*
   * ==================================================
   * Sanitization
   * ==================================================
   */
  /**
   * Sanitize resources dto:
   * - Deduplicate the resources by id.
   *
   * @param {Array} dto The resources dto
   * @returns {Array}
   */
  static sanitizeDto(dto) {
    if (!Array.isArray(dto)) {
      return [];
    }

    return deduplicateObjects(dto, 'id');
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */
  /**
   * Assert there is no other resource with the same id in the collection
   *
   * @param {AccountRecoveryRequestEntity} accountRecoveryRequest
   * @throws {EntityValidationError} if a resource with the same id already exist
   */
  assertUniqueId(accountRecoveryRequest) {
    if (!accountRecoveryRequest.id) {
      return;
    }
    const length = this.accountRecoveryRequests.length;
    let i = 0;
    for (; i < length; i++) {
      const existingResource = this.accountRecoveryRequests[i];
      if (existingResource.id && existingResource.id === accountRecoveryRequest.id) {
        throw new EntityCollectionError(i, AccountRecoveryRequestsCollection.RULE_UNIQUE_ID, `account recovery private key password id ${accountRecoveryRequest.id} already exists.`);
      }
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the resource to the list
   * @param {object} accountRecoveryRequest DTO or AccountRecoveryRequestEntity
   */
  push(accountRecoveryRequest) {
    if (!accountRecoveryRequest || typeof accountRecoveryRequest !== 'object') {
      throw new TypeError(`accountRecoveryRequestsCollection push parameter should be an object.`);
    }
    if (accountRecoveryRequest instanceof AccountRecoveryRequestEntity) {
      accountRecoveryRequest = accountRecoveryRequest.toDto(); // deep clone
    }
    const accountRecoveryRequestEntity = new AccountRecoveryRequestEntity(accountRecoveryRequest); // validate

    // Build rules
    this.assertUniqueId(accountRecoveryRequestEntity);

    super.push(accountRecoveryRequestEntity);
  }

  /**
   * Remove a accountRecoveryRequest identified by an Id
   * @param accountRecoveryRequestId
   */
  remove(accountRecoveryRequestId) {
    const i = this.items.findIndex(item => item.id === accountRecoveryRequestId);
    this.items.splice(i, 1);
  }

  /**
   * Remove multiple accountRecoveryRequests identified by their Ids
   * @param {Array} accountRecoveryRequestIds
   */
  removeMany(accountRecoveryRequestIds) {
    for (const i in accountRecoveryRequestIds) {
      this.remove(accountRecoveryRequestIds[i]);
    }
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * AccountRecoveryRequestsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoveryRequestsCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }
}

export default AccountRecoveryRequestsCollection;
