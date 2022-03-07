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
import {defaultUserDto} from "../user/userEntity.test.data";
import {defaultSecurityTokenDto} from "../securityToken/SecurityTokenEntity.test.data";
import {pgpKeys} from '../../../../tests/fixtures/pgpKeys/keys';

export const defaultAccountDto = data => {
  const userId = data?.user_id || uuidv4();

  const defaultData = {
    "type": data?.type || AccountEntity.TYPE_ACCOUNT_RECOVERY,
    "domain": data?.domain || "https://passbolt.local",
    "user_id": userId,
    "user_public_armored_key": data?.user_public_armored_key || pgpKeys.account_recovery_request.public,
    "user_private_armored_key": data?.user_private_armored_key || pgpKeys.account_recovery_request.private,
    "server_public_armored_key": data?.server_public_armored_key || pgpKeys.ada.public,
    "user": defaultUserDto(Object.assign({id: userId}, JSON.parse(JSON.stringify(data?.user || {})))),
    "security_token": defaultSecurityTokenDto(Object.assign({}, JSON.parse(JSON.stringify(data?.security_token || {}))))
  };

  return Object.assign(defaultData, data || {});
};
