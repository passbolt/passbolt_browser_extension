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
import {defaultUserDto} from "../user/userEntity.test.data";
import {
  alternativeAccountRecoveryOrganizationPublicKeyDto,
  createAccountRecoveryOrganizationPublicKeyDto,
  createAlternativeAccountRecoveryOrganizationPublicKeyDto,
  createRevokedAccountRecoveryOrganizationPublicKeyDto,
  defaultAccountRecoveryOrganizationPublicKeyDto,
  revokedAccountRecoveryOrganizationPublicKeyDto
} from "./accountRecoveryOrganizationPublicKeyEntity.test.data";
import {
  createAccountRecoveryPrivateKeyPasswordDto,
  defaultAccountRecoveryPrivateKeyPasswordDto
} from "./accountRecoveryPrivateKeyPasswordEntity.test.data";

// Disabled account recovery organization policy

export const createDisabledAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = {
    policy: "disabled",
  };

  return Object.assign(defaultData, data || {});
};

export const disabledAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = createDisabledAccountRecoveryOrganizationPolicyDto({
    id: uuidv4(),
    public_key_id: null,
    creator: defaultUserDto(),
    created_by: uuidv4(),
    modified_by: uuidv4(),
    created: "2022-01-13T13:19:04.661Z",
    modified: "2022-01-13T13:19:04.661Z"
  });

  return Object.assign(defaultData, data || {});
};

// Enabled account recovery organization policy

export const createEnabledAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = {
    policy: "opt-out",
    account_recovery_organization_public_key: createAccountRecoveryOrganizationPublicKeyDto(),
  };

  return Object.assign(defaultData, data || {});
};

export const enabledAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = createEnabledAccountRecoveryOrganizationPolicyDto({
    id: uuidv4(),
    public_key_id: uuidv4(),
    account_recovery_organization_public_key: defaultAccountRecoveryOrganizationPublicKeyDto(),
    creator: defaultUserDto(),
    created_by: uuidv4(),
    modified_by: uuidv4(),
    created: "2022-01-13T13:19:04.661Z",
    modified: "2022-01-13T13:19:04.661Z"
  });

  return Object.assign(defaultData, data || {});
};

// Disabled previously enabled account recovery organization policy

export const createDisabledPreviouslyEnabledAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = createDisabledAccountRecoveryOrganizationPolicyDto({
    account_recovery_organization_revoked_key: createRevokedAccountRecoveryOrganizationPublicKeyDto(),
  });

  return Object.assign(defaultData, data || {});
};

export const disabledPreviouslyEnabledAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = createDisabledPreviouslyEnabledAccountRecoveryOrganizationPolicyDto({
    id: uuidv4(),
    public_key_id: null,
    account_recovery_organization_revoked_key: revokedAccountRecoveryOrganizationPublicKeyDto(),
  });

  return Object.assign(defaultData, data || {});
};

// Rotate key account recovery organization policy

export const createRotateKeyAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = createEnabledAccountRecoveryOrganizationPolicyDto({
    account_recovery_organization_public_key: createAlternativeAccountRecoveryOrganizationPublicKeyDto(),
    account_recovery_organization_revoked_key: createRevokedAccountRecoveryOrganizationPublicKeyDto(),
    account_recovery_private_key_passwords: [
      createAccountRecoveryPrivateKeyPasswordDto()
    ]
  });

  return Object.assign(defaultData, data || {});
};

export const rotateKeyAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = enabledAccountRecoveryOrganizationPolicyDto({
    account_recovery_organization_public_key: alternativeAccountRecoveryOrganizationPublicKeyDto(),
    account_recovery_organization_revoked_key: revokedAccountRecoveryOrganizationPublicKeyDto(),
    account_recovery_private_key_passwords: [
      defaultAccountRecoveryPrivateKeyPasswordDto()
    ]
  });

  return Object.assign(defaultData, data || {});
};
