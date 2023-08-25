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
import AbstractActionLogEntity from "./abstractActionLogEntity";
import DefaultActionLogEntity from "./defaultActionLogEntity";
import PermissionsUpdatedActionLog from "./permissionsUpdatedActionLogEntity";
import EntityCollection from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollection";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityCollectionError from "passbolt-styleguide/src/shared/models/entity/abstract/entityCollectionError";

const ENTITY_NAME = 'ActionLogs';

const RULE_UNIQUE_ID = 'unique_id';

class ActionLogsCollection extends EntityCollection {
  /**
   * Action Logs Collection constructor
   *
   * @param {Object} actionLogsCollectionDto action logs DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(actionLogsCollectionDto) {
    super(EntitySchema.validate(
      ActionLogsCollection.ENTITY_NAME,
      actionLogsCollectionDto,
      ActionLogsCollection.getSchema()
    ));

    /*
     * Note: there is no "multi-item" validation
     * Collection validation will fail at the first item that doesn't validate
     */
    this._props.forEach(actionLog => {
      const actionLogEntity = this.constructActionLogEntityFromDto(actionLog);
      this.push(actionLogEntity);
    });

    // We do not keep original props
    this._props = null;
  }

  /**
   * Get action logs collection schema
   *
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "array",
      "items": AbstractActionLogEntity.getSchema()
    };
  }

  /**
   * Get an action log entity based on a DTO.
   * @param {object} actionLogDto The action log DTO.
   * @returns {AbstractActionLogEntity|null}
   */
  constructActionLogEntityFromDto(actionLogDto) {
    if (PermissionsUpdatedActionLog.ALLOWED_TYPES.includes(actionLogDto.type)) {
      return new PermissionsUpdatedActionLog(actionLogDto);
    } else {
      return new DefaultActionLogEntity(actionLogDto);
    }
  }

  /**
   * Get action logs
   * @returns {Array<AbstractActionLogEntity>}
   */
  get actionLogs() {
    return this._items;
  }

  /**
   * Get all the ids of the action logs in the collection
   *
   * @returns {Array<string>}
   */
  get ids() {
    return this._items.map(item => item.id);
  }

  /*
   * ==================================================
   * Assertions
   * ==================================================
   */

  /**
   * Assert there is no other action log with the same id in the collection
   *
   * @param {AbstractActionLogEntity} actionLog
   * @throws {EntityValidationError} if a action log with the same id already exist
   */
  assertUniqueId(actionLog) {
    if (!actionLog.id) {
      return;
    }
    const length = this.actionLogs.length;
    let i = 0;
    for (; i < length; i++) {
      const existingActionLog = this.actionLogs[i];
      if (existingActionLog.id && existingActionLog.id === actionLog.id) {
        throw new EntityCollectionError(i, ActionLogsCollection.RULE_UNIQUE_ID, `Action log id ${actionLog.id} already exists.`);
      }
    }
  }

  /*
   * ==================================================
   * Setters
   * ==================================================
   */

  /**
   * Push a copy of the action log to the list
   * @param {object} actionLog DTO or AbstractActionLogEntity
   */
  push(actionLog) {
    if (!actionLog || typeof actionLog !== 'object') {
      throw new TypeError(`ActionLogsCollection push parameter should be an object.`);
    }
    if (actionLog instanceof AbstractActionLogEntity) {
      actionLog = actionLog.toDto(Object.getPrototypeOf(actionLog).ALL_CONTAIN_OPTIONS); // deep clone
    }
    const actionLogEntity = this.constructActionLogEntityFromDto(actionLog); // validate

    // Build rules
    this.assertUniqueId(actionLogEntity);

    super.push(actionLogEntity);
  }

  /*
   * ==================================================
   * Static getters
   * ==================================================
   */

  /**
   * ActionLogsCollection.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * ActionLogsCollection.RULE_UNIQUE_ID
   * @returns {string}
   */
  static get RULE_UNIQUE_ID() {
    return RULE_UNIQUE_ID;
  }
}

export default ActionLogsCollection;
