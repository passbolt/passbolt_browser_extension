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

const STATUS_WAITING_CONNECTION = 'waiting_connection';
const STATUS_CONNECTED = 'connected';
const STATUS_RECONNECTING = 'reconnecting';

class WorkerEntity extends Entity {
  /**
   * @inheritDoc
   */
  constructor(workerDto, options = {}) {
    super(EntitySchema.validate(
      WorkerEntity.ENTITY_NAME,
      workerDto,
      WorkerEntity.getSchema()
    ), options);
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
        "name",
        "status"
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
        },
        "status": {
          "type": "string",
          "enum": [this.STATUS_WAITING_CONNECTION, this.STATUS_CONNECTED, this.STATUS_RECONNECTING]
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

  /**
   * Get worker status
   * @returns {string} string
   */
  get status() {
    return this._props.status;
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */
  /**
   * Set the frame id
   * @param frameId
   */
  set frameId(frameId) {
    this._props.frameId = frameId;
  }

  /**
   * Set the status
   * @param status
   */
  set status(status) {
    const propSchema = WorkerEntity.getSchema().properties.status;
    this._props.status = EntitySchema.validateProp("status", status, propSchema);
  }

  /*
   * ==================================================
   * Methods
   * ==================================================
   */
  /**
   * Is waiting connection status
   * @return {boolean}
   */
  get isWaitingConnection() {
    return this.status === STATUS_WAITING_CONNECTION;
  }

  /**
   * Is connected status
   * @return {boolean}
   */
  get isConnected() {
    return this.status === STATUS_CONNECTED;
  }

  /**
   * Is reconnecting
   * @return {boolean}
   */
  get isReconnecting() {
    return this.status === STATUS_RECONNECTING;
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

  /**
   * WorkerEntity.STATUS_WAITING_CONNECTION
   * @returns {string}
   */
  static get STATUS_WAITING_CONNECTION() {
    return STATUS_WAITING_CONNECTION;
  }

  /**
   * WorkerEntity.STATUS_CONNECTED
   * @returns {string}
   */
  static get STATUS_CONNECTED() {
    return STATUS_CONNECTED;
  }

  /**
   * WorkerEntity.STATUS_RECONNECTING
   * @returns {string}
   */
  static get STATUS_RECONNECTING() {
    return STATUS_RECONNECTING;
  }
}

export default WorkerEntity;
