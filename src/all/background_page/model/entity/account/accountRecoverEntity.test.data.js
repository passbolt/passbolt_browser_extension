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
import {AccountRecoverEntity} from "./accountRecoverEntity";
import {defaultUserDto} from "../user/userEntity.test.data";
import {AccountRecoveryUserSettingEntity} from "../accountRecovery/accountRecoveryUserSettingEntity";

export const initialAccountRecoverDto = (data = {}) => {
  const defaultData = {
    "type": AccountRecoverEntity.TYPE_ACCOUNT_RECOVER,
    "domain": "https://passbolt.local",
    "user_id": uuidv4(),
    "authentication_token_token": uuidv4(),
  };

  return Object.assign(defaultData, data);
};

export const startAccountRecoverDto = (data = {}) => {
  const user = defaultUserDto(data?.user);
  const defaultData = {
    "user_id": user.id,
    "first_name": user.profile.first_name,
    "last_name": user.profile.last_name,
    "username": user.username,
    "user": user
  };

  // delete already treated data.
  delete data.user;

  return initialAccountRecoverDto(Object.assign(defaultData, data));
};

export const startWithApprovedAccountRecoveryAccountRecoverDto = (data = {}) => {
  const accountRecoveryUserSetting = {
    "status": AccountRecoveryUserSettingEntity.STATUS_APPROVED
  };
  const user = defaultUserDto({
    account_recovery_user_setting: accountRecoveryUserSetting,
    ...data?.user
  });
  const defaultData = {user};

  // delete already treated data.
  delete data.user;

  return startAccountRecoverDto(Object.assign(defaultData, data));
};

export const withServerKeyAccountRecoverDto = (data = {}) => {
  const defaultData = {
    "server_public_armored_key": pgpKeys.server.public,
  };

  return startAccountRecoverDto(Object.assign(defaultData, data));
};

export const withUserKeyAccountRecoverDto = (data = {}) => {
  const defaultData = {
    "user_key_fingerprint": pgpKeys.ada.fingerprint,
    "user_public_armored_key": pgpKeys.ada.public,
    "user_private_armored_key": pgpKeys.ada.private,
  };

  return withServerKeyAccountRecoverDto(Object.assign(defaultData, data));
};

export const withSecurityTokenAccountRecoverDto = (data = {}) => {
  const defaultData = {
    security_token: defaultSecurityTokenDto()
  };

  return withUserKeyAccountRecoverDto(Object.assign(defaultData, data));
};
