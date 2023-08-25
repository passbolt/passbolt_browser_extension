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
import ResourceEntity from "../resource/resourceEntity";
import FolderEntity from "../folder/folderEntity";
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import LoggedUserEntity from "../user/actionLog/loggedUserEntity";


const ENTITY_NAME = 'AbstractActionLog';

/**
 * List of allowed foreign models on which Comments can be plugged.
 */
const ALLOWED_FOREIGN_MODELS = [
  ResourceEntity.ENTITY_NAME,
  FolderEntity.ENTITY_NAME,
];

class AbstractActionLogEntity extends Entity {
  /**
   * Action log entity constructor
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);

    // Associations
    if (this._props.creator) {
      this._creator = new LoggedUserEntity(this._props.creator);
      delete this._props.creator;
    }
  }

  /**
   * Get action log entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id",
        "action_log_id",
        "type",
        "creator",
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "action_log_id": {
          "type": "string",
          "format": "uuid"
        },
        "type": {
          "type": "string",
          "maxLength": 100
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        // Associations
        "creator": LoggedUserEntity.getSchema()
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
   *
   * @returns {object}
   */
  toDto() {
    const result = Object.assign({}, this._props);

    if (this._creator) {
      result.creator = this.creator.toDto(LoggedUserEntity.ALL_CONTAIN_OPTIONS);
    }

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
   * @todo to document, see API \Passbolt\AuditLog\Utility\ActionLogResultsParser::getEntryId
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get action log type
   * @returns {string} username
   */
  get type() {
    return this._props.type;
  }

  /**
   * Get action log id
   * @returns {(string|null)} uuid
   */
  get actionLogId() {
    return this._props.action_log_id || null;
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
   * Other associated properties methods
   * ==================================================
   */

  /**
   * Get the creator.
   * @returns {(LoggedUserEntity|null)}
   */
  get creator() {
    return this._creator || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * ActionLog.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * AcitonLog.ALLOWED_FOREIGN_MODELS
   * @returns {[string]} array of supported resource names
   */
  static get ALLOWED_FOREIGN_MODELS() {
    return ALLOWED_FOREIGN_MODELS;
  }
}

export default AbstractActionLogEntity;
