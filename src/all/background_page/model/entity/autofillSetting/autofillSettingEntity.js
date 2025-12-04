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
 * @since         5.8.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

const ENTITY_NAME = 'AutofillSetting';

class AutofillSettingEntity extends Entity {
  /**
   * @inheritDoc
   */
  constructor(autofillSettingDto, options = {}) {
    super(EntitySchema.validate(
      AutofillSettingEntity.ENTITY_NAME,
      autofillSettingDto,
      AutofillSettingEntity.getSchema()
    ), options);
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "copyTotpOnAutofill",
      ],
      "properties": {
        "copyTotpOnAutofill": {
          "type": "boolean"
        }
      }
    };
  }

  /**
   * Return whether TOTP should be copied to clipboard on autofill
   * @returns {boolean}
   */
  get copyTotpOnAutofill() {
    return this._props.copyTotpOnAutofill;
  }

  /**
   * Get the default settings
   * @returns {AutofillSettingEntity}
   */
  static createFromDefault() {
    return new AutofillSettingEntity({copyTotpOnAutofill: false});
  }

  /**
   * AutofillSettingEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default AutofillSettingEntity;
