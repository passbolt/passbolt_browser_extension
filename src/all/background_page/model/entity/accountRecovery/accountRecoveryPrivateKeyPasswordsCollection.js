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
import AccountRecoveryPrivateKeyPasswordEntity from "./accountRecoveryPrivateKeyPasswordEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";
import deduplicateObjects from "../../../utils/array/deduplicateObjects";

const ENTITY_NAME = 'AccountRecoveryPrivateKeyPassword';
const RULE_UNIQUE_ID = 'unique_id';

/**
 * Entity Collection related to the account recovery private key password
 */
class AccountRecoveryPrivateKeyPasswordsCollection extends EntityCollection {
  /**
   * AccountRecoveryPrivateKeyPasswords Entity constructor
   *
   * @param {Object} AccountRecoveryPrivateKeyPasswordsCollectionDto accountRecoveryPrivateKeyPasswordsCollection DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(accountRecoveryPrivateKeyPasswordsCollectionDto) {
    super(EntitySchema.validate(
      AccountRecoveryPrivateKeyPasswordsCollection.ENTITY_NAME,
      accountRecoveryPrivateKeyPasswordsCollectionDto,
      AccountRecoveryPrivateKeyPasswordsCollection.getSchema()
    ));

    /*
     * Check if resource ids are unique
     * Why not this.push? It is faster than adding items one by one
     */
    const ids = this._props.map(accountRecoveryPrivateKeyPassword => accountRecoveryPrivateKeyPassword.id);
    ids.sort().sort((a, b) => {
      if (a === b) {
        throw new EntityCollectionError(0, AccountRecoveryPrivateKeyPasswordsCollection.RULE_UNIQUE_ID, `AccountRecoveryPrivateKeyPassword id ${a} already exists.`);
      }
    });
    // Directly push into the private property _items[]
    this._props.forEach(accountRecoveryPrivateKeyPassword => {
      this._items.push(new AccountRecoveryPrivateKeyPasswordEntity(accountRecoveryPrivateKeyPassword));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get accountRecoveryPrivateKeyPasswords entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": AccountRecoveryPrivateKeyPasswordEntity.getSchema(),
    };
  }

  /**
   * Get accountRecoveryPrivateKeyPasswords
   * @returns {Array<AccountRecoveryPrivateKeyPasswordEntity>}
   */
  get accountRecoveryPrivateKeyPasswords() {
    return this._items;
  }

  /**
   * Get all the ids of the accountRecoveryPrivateKeyPasswords in the collection
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
   * @param {AccountRecoveryPrivateKeyPasswordEntity} accountRecoveryPrivateKeyPassword
   * @throws {EntityValidationError} if a resource with the same id already exist
   */
  assertUniqueId(accountRecoveryPrivateKeyPassword) {
    if (!accountRecoveryPrivateKeyPassword.id) {
      return;
    }
    const length = this.accountRecoveryPrivateKeyPasswords.length;
    let i = 0;
    for (; i < length; i++) {
      const existingResource = this.accountRecoveryPrivateKeyPasswords[i];
      if (existingResource.id && existingResource.id === accountRecoveryPrivateKeyPassword.id) {
        throw new EntityCollectionError(i, AccountRecoveryPrivateKeyPasswordsCollection.RULE_UNIQUE_ID, `account recovery private key password id ${accountRecoveryPrivateKeyPassword.id} already exists.`);
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
   * @param {object} accountRecoveryPrivateKeyPassword DTO or AccountRecoveryPrivateKeyPasswordEntity
   */
  push(accountRecoveryPrivateKeyPassword) {
    if (!accountRecoveryPrivateKeyPassword || typeof accountRecoveryPrivateKeyPassword !== 'object') {
      throw new TypeError(`accountRecoveryPrivateKeyPasswordsCollection push parameter should be an object.`);
    }
    if (accountRecoveryPrivateKeyPassword instanceof AccountRecoveryPrivateKeyPasswordEntity) {
      accountRecoveryPrivateKeyPassword = accountRecoveryPrivateKeyPassword.toDto(); // deep clone
    }
    const accountRecoveryPrivateKeyPasswordEntity = new AccountRecoveryPrivateKeyPasswordEntity(accountRecoveryPrivateKeyPassword); // validate

    // Build rules
    this.assertUniqueId(accountRecoveryPrivateKeyPasswordEntity);

    super.push(accountRecoveryPrivateKeyPasswordEntity);
  }

  /**
   * Remove a accountRecoveryPrivateKeyPassword identified by an Id
   * @param accountRecoveryPrivateKeyPasswordId
   */
  remove(accountRecoveryPrivateKeyPasswordId) {
    const i = this.items.findIndex(item => item.id === accountRecoveryPrivateKeyPasswordId);
    this.items.splice(i, 1);
  }

  /**
   * Remove multiple accountRecoveryPrivateKeyPasswords identified by their Ids
   * @param {Array} accountRecoveryPrivateKeyPasswordIds
   */
  removeMany(accountRecoveryPrivateKeyPasswordIds) {
    for (const i in accountRecoveryPrivateKeyPasswordIds) {
      this.remove(accountRecoveryPrivateKeyPasswordIds[i]);
    }
  }

  /**
   * @param {string} foreignModel
   * @returns {AccountRecoveryPrivateKeyPasswordEntity}
   */
  filterByForeignModel(foreignModel) {
    const filterPrivateKeyPasswordByRecipientForeignModel = accountRecoveryPrivateKeyPassword => accountRecoveryPrivateKeyPassword.recipientForeignModel === foreignModel;
    return this.items.find(filterPrivateKeyPasswordByRecipientForeignModel);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * AccountRecoveryPrivateKeyPasswordsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AccountRecoveryPrivateKeyPasswordsCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }
}

export default AccountRecoveryPrivateKeyPasswordsCollection;
