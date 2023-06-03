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
import ResourceEntity from "../resource/resourceEntity";
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import UserEntity from "../user/userEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'Comment';
const COMMENT_CONTENT_MIN_LENGTH = 1;
const COMMENT_CONTENT_MAX_LENGTH = 255;

/**
 * List of allowed foreign models on which Comments can be plugged.
 */
const ALLOWED_FOREIGN_MODELS = [
  ResourceEntity.ENTITY_NAME,
];

class CommentEntity extends Entity {
  /**
   * Comment entity constructor
   *
   * @param {Object} commentDto comment DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(commentDto) {
    super(EntitySchema.validate(
      CommentEntity.ENTITY_NAME,
      commentDto,
      CommentEntity.getSchema()
    ));

    // Associations
    if (this._props.creator) {
      this._creator = new UserEntity(this._props.creator);
      delete this._props.creator;
    }
    if (this._props.modifier) {
      this._modifier = new UserEntity(this._props.modifier);
      delete this._props.modifier;
    }
  }

  /**
   * Get comment entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "user_id",
        "foreign_key",
        "foreign_model",
        "content"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "user_id": {
          "type": "string",
          "format": "uuid"
        },
        "foreign_key": {
          "type": "string",
          "format": "uuid"
        },
        "foreign_model": {
          "type": "string",
          "enum": CommentEntity.ALLOWED_FOREIGN_MODELS
        },
        "parent_id": {
          "anyOf": [{
            "type": "string",
            "format": "uuid"
          }, {
            "type": "null"
          }]
        },
        "content": {
          "type": "string",
          "minLength": 1,
          "maxLength": CommentEntity.COMMENT_CONTENT_MAX_LENGTH
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "created_by": {
          "type": "string",
          "format": "uuid"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
        "modified_by": {
          "type": "string",
          "format": "uuid"
        },
        // Associations
        "creator": UserEntity.getSchema(),
        "modifier": UserEntity.getSchema(),
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
   * @param {object} [contain] optional for example {creator: false, modifier: false}
   * @returns {*}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }
    if (this.creator && contain.creator) {
      result.creator = this.creator.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
    }
    if (this.modifier && contain.modifier) {
      result.modifier = this.modifier.toDto(UserEntity.ALL_CONTAIN_OPTIONS);
    }
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(CommentEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get comment id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get comment foreign_key
   * @returns {string} uuid
   */
  get foreignKey() {
    return this._props.foreign_key;
  }

  /**
   * Get comment foreign model
   * @returns {string} model name
   */
  get foreignModel() {
    return this._props.foreign_model;
  }

  /**
   * Get comment user id
   * @returns {string} uuid
   */
  get userId() {
    return this._props.user_id;
  }

  /**
   * Get comment content
   * @returns {string} string
   */
  get content() {
    return this._props.content;
  }

  /**
   * Get comment parent_id
   * @returns {(string|null)} uuid
   */
  get parentId() {
    return this._props.parent_id || null;
  }

  /**
   * Get created date
   * @returns {(string|null)} date
   */
  get created() {
    return this._props.created || null;
  }

  /**
   * Get modified date
   * @returns {(string|null)} date
   */
  get modified() {
    return this._props.modified || null;
  }

  /**
   * Get created by user id
   * @returns {(string|null)} uuid
   */
  get createdBy() {
    return this._props.created_by || null;
  }

  /**
   * Get modified by user id
   * @returns {(string|null)} date
   */
  get modifiedBy() {
    return this._props.modified_by || null;
  }

  /*
   * ==================================================
   * Associated properties getters
   * ==================================================
   */
  /**
   * Get user profile of person who created the comment
   * @returns {(UserEntity|null)} user
   */
  get creator() {
    return this._creator || null;
  }

  /**
   * Get user profile of person who last edited the comment
   * @returns {(UserEntity|null)} user
   */
  get modifier() {
    return this._modifier || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * CommentEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * CommentEntity.COMMENT_CONTENT_MIN_LENGTH
   * @returns {int}
   */
  static get COMMENT_CONTENT_MIN_LENGTH() {
    return COMMENT_CONTENT_MIN_LENGTH;
  }

  /**
   * CommentEntity.COMMENT_CONTENT_MAX_LENGTH
   * @returns {int}
   */
  static get COMMENT_CONTENT_MAX_LENGTH() {
    return COMMENT_CONTENT_MAX_LENGTH;
  }

  /**
   * CommentEntity.ALLOWED_FOREIGN_MODELS
   * @returns {[string]} array of supported resource names
   */
  static get ALLOWED_FOREIGN_MODELS() {
    return ALLOWED_FOREIGN_MODELS;
  }

  /**
   * Comment.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return {
      creator: UserEntity.ALL_CONTAIN_OPTIONS,
      modifier: UserEntity.ALL_CONTAIN_OPTIONS,
    };
  }
}

export default CommentEntity;
