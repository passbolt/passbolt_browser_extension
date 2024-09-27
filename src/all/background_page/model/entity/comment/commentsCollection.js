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
import CollectionValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/collectionValidationError";
import CommentEntity from "./commentEntity";
import EntityV2Collection from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2Collection";

const RULE_SAME_FOREIGN_MODEL = 'same_foreign_model';

class CommentsCollection extends EntityV2Collection {
  /**
   * @inheritDoc
   */
  get entityClass() {
    return CommentEntity;
  }

  /**
   * Get comments entity schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": CommentEntity.getSchema(),
    };
  }

  /**
   * @inheritDoc
   * @param {Set} [options.uniqueId] A set of unique ids.
   * @param {Set} [options.sameForeignId]  A set od the collection is always about the same foreign entity
   * @throws {EntityValidationError} If a folder already exists with the same id.
   */
  validateBuildRules(item) {
    this.assertNotExist("id", item._props.id);
    this.assertSameForeignEntity(item);
  }

  /**
   * Get comments
   * @returns {Array<CommentEntity>}
   */
  get comments() {
    return this._items;
  }

  /**
   * Get all the ids of the comments in the collection
   *
   * @returns {Array<CommentEntity>}
   */
  get ids() {
    return this._items.map(r => r.id);
  }

  /**
   * Get all the user ids for the comments in the collection
   *
   * @returns {Array<CommentEntity>}
   */
  get userIds() {
    return this._items.map(r => r.userId);
  }

  /**
   * Get all the foreign key ids for the comments in the collection
   *
   * @returns {Array<CommentEntity>}
   */
  get foreignKey() {
    return this._items.map(r => r.foreignKey);
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */
  /**
   * Assert there the collection is always about the same foreign entity
   *
   * @param {CommentEntity} commentEntity
   * @throws {EntityValidationError} if a comment for another foreign model name or id already exist
   */
  assertSameForeignEntity(commentEntity) {
    if (!this.comments.length) {
      return;
    }
    const matches = (commentEntity.foreignKey === this.comments[0].foreignKey) &&
      (commentEntity.foreignModel === this.comments[0].foreignModel);
    if (!matches) {
      const collectionValidationError = new CollectionValidationError();
      const message = `The collection is already used for another model with id ${this.comments[0].resourceId} (${this.comments[0].foreignKey}).`;
      collectionValidationError.addCollectionValidationError(CommentsCollection.RULE_SAME_FOREIGN_MODEL, message);
      throw collectionValidationError;
    }
  }
  /*
   * ==================================================
   * Static getters
   * ==================================================
   */

  /**
   * CommentsCollection.RULE_SAME_FOREIGN_MODEL
   * @returns {string}
   */
  static get RULE_SAME_FOREIGN_MODEL() {
    return RULE_SAME_FOREIGN_MODEL;
  }
}

export default CommentsCollection;
