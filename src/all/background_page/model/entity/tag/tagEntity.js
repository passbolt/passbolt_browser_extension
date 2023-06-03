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
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'Tag';

class TagEntity extends Entity {
  /**
   * Tag entity constructor
   *
   * @param {Object} tagDto tag DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(tagDto) {
    super(EntitySchema.validate(
      TagEntity.ENTITY_NAME,
      tagDto,
      TagEntity.getSchema()
    ));

    // Additional build rules
    if (typeof this._props.is_shared === 'undefined') {
      this._props.is_shared = this.slug.startsWith('#');
    }
    if (this.slug.startsWith('#') && !this.isShared) {
      const error = new EntityValidationError('Invalid tag');
      error.addError('is_shared', 'hashtag', 'A shared tag should start with a hashtag.');
    }
  }

  /**
   * Get tag entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "slug"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "slug": {
          "type": "string",
          "minLength": 1,
          "maxLength": 128
        },
        "is_shared": {
          "type": "boolean"
        }
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get tag id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get tag slug
   * @returns {string}
   */
  get slug() {
    return this._props.slug;
  }

  /**
   * Get tag description
   * @returns {string} is_shared
   */
  get isShared() {
    return this._props.is_shared;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * TagEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default TagEntity;
