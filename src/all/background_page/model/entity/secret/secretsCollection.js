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
 * @since         2.13.0
 */
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import SecretEntity from "./secretEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

const ENTITY_NAME = 'Secrets';

const RULE_UNIQUE_ID = 'unique_id';
const RULE_UNIQUE_RESOURCE_ID_USER_ID = 'unique_resource_id_user_id';

class SecretsCollection extends EntityCollection {
  /**
   * Secrets Collection constructor
   *
   * @param {Object} secretsCollectionDto secret DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(secretsCollectionDto) {
    super(EntitySchema.validate(
      SecretsCollection.ENTITY_NAME,
      secretsCollectionDto,
      SecretsCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(secret => {
      this.push(new SecretEntity(secret));
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get secrets entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": SecretEntity.getSchema(),
    };
  }

  /**
   * Get secrets
   * @returns {Array<SecretEntity>}
   */
  get secrets() {
    return this._items;
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */
  /**
   * Assert there is no other secret with the same id in the collection
   *
   * @param {SecretEntity} secret
   * @throws {EntityValidationError} if a secret with the same id already exist
   */
  assertUniqueId(secret) {
    if (!secret.id) {
      return;
    }
    const collectionErrorIndex = this.items.findIndex(item => item.id === secret.id);
    if (collectionErrorIndex !== -1) {
      throw new EntityCollectionError(collectionErrorIndex, SecretsCollection.RULE_UNIQUE_ID, `Secret id ${secret.id} already exists.`);
    }
  }

  /**
   * Assert there is no other secret with the same user id in the collection
   *
   * @param {SecretEntity} secret
   * @throws {EntityValidationError} if a secret with the same id already exist
   */
  assertUniqueResourceIdUserId(secret) {
    if (!secret.userId || !secret.resourceId) {
      return;
    }

    const collectionErrorIndex = this.items.findIndex(item => item.resourceId === secret.resourceId && item.userId === secret.userId);
    if (collectionErrorIndex !== -1) {
      throw new EntityCollectionError(collectionErrorIndex, SecretsCollection.RULE_UNIQUE_USER_ID, `Secret for user id ${secret.userId} and resource id ${secret.resourceId} already exists.`);
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the secret to the list
   * @param {object} secret DTO or SecretEntity
   */
  push(secret) {
    if (!secret || typeof secret !== 'object') {
      throw new TypeError(`SecretsCollection push parameter should be an object.`);
    }
    if (secret instanceof SecretEntity) {
      secret = secret.toDto(); // clone
    }
    const secretEntity = new SecretEntity(secret); // validate

    // Build rules
    this.assertUniqueId(secretEntity);
    this.assertUniqueResourceIdUserId(secretEntity);

    super.push(secretEntity);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * SecretsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * SecretsCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }

  /**
   * SecretsCollection.RULE_UNIQUE_RESOURCE_ID_USER_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_RESOURCE_ID_USER_ID() {
    return RULE_UNIQUE_RESOURCE_ID_USER_ID;
  }
}

export default SecretsCollection;
