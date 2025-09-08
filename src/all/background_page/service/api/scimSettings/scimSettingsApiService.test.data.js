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
 * @since         5.5.0
 */

import {v4 as uuidv4} from "uuid";

/**
 * Default SCIM settings DTO
 * @returns {Object}
 */
export function defaultScimSettingsDto() {
  return {
    id: uuidv4(),
    scim_user_id: uuidv4(),
    setting_id: uuidv4(),
    secret_token: "pb_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefg"
  };
}

/**
 * SCIM settings DTO without secret_token
 * @returns {Object}
 */
export function scimSettingsWithoutSecretTokenDto() {
  return {
    id: uuidv4(),
    scim_user_id: uuidv4(),
    setting_id: uuidv4()
  };
}

/**
 * SCIM settings DTO without id
 * @returns {Object}
 */
export function scimSettingsWithoutIdDto() {
  return {
    scim_user_id: uuidv4(),
    setting_id: uuidv4(),
    secret_token: "pb_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefg"
  };
}

/**
 * SCIM settings DTO with setting_id
 * @returns {Object}
 */
export function scimSettingsWithSettingIdDto() {
  return {
    id: uuidv4(),
    scim_user_id: uuidv4(),
    setting_id: uuidv4(),
    secret_token: "pb_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefg"
  };
}

/**
 * SCIM settings DTO with invalid secret_token
 * @returns {Object}
 */
export function scimSettingsWithInvalidSecretTokenDto() {
  return {
    id: uuidv4(),
    scim_user_id: uuidv4(),
    setting_id: uuidv4(),
    secret_token: "invalid_token"
  };
}
