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


const ENTITY_NAME = "UpdateSubscription";

class UpdateSubscriptionEntity extends Entity {
  /**
   * Setup entity constructor
   *
   * @param {Object} subscriptionDto subscription DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(subscriptionDto) {
    super(EntitySchema.validate(
      UpdateSubscriptionEntity.ENTITY_NAME,
      subscriptionDto,
      UpdateSubscriptionEntity.getSchema()
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
        "data"
      ],
      "properties": {
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
  /**
   * Get the created
   * @returns {string}
   */
  get data() {
    return this._props.data;
  }

  /**
   * Set the data
   * @param {string} data The data
   * @throws EntityValidationError The parameter doesn't match the constraint of the property
   */
  set data(data) {
    EntitySchema.validateProp("data", data, UpdateSubscriptionEntity.getSchema().properties.data);
    this._props.data = data;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * UpdateSubscriptionEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default UpdateSubscriptionEntity;
