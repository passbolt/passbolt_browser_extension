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
import UserEntity from "passbolt-styleguide/src/shared/models/entity/user/userEntity";
import AppEmailValidatorService from "../../../service/validator/appEmailValidatorService";

/**
 * Browser-extension flavour of UserEntity.
 *
 * Injects the application email validator on the `username` schema property. The validator
 * depends on OrganizationSettingsModel, a bext-only static cache that cannot be hosted in
 * the styleguide. All other behaviour (associations, marshalling, serialization, getters)
 * is inherited from the styleguide source of truth.
 */
class BextUserEntity extends UserEntity {
  /**
   * @inheritDoc
   * Override the schema to attach the custom email validator on `username`.
   * `super.getSchema()` returns a fresh object literal each call, so mutating is safe.
   */
  static getSchema() {
    const schema = super.getSchema();
    schema.properties.username.custom = AppEmailValidatorService.validate;
    return schema;
  }
}

export default BextUserEntity;
