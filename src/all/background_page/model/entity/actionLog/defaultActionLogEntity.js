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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'DefaultActionLog';

class DefaultActionLogEntity extends AbstractActionLogEntity {
  /**
   * Action log entity constructor
   *
   * @param {Object} actionLog action log DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(actionLog) {
    super(EntitySchema.validate(
      DefaultActionLogEntity.ENTITY_NAME,
      actionLog,
      DefaultActionLogEntity.getSchema()
    ));
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
}

export default DefaultActionLogEntity;
