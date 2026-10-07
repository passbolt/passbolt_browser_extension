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
 * @since         5.17.0
 */
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

/**
 * The organisation WebAuthn MFA settings relevant to the user; the API returns more fields than modelled here.
 */
class MfaWebauthnSettingsEntity extends EntityV2 {
  /**
   * Get the entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      type: "object",
      required: ["max_credentials_per_user"],
      properties: {
        max_credentials_per_user: {
          type: "integer",
          minimum: 1,
        },
      },
    };
  }

  /**
   * @returns {number}
   */
  get maxCredentialsPerUser() {
    return this._props.max_credentials_per_user;
  }
}

export default MfaWebauthnSettingsEntity;
