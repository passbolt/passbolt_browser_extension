/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'Worker';

class WorkerEntity extends Entity {
  /**
   * Entity constructor
   *
   * @param {Object} workerDto worker DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(workerDto) {
    super(EntitySchema.validate(
      WorkerEntity.ENTITY_NAME,
      workerDto,
      WorkerEntity.getSchema()
    ));
  }

  /**
   * Entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id",
        "tabId",
        "name"
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "tabId": {
          "type": "integer",
        },
        "frameId": {
          "anyOf": [{
            "type": "integer"
          }, {
            "type": "null"
          }]
        },
        "name": {
          "type": "string",
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
   * Get worker id
   * @returns {string} uuid
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get worker tab id
   * @returns {integer} id
   */
  get tabId() {
    return this._props.tabId;
  }

  /**
   * Get worker frame id
   * @returns {integer|null} id
   */
  get frameId() {
    if (typeof this._props.frameId !== 'undefined') {
      return this._props.frameId;
    }
    return null;
  }

  /**
   * Get worker name
   * @returns {string} string
   */
  get name() {
    return this._props.name;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * WorkerEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default WorkerEntity;
