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

import {createAccountRecoveryOrganizationPublicKeyDto} from "./accountRecoveryOrganizationPublicKeyEntity.test.data";

export const changeToADisabledAccountRecoveryOrganizationPolicyDto = (data = {}) => {
  const defaultData = {
    policy: "disabled",
  };

  return Object.assign(defaultData, data);
};

export const changeAnEnabledAccountRecoveryOrganizationPolicyTypeDto = (data = {}) => {
  const defaultData = {
    policy: "mandatory",
  };

  return Object.assign(defaultData, data);
};


// Enabled account recovery organization policy

export const changeToAndEnabledAccountRecoveryOrganizationPolicyDto = (data = {}) => {
  const defaultData = changeAnEnabledAccountRecoveryOrganizationPolicyTypeDto({
    account_recovery_organization_public_key: createAccountRecoveryOrganizationPublicKeyDto(),
  });

  return Object.assign(defaultData, data);
};

export const rotateAccountRecoveryOrganizationPolicyKeyDto = (data = {}) => {
  const defaultData = {
    account_recovery_organization_public_key: createAccountRecoveryOrganizationPublicKeyDto(),
  };

  return Object.assign(defaultData, data);
};
