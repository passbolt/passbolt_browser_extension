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
import {pgpKeys} from "../../../../../../test/fixtures/pgpKeys/keys";
import {defaultSecurityTokenDto} from "../securityToken/SecurityTokenEntity.test.data";
import AccountAccountRecoveryEntity from "./accountAccountRecoveryEntity";
import {pendingAccountRecoveryRequestDto} from "../accountRecovery/accountRecoveryRequestEntity.test.data";

export const initialAccountAccountRecoveryDto = (data = {}) => {
  const defaultData = {
    "type": AccountAccountRecoveryEntity.TYPE_ACCOUNT_ACCOUNT_RECOVERY,
    "domain": "https://passbolt.local",
    "user_id": pgpKeys.ada.userId,
    "authentication_token_token": uuidv4(),
    "first_name": "Ada",
    "last_name": "Lovelace",
    "username": "ada@passbolt.com",
    "server_public_armored_key": pgpKeys.server.public,
    "user_key_fingerprint": pgpKeys.account_recovery_request.fingerprint,
    "user_public_armored_key": pgpKeys.account_recovery_request.public,
    "user_private_armored_key": pgpKeys.account_recovery_request.private,
    "security_token": defaultSecurityTokenDto(data?.security_token),
    "account_recovery_request_id":  uuidv4(),
  };

  // delete already treated data.
  delete data.security_token;

  return Object.assign(defaultData, data);
};

export const defaultAccountAccountRecoveryDto = (data = {}) => {
  const accountRecoveryRequestId = uuidv4();
  const defaultData = {
    account_recovery_request_id: accountRecoveryRequestId,
    account_recovery_request: pendingAccountRecoveryRequestDto({id: accountRecoveryRequestId})
  };
  return initialAccountAccountRecoveryDto(Object.assign(defaultData, data));
};
