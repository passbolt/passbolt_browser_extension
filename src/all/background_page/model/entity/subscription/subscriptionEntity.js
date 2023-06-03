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
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = "Subscription";

class SubscriptionEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} subscriptionDto subscription DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(subscriptionDto) {
    super(EntitySchema.validate(
      SubscriptionEntity.ENTITY_NAME,
      subscriptionDto,
      SubscriptionEntity.getSchema()
    ));
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "subscription_id",
        "users",
        "expiry",
        "created",
        "data",
      ],
      "properties": {
        "customer_id": {
          "type": "string"
        },
        "subscription_id": {
          "type": "string"
        },
        "users": {
          "type": "integer"
        },
        "email": {
          "type": "string",
          "format": "email"
        },
        "created": {
          "type": "string"
        },
        "expiry": {
          "type": "string"
        },
        "data": {
          "type": "string"
        }
      }
    };
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Return a DTO ready to be sent to API or content code
   * @returns {object}
   */
  toDto() {
    const result = Object.assign({}, this._props);
    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto();
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * SubscriptionEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default SubscriptionEntity;
