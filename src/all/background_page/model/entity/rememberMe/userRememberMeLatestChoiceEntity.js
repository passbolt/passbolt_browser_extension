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
 * @since         4.2.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'UserRememberMeLatestChoice';

class UserRememberMeLatestChoiceEntity extends Entity {
  /**
   * @inheritDoc
   */
  constructor(userRememberMeLatestChoice, options = {}) {
    super(EntitySchema.validate(
      UserRememberMeLatestChoiceEntity.ENTITY_NAME,
      userRememberMeLatestChoice,
      UserRememberMeLatestChoiceEntity.getSchema()
    ), options);
  }

  /**
   * Get plaintext entity schema
   * @throws TypeError unsupported
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "duration",
      ],
      "properties": {
        "duration": {
          "type": "integer",
          "minimum": -1
        }
      }
    };
  }

  /**
   * Return props
   *
   * @returns {any}
   */
  get props() {
    return this._props;
  }

  /**
   * Return the duration
   * @returns {integer} duration
   */
  get duration() {
    return this._props.duration;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * UserRememberMeLatestChoiceEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default UserRememberMeLatestChoiceEntity;
