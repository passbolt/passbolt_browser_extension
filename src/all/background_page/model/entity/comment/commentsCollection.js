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
import CommentEntity from "./commentEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

const ENTITY_NAME = 'Comments';

const RULE_UNIQUE_ID = 'unique_id';
const RULE_SAME_FOREIGN_MODEL = 'same_foreign_model';

class CommentsCollection extends EntityCollection {
  /**
   * Comments Entity constructor
   *
   * @param {Object} commentsCollectionDto comment DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(commentsCollectionDto) {
    super(EntitySchema.validate(
      CommentsCollection.ENTITY_NAME,
      commentsCollectionDto,
      CommentsCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(comment => {
      this.push(new CommentEntity(comment));
    });

    // We do not keep original props
    this._props = null;
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
   * Assert there is no other comment with the same id in the collection
   *
   * @param {CommentEntity} commentEntity
   * @throws {EntityValidationError} if a comment with the same id already exist
   */
  assertUniqueId(commentEntity) {
    if (!commentEntity.id) {
      return;
    }
    const length = this.comments.length;
    let i = 0;
    for (; i < length; i++) {
      const existingComment = this.comments[i];
      if (existingComment.id && existingComment.id === commentEntity.id) {
        throw new EntityCollectionError(i, CommentsCollection.RULE_UNIQUE_ID, `Comment id ${commentEntity.id} already exists.`);
      }
    }
  }

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
      const msg = `The collection is already used for another model with id ${this.comments[0].resourceId} (${this.comments[0].foreignKey}).`;
      throw new EntityCollectionError(0, CommentsCollection.RULE_SAME_FOREIGN_MODEL, msg);
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Push a copy of the comment to the list
   * @param {object} comment DTO or CommentEntity
   */
  push(comment) {
    if (!comment || typeof comment !== 'object') {
      throw new TypeError('CommentsCollection push parameter should be an object.');
    }
    if (comment instanceof CommentEntity) {
      comment = comment.toDto(CommentEntity.ALL_CONTAIN_OPTIONS); // deep clone
    }
    const commentEntity = new CommentEntity(comment); // validate

    // Build rules
    this.assertUniqueId(commentEntity);
    this.assertSameForeignEntity(commentEntity);

    super.push(commentEntity);
  }

  /**
   * Remove a comment identified by an Id
   * @param commentId
   */
  remove(commentId) {
    const i = this.items.findIndex(item => item.id === commentId);
    this.items.splice(i, 1);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */
  /**
   * CommentsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * CommentsCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }

  /**
   * CommentsCollection.RULE_SAME_FOREIGN_MODEL
   * @returns {string}
   */
  static get RULE_SAME_FOREIGN_MODEL() {
    return RULE_SAME_FOREIGN_MODEL;
  }
}

export default CommentsCollection;
