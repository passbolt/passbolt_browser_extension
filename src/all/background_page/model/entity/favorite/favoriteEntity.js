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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'Favorite';
const FAVORITE_RESOURCE = 'Resource';

class FavoriteEntity extends Entity {
  /**
   * Role entity constructor
   *
   * @param {Object} favoriteDto favorite DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(favoriteDto) {
    super(EntitySchema.validate(
      FavoriteEntity.ENTITY_NAME,
      favoriteDto,
      FavoriteEntity.getSchema()
    ));
  }

  /**
   * Get favorite entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id",
        "user_id",
        "foreign_key",
        "created"
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
        "created": {
          "type": "string",
          "format": "date-time"
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
   * Get favorite id
   * @returns {string} uuid
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get favorite user id
   * @returns {string} uuid
   */
  get userId() {
    return this._props.user_id;
  }

  /**
   * Get favorite foreignKey
   * @returns {string} uuid
   */
  get foreignKey() {
    return this._props.foreign_key;
  }

  /**
   * Get created date
   * @returns {(string|null)} date
   */
  get created() {
    return this._props.created || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * FavoriteEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * FavoriteEntity.FAVORITE_RESOURCE
   * @returns {string} resource
   */
  static get FAVORITE_RESOURCE() {
    return FAVORITE_RESOURCE;
  }

  /**
   * FavoriteEntity.ALLOWED_FOREIGN_MODELS
   * @returns {[string]} array of supported resource names
   */
  static get ALLOWED_FOREIGN_MODELS() {
    return [FAVORITE_RESOURCE];
  }
}

export default FavoriteEntity;
