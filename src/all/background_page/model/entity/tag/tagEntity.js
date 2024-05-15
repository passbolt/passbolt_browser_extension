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
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

const ENTITY_NAME = 'Tag';

class TagEntity extends EntityV2 {
  /**
   * @inheritDoc
   * Marshall is_shared should to true if slug starts with #.
   * @throws {EntityValidationError} (Implemented but does not throw) If the slug starts with # the tag is marked as shared.
   */
  constructor(dto, options = {}) {
    super(dto, options);
  }

  /**
   * @inheritDoc
   */
  marshall() {
    if (typeof this._props.is_shared === "undefined" && typeof this._props.slug === "string") {
      this._props.is_shared = this._props.slug?.startsWith('#');
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

  /**
   * @inheritDod
   */
  // eslint-disable-next-line no-unused-vars
  validateBuildRules(options = {}) {
    if (this.slug.startsWith('#') && !this.isShared) {
      const error = new EntityValidationError('Invalid tag');
      error.addError('is_shared', 'hashtag', 'A shared tag should start with a hashtag.');
      // @todo should throw the error, not done to not introduce a regression. todo when ignoreInvalidEntity option will be enforced on critical journey.
    }
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
