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

import {v4 as uuidv4} from 'uuid';
import AccountEntity from "./accountEntity";
import {defaultSecurityTokenDto} from "../securityToken/SecurityTokenEntity.test.data";
import {pgpKeys} from '../../../../../../test/fixtures/pgpKeys/keys';

export const defaultAccountDto = (data = {}) => {
  data = JSON.parse(JSON.stringify(data));

  const defaultData = {
    "type": AccountEntity.TYPE_ACCOUNT,
    "domain": "https://passbolt.local",
    "user_id": uuidv4(),
    "username": "ada@passbolt.dev",
    "first_name": "Ada",
    "last_name": "Lovelace",
    "user_key_fingerprint": pgpKeys.ada.fingerprint,
    "user_public_armored_key": pgpKeys.ada.public,
    "user_private_armored_key": pgpKeys.ada.private,
    "server_public_armored_key": pgpKeys.server.public,
    "locale": "de-DE",
  };

  data = Object.assign(defaultData, data);
  data.security_token = defaultSecurityTokenDto(data?.security_token);

  delete data.securityToken;

  return Object.assign(defaultData, data);
};

export const adminAccountDto = (data = {}) => {
  const defaultData = {
    "user_id": pgpKeys.admin.userId,
    "username": "admin@passbolt.dev",
    "first_name": "Admin",
    "last_name": "User",
    "user_key_fingerprint": pgpKeys.admin.fingerprint,
    "user_public_armored_key": pgpKeys.admin.public,
    "user_private_armored_key": pgpKeys.admin.private,
  };

  return defaultAccountDto({
    ...defaultData,
    ...data
  });
};
