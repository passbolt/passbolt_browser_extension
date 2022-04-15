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
import {AccountEntity} from "./accountEntity";
import {defaultSecurityTokenDto} from "../securityToken/SecurityTokenEntity.test.data";
import {pgpKeys} from '../../../../tests/fixtures/pgpKeys/keys';

export const defaultAccountDto = (data = {}) => {
  data = JSON.parse(JSON.stringify(data));

  const defaultData = {
    "type": AccountEntity.TYPE_ACCOUNT,
    "domain": "https://passbolt.local",
    "user_id": uuidv4(),
    "username": "ada@passbolt.dev",
    "first_name": "Ada",
    "last_name": "Lovelace",
    "user_public_armored_key": pgpKeys.account_recovery_request.public,
    "user_private_armored_key": pgpKeys.account_recovery_request.private,
    "server_public_armored_key": pgpKeys.ada.public,
    "locale": "de-DE",
    "security_token": defaultSecurityTokenDto(data?.security_token)
  };

  delete data.securityToken;

  return Object.assign(defaultData, data);
};
