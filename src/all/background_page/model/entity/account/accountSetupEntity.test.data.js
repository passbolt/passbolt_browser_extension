/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import {v4 as uuidv4} from "uuid";
import AccountSetupEntity from "./accountSetupEntity";
import {pgpKeys} from "../../../../../../test/fixtures/pgpKeys/keys";
import {defaultSecurityTokenDto} from "../securityToken/SecurityTokenEntity.test.data";

export const initialAccountSetupDto = (data = {}) => {
  const defaultData = {
    "type": AccountSetupEntity.TYPE_ACCOUNT,
    "domain": "https://passbolt.local",
    "user_id": pgpKeys.ada.userId,
    "authentication_token_token": uuidv4(),
  };

  return Object.assign(defaultData, data);
};

export const startAccountSetupDto = (data = {}) => {
  const defaultData = {
    "first_name": "Ada",
    "last_name": "Lovelace",
    "username": "ada@passbolt.dev"
  };

  return initialAccountSetupDto(Object.assign(defaultData, data));
};

export const withServerKeyAccountSetupDto = (data = {}) => {
  const defaultData = {
    "server_public_armored_key": pgpKeys.server.public,
  };

  return startAccountSetupDto(Object.assign(defaultData, data));
};

export const withUserKeyAccountSetupDto = (data = {}) => {
  const defaultData = {
    "user_key_fingerprint": pgpKeys.ada.fingerprint,
    "user_public_armored_key": pgpKeys.ada.public,
    "user_private_armored_key": pgpKeys.ada.private,
  };

  return withServerKeyAccountSetupDto(Object.assign(defaultData, data));
};

export const withSecurityTokenAccountSetupDto = (data = {}) => {
  const defaultData = {
    security_token: defaultSecurityTokenDto()
  };

  return withUserKeyAccountSetupDto(Object.assign(defaultData, data));
};
