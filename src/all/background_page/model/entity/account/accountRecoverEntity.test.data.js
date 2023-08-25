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
import AccountRecoverEntity from "./accountRecoverEntity";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import AccountRecoveryUserSettingEntity from "../accountRecovery/accountRecoveryUserSettingEntity";

export const initialAccountRecoverDto = (data = {}) => ({
  "type": AccountRecoverEntity.TYPE_ACCOUNT_RECOVER,
  "domain": "https://passbolt.local",
  "user_id": uuidv4(),
  "authentication_token_token": uuidv4(),
  ...data
});

export const startAccountRecoverDto = (data = {}) => {
  const user = data?.user || defaultUserDto();

  return initialAccountRecoverDto({
    "user_id": user.id,
    "first_name": user.profile.first_name,
    "last_name": user.profile.last_name,
    "username": user.username,
    "user": user,
    ...data
  });
};

export const startWithApprovedAccountRecoveryAccountRecoverDto = (data = {}) => {
  const accountRecoveryUserSetting = {
    "status": AccountRecoveryUserSettingEntity.STATUS_APPROVED
  };
  const user = defaultUserDto({
    account_recovery_user_setting: accountRecoveryUserSetting
  });

  return startAccountRecoverDto({
    user: user,
    ...data
  });
};

export const withServerKeyAccountRecoverDto = (data = {}) => startAccountRecoverDto({
  "server_public_armored_key": pgpKeys.server.public,
  ...data
});

export const withUserKeyAccountRecoverDto = (data = {}) => withServerKeyAccountRecoverDto({
  "user_key_fingerprint": pgpKeys.ada.fingerprint,
  "user_public_armored_key": pgpKeys.ada.public,
  "user_private_armored_key": pgpKeys.ada.private,
  ...data
});

export const withSecurityTokenAccountRecoverDto = (data = {}) => withUserKeyAccountRecoverDto({
  security_token: defaultSecurityTokenDto(),
  ...data
});
