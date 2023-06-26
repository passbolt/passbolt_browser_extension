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
import AccountRecoveryResponseEntity from "./accountRecoveryResponseEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import deduplicateObjects from "../../../utils/array/deduplicateObjects";

const ENTITY_NAME = 'AccountRecoveryResponse';
const RULE_UNIQUE_ID = 'unique_id';

/**
 * Entity Collection related to the account recovery response
 */
class AccountRecoveryResponsesCollection extends EntityCollection {
  /**
   * AccountRecoveryResponses Entity constructor
   *
   * @param {Object} AccountRecoveryResponsesCollectionDto resource DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(AccountRecoveryResponsesCollectionDto) {
    super(EntitySchema.validate(
      AccountRecoveryResponsesCollection.ENTITY_NAME,
      AccountRecoveryResponsesCollectionDto,
      AccountRecoveryResponsesCollection.getSchema()
    ));

    /*
     * Check if accountRecoveryResponse ids are unique
     * Why not this.push? It is faster than adding items one by one
     */
    const ids = this._props.map(accountRecoveryResponse => accountRecoveryResponse.id);
    ids.sort().sort((a, b) => {
      if (a === b) {
        throw new EntityCollectionError(0, AccountRecoveryResponsesCollection.RULE_UNIQUE_ID, `AccountRecoveryRequest id ${a} already exists.`);
      }
    });
    // Directly push into the private property _items[]
    this._props.forEach(accountRecoveryResponse => {
      this._items.push(new AccountRecoveryResponseEntity(accountRecoveryResponse));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get accountRecoveryResponses entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": AccountRecoveryResponseEntity.getSchema(),
    };
  }

  /**
   * Get accountRecoveryResponses
   * @returns {Array<ResourceEntity>}
   */
  get accountRecoveryResponses() {
    return this._items;
  }

  /**
   * Get all the ids of the accountRecoveryResponses in the collection
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
   * @param {AccountRecoveryResponseEntity} accountRecoveryResponse
   * @throws {EntityValidationError} if a resource with the same id already exist
   */
  assertUniqueId(accountRecoveryResponse) {
    if (!accountRecoveryResponse.id) {
      return;
    }
    const length = this.accountRecoveryResponses.length;
    let i = 0;
    for (; i < length; i++) {
      const existingResource = this.accountRecoveryResponses[i];
      if (existingResource.id && existingResource.id === accountRecoveryResponse.id) {
        throw new EntityCollectionError(i, AccountRecoveryResponsesCollection.RULE_UNIQUE_ID, `account recovery private key password id ${accountRecoveryResponse.id} already exists.`);
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
   * @param {object} accountRecoveryResponse DTO or AccountRecoveryResponseEntity
   */
  push(accountRecoveryResponse) {
    if (!accountRecoveryResponse || typeof accountRecoveryResponse !== 'object') {
      throw new TypeError(`accountRecoveryResponsesCollection push parameter should be an object.`);
    }
    if (accountRecoveryResponse instanceof AccountRecoveryResponseEntity) {
      accountRecoveryResponse = accountRecoveryResponse.toDto(); // deep clone
    }
    const accountRecoveryResponseEntity = new AccountRecoveryResponseEntity(accountRecoveryResponse); // validate

    // Build rules
    this.assertUniqueId(accountRecoveryResponseEntity);

    super.push(accountRecoveryResponseEntity);
  }

  /**
   * Remove a accountRecoveryResponse identified by an Id
   * @param accountRecoveryResponseId
   */
  remove(accountRecoveryResponseId) {
    const i = this.items.findIndex(item => item.id === accountRecoveryResponseId);
    this.items.splice(i, 1);
  }

  /**
   * Remove multiple accountRecoveryResponses identified by their Ids
   * @param {Array} accountRecoveryResponseIds
   */
  removeMany(accountRecoveryResponseIds) {
    for (const i in accountRecoveryResponseIds) {
      this.remove(accountRecoveryResponseIds[i]);
    }
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * AccountRecoveryResponsesCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoveryResponsesCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }
}

export default AccountRecoveryResponsesCollection;
